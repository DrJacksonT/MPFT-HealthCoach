import * as OTPAuth from "otpauth";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function responseCookies(response: Response) {
  return response.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");
}

function cookieValue(cookies: string, name: string) {
  const entry = cookies
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

async function login(
  origin: string,
  identity: string,
  password: string,
) {
  const response = await fetch(`${origin}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({ identityKind: "alias", identity, password }),
    redirect: "manual",
  });
  const body = (await response.json().catch(() => null)) as
    | { mfaRequired?: boolean }
    | null;
  if (!response.ok) throw new Error(`Login failed with HTTP ${response.status}.`);
  return { cookies: responseCookies(response), mfaRequired: body?.mfaRequired === true };
}

async function requirePage(origin: string, path: string, cookies: string) {
  const response = await fetch(`${origin}${path}`, {
    headers: { cookie: cookies },
    redirect: "manual",
  });
  if (response.status !== 200)
    throw new Error(`${path} returned HTTP ${response.status} instead of 200.`);
}

async function main() {
  const origin = required("DEPLOYMENT_ORIGIN").replace(/\/$/, "");
  const participant = await login(
    origin,
    required("SMOKE_PARTICIPANT_IDENTITY"),
    required("SMOKE_PARTICIPANT_PASSWORD"),
  );
  if (participant.mfaRequired)
    throw new Error("Participant login unexpectedly requested staff MFA.");
  await requirePage(origin, "/participant", participant.cookies);

  const staff = await login(
    origin,
    required("SMOKE_STAFF_IDENTITY"),
    required("SMOKE_STAFF_PASSWORD"),
  );
  if (!staff.mfaRequired) throw new Error("Staff login did not request MFA.");
  const csrf = cookieValue(staff.cookies, "mpft_csrf");
  if (!csrf) throw new Error("Staff login did not issue a CSRF cookie.");
  const secret = OTPAuth.Secret.fromBase32(required("SMOKE_STAFF_TOTP_SECRET"));
  const token = new OTPAuth.TOTP({
    issuer: "MPFT Behaviour Change Research",
    label: required("SMOKE_STAFF_IDENTITY"),
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  }).generate();
  const mfaResponse = await fetch(`${origin}/api/auth/mfa`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: staff.cookies,
      origin,
      "x-csrf-token": csrf,
    },
    body: JSON.stringify({ token }),
    redirect: "manual",
  });
  if (!mfaResponse.ok)
    throw new Error(`Staff MFA failed with HTTP ${mfaResponse.status}.`);
  await requirePage(origin, "/staff", responseCookies(mfaResponse));
  console.log("Deployment authentication smoke test passed for participant and MFA-gated staff access.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Deployment authentication smoke test failed.");
  process.exitCode = 1;
});
