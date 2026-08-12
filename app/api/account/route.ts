import { z } from "zod";
import { demoStateSchema } from "@/src/domain/state-schema";
import {
  accountInsights,
  createAccountForRequest,
  deleteAccount,
  getAccountForRequest,
  readAccountState,
  saveAccountState,
} from "@/src/infrastructure/accounts";

const noStore = { "cache-control": "no-store, max-age=0", pragma: "no-cache" };
const createSchema = z.object({
  acceptsHealthDataStorage: z.literal(true),
  state: demoStateSchema.optional(),
});

export async function GET(request: Request) {
  try {
    const account = await getAccountForRequest(request);
    if (!request.headers.get("oai-authenticated-user-id"))
      return Response.json(
        { kind: "authentication-required", account: null },
        { status: 401, headers: noStore },
      );
    if (!account)
      return Response.json({ kind: "account", account: null }, { headers: noStore });
    return Response.json(
      {
        kind: "account",
        account: {
          alias: account.alias,
          createdAt: account.created_at,
          consentVersion: account.consent_version,
        },
        state: await readAccountState(account.id),
        insights: await accountInsights(account.id),
      },
      { headers: noStore },
    );
  } catch {
    return Response.json(
      { kind: "error", message: "Account storage is unavailable." },
      { status: 503, headers: noStore },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return Response.json({ kind: "error" }, { status: 415, headers: noStore });
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success)
      return Response.json(
        { kind: "error", message: "Health-data storage consent is required." },
        { status: 400, headers: noStore },
      );
    const account = await createAccountForRequest(request);
    if (!account)
      return Response.json(
        { kind: "authentication-required" },
        { status: 401, headers: noStore },
      );
    if (parsed.data.state && !parsed.data.state.synthetic)
      await saveAccountState(account.id, parsed.data.state);
    return Response.json(
      {
        kind: "account",
        account: {
          alias: account.alias,
          createdAt: account.created_at,
          consentVersion: account.consent_version,
        },
      },
      { status: 201, headers: noStore },
    );
  } catch {
    return Response.json(
      { kind: "error", message: "We could not create the profile." },
      { status: 503, headers: noStore },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const account = await getAccountForRequest(request);
    if (!account)
      return Response.json(
        { kind: "authentication-required" },
        { status: 401, headers: noStore },
      );
    const parsed = demoStateSchema.safeParse(await request.json());
    if (!parsed.success || parsed.data.synthetic)
      return Response.json(
        { kind: "error", message: "The profile data is not valid." },
        { status: 400, headers: noStore },
      );
    await saveAccountState(account.id, parsed.data);
    return Response.json({ kind: "saved" }, { headers: noStore });
  } catch {
    return Response.json(
      { kind: "error", message: "We could not save the profile." },
      { status: 503, headers: noStore },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const account = await getAccountForRequest(request);
    if (!account)
      return Response.json(
        { kind: "authentication-required" },
        { status: 401, headers: noStore },
      );
    await deleteAccount(account.id);
    return Response.json({ kind: "deleted" }, { headers: noStore });
  } catch {
    return Response.json(
      { kind: "error", message: "We could not delete the profile." },
      { status: 503, headers: noStore },
    );
  }
}
