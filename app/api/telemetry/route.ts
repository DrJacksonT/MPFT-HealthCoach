import { telemetrySummary } from "@/src/telemetry/store";
export async function GET() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DEV_ADMIN !== "true"
  )
    return new Response("Not found", { status: 404 });
  return Response.json(telemetrySummary(), {
    headers: { "cache-control": "no-store, max-age=0" },
  });
}
