import { sql } from "drizzle-orm";
import { closeDb, databaseKind, getDb } from "../db/index";
import { firstQueryRow } from "../db/query-result";

async function main() {
  const db = await getDb();
  const result = await db.execute(sql`
    select
      (select count(*)::int from studies) as studies,
      (select count(*)::int from identity.users) as users,
      (select count(*)::int from research.participants) as participants,
      (select count(*)::int from research.participants where synthetic = false) as non_synthetic_participants,
      (select count(*)::int from identity.user_roles where role <> 'participant') as staff_roles,
      (select count(*)::int from releases
        where status = 'authorised'
          and release_type in ('participant_recruitment', 'live_ai', 'gambling_participant')) as authorised_live_releases
  `);
  const row = firstQueryRow<{
    studies: number;
    users: number;
    participants: number;
    non_synthetic_participants: number;
    staff_roles: number;
    authorised_live_releases: number;
  }>(result);
  if (!row || row.studies < 2 || row.users < 5 || row.participants < 1 || row.staff_roles < 4)
    throw new Error("Required fictional seed records are missing.");
  if (row.non_synthetic_participants !== 0)
    throw new Error("Local seed contains a non-synthetic participant.");
  if (row.authorised_live_releases !== 0)
    throw new Error("A live capability release is unexpectedly authorised.");
  console.log(`Verified ${databaseKind()} seed and fail-closed live releases:`, row);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Database verification failed.");
    process.exitCode = 1;
  })
  .finally(closeDb);
