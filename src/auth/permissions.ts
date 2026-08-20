export const roles = [
  "participant",
  "researcher",
  "safety_reviewer",
  "evidence_reviewer",
  "administrator",
] as const;

export type Role = (typeof roles)[number];
export type Permission =
  | "participant:self"
  | "research:deidentified"
  | "safety:review"
  | "evidence:review"
  | "configuration:manage"
  | "identity:privileged"
  | "exports:create"
  | "exports:raw_text";

const permissions: Record<Role, ReadonlySet<Permission>> = {
  participant: new Set(["participant:self"]),
  researcher: new Set(["research:deidentified", "exports:create"]),
  safety_reviewer: new Set(["research:deidentified", "safety:review"]),
  evidence_reviewer: new Set(["evidence:review"]),
  administrator: new Set([
    "research:deidentified",
    "safety:review",
    "evidence:review",
    "configuration:manage",
    "identity:privileged",
    "exports:create",
    "exports:raw_text",
  ]),
};

export function hasPermission(userRoles: readonly string[], permission: Permission) {
  return userRoles.some(
    (role) => roles.includes(role as Role) && permissions[role as Role].has(permission),
  );
}

export function isStaff(userRoles: readonly string[]) {
  return userRoles.some((role) => role !== "participant" && roles.includes(role as Role));
}
