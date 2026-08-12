import { evidenceBriefRequestSchema } from "@/src/ai/schemas";
import { generateEvidenceBrief } from "@/src/ai/evidence-brief";
import { findEvidence } from "@/src/data/evidence";
import { addTelemetry } from "@/src/telemetry/store";
import {
  getSafetyIdentifier,
  recordAccountUsage,
} from "@/src/infrastructure/accounts";

const noStore = { "cache-control": "no-store, max-age=0", pragma: "no-cache" };

export async function POST(request: Request) {
  const started = Date.now();
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return Response.json(
      { kind: "error", message: "Requests must use application/json." },
      { status: 415, headers: noStore },
    );
  if (Number(request.headers.get("content-length") ?? 0) > 16_000)
    return Response.json(
      { kind: "error", message: "That request is too large." },
      { status: 413, headers: noStore },
    );
  try {
    const parsed = evidenceBriefRequestSchema.safeParse(await request.json());
    if (!parsed.success)
      return Response.json(
        { kind: "error", message: "The evidence request is not valid." },
        { status: 400, headers: noStore },
      );
    const evidence = findEvidence(parsed.data.evidenceIds);
    if (!evidence.length)
      return Response.json(
        { kind: "error", message: "No eligible evidence was selected." },
        { status: 400, headers: noStore },
      );
    const result = await generateEvidenceBrief(
      evidence,
      parsed.data.context,
      await getSafetyIdentifier(request),
    );
    const usage = result.usage as {
      input_tokens?: number;
      output_tokens?: number;
    } | null;
    const telemetry = {
      at: new Date().toISOString(),
      model: result.model,
      inputTokens: usage?.input_tokens ?? 0,
      outputTokens: usage?.output_tokens ?? 0,
      latencyMs: result.latencyMs,
      ok: true,
    };
    addTelemetry(telemetry);
    await recordAccountUsage(request, "evidence-summary", telemetry).catch(
      () => undefined,
    );
    return Response.json(
      {
        kind: "evidence-brief",
        generatedBy:
          result.model === "approved-template" ? "reviewed-template" : "ai",
        ...result.output,
      },
      { headers: noStore },
    );
  } catch {
    const telemetry = {
      at: new Date().toISOString(),
      model:
        process.env.OPENAI_EVIDENCE_MODEL ??
        process.env.OPENAI_COACH_MODEL ??
        "gpt-5.6-luna",
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - started,
      ok: false,
    };
    addTelemetry(telemetry);
    await recordAccountUsage(request, "evidence-summary", telemetry).catch(
      () => undefined,
    );
    return Response.json(
      {
        kind: "error",
        message:
          "We could not prepare the plain-English evidence briefing just now.",
      },
      { status: 503, headers: noStore },
    );
  }
}
