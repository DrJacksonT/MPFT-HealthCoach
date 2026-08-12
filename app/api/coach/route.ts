import { coachRequestSchema } from "@/src/ai/schemas";
import { generateCoachReply } from "@/src/ai/coach";
import { classifySafety, safetyResponse } from "@/src/domain/safety";
import { findEvidence } from "@/src/data/evidence";
import { addTelemetry } from "@/src/telemetry/store";

const attempts = new Map<string, { count: number; reset: number }>();
const noStore = { "cache-control": "no-store, max-age=0", pragma: "no-cache" };

function isRateLimited(request: Request) {
  const key =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    "local";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.reset < now) {
    attempts.set(key, { count: 1, reset: now + 10 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 20;
}

export async function POST(request: Request) {
  const started = Date.now();
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return Response.json(
      { kind: "error", message: "Requests must use application/json." },
      { status: 415, headers: noStore },
    );
  try {
    if (isRateLimited(request))
      return Response.json(
        {
          kind: "error",
          message: "Too many requests. Please wait before trying again.",
        },
        { status: 429, headers: noStore },
      );
    if (Number(request.headers.get("content-length") ?? 0) > 12000)
      return Response.json(
        { kind: "error", message: "That request is too large." },
        { status: 413, headers: noStore },
      );
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return Response.json(
        { kind: "error", message: "The request body is not valid JSON." },
        { status: 400, headers: noStore },
      );
    }
    const parsedBody = coachRequestSchema.safeParse(rawBody);
    if (!parsedBody.success)
      return Response.json(
        { kind: "error", message: "The request does not match the supported coach format." },
        { status: 400, headers: noStore },
      );
    const body = parsedBody.data;
    const safety = classifySafety(body.message);
    if (safety !== "supported")
      return Response.json(
        { kind: "boundary", message: safetyResponse(safety), citations: [] },
        { headers: noStore },
      );
    const evidence = findEvidence(body.evidenceIds);
    const result = await generateCoachReply(
      body.message,
      evidence,
      body.context,
    );
    const usage = result.usage as {
      input_tokens?: number;
      output_tokens?: number;
    } | null;
    addTelemetry({
      at: new Date().toISOString(),
      model: result.model,
      inputTokens: usage?.input_tokens ?? 0,
      outputTokens: usage?.output_tokens ?? 0,
      latencyMs: result.latencyMs,
      ok: true,
    });
    return Response.json(
      {
        kind: "coach",
        ...result.output,
        citations: evidence.map(
          ({ id, title, organisation, publicationYear, url }) => ({
            id,
            title,
            organisation,
            publicationYear,
            url,
          }),
        ),
      },
      { headers: noStore },
    );
  } catch {
    addTelemetry({
      at: new Date().toISOString(),
      model: process.env.OPENAI_COACH_MODEL ?? "gpt-5.6-luna",
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - started,
      ok: false,
    });
    return Response.json(
      {
        kind: "error",
        message:
          "I couldn’t produce a safely grounded answer. Try a guided topic or use the trusted resources instead.",
      },
      { status: 503, headers: noStore },
    );
  }
}
