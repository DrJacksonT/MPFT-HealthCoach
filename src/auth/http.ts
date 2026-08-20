import { environment } from "@/src/config/environment";

export const noStoreHeaders = {
  "cache-control": "no-store, max-age=0",
  pragma: "no-cache",
};

export function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === environment().APP_ORIGIN;
}

export function genericAuthError() {
  return { ok: false, message: "We could not complete that request. Check the details and try again." };
}
