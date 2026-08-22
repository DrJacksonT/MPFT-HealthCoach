# Account and login setup

The sign-in form does not create credentials by itself. There are two supported account routes:

- A fictional participant receives an invitation code, opens `/register`, and chooses an alias and password.
- A staff account is created by an operator with `npm run account:provision`. Staff also receive an authenticator secret and must enter a current six-digit TOTP code after their password.

All supplied studies and accounts are synthetic. These steps do not authorise real recruitment or real health data.

## Local fictional participant

After `npm run db:migrate` and `npm run db:seed`, sign in with alias `rowan-fictional-01` and password `Fictional-only-2026!`.

To make another fictional participant account, open `/register` and use invitation code `SMOKE-FICTIONAL-2026`. Choose a new fictional alias, display name, and password of at least 12 characters. The alias and password become that account's credentials.

## Production encryption key

Production staff TOTP secrets are encrypted with AES-256-GCM before storage. Generate a dedicated 32-byte base64url key:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Store that result as the sensitive `MFA_ENCRYPTION_KEY` environment variable and in the approved secrets manager. Keep `STAFF_MFA_PROVIDER=totp`. Vercel does not reveal sensitive values after storage, so the operator must load the same key into the provisioning shell. Losing or rotating this key invalidates existing staff authenticators; reprovision every staff account deliberately when rotation is required.

## Provision a deployed staff account

The provisioning command requires an explicit PostgreSQL `DATABASE_URL`. It does not accept a database URL on the command line, and it never stores plaintext passwords or TOTP secrets.

For the linked Vercel project, pull production variables into a temporary ignored file, load the existing MFA key from the approved secrets manager, set the non-secret account fields, and run the command:

```powershell
npx vercel env pull .env.vercel-production --environment=production --yes
$env:MFA_ENCRYPTION_KEY='<same value stored in Vercel and the approved secrets manager>'
$env:ACCOUNT_IDENTITY_KIND='alias'
$env:ACCOUNT_IDENTITY='project-admin'
$env:ACCOUNT_DISPLAY_NAME='Project administrator'
$env:ACCOUNT_ROLE='administrator'
node --env-file=.env.vercel-production --import tsx scripts/provision-account.ts
Remove-Item -LiteralPath .env.vercel-production
```

Vercel's placeholder values for hidden sensitive variables are not usable secrets; the explicit shell value above overrides the placeholder for this one command. If `ACCOUNT_PASSWORD` is omitted, the command generates and prints a strong password once. For staff, it also prints an authenticator secret and `otpauth://` URI once. Store both immediately in the approved password manager. The database retains only an Argon2id password hash and the encrypted TOTP secret.

Supported roles are `participant`, `researcher`, `safety_reviewer`, `evidence_reviewer`, and `administrator`. The default study is `SMOKE-PILOT-SYNTHETIC`; override it with `ACCOUNT_STUDY_CODE` when required.

To deliberately rotate an existing account's password and staff authenticator, set `ACCOUNT_UPDATE_EXISTING=true` and run the same command. This revokes active sessions. Without that flag, the command refuses to overwrite an existing identity.

Clear account variables from the shell after provisioning:

```powershell
Remove-Item Env:MFA_ENCRYPTION_KEY, Env:ACCOUNT_IDENTITY_KIND, Env:ACCOUNT_IDENTITY, Env:ACCOUNT_DISPLAY_NAME, Env:ACCOUNT_ROLE, Env:ACCOUNT_PASSWORD, Env:ACCOUNT_UPDATE_EXISTING -ErrorAction SilentlyContinue
```

The operator can verify both protected routes after deployment with `npm run auth:smoke:deployment`. Supply `DEPLOYMENT_ORIGIN`, `SMOKE_PARTICIPANT_IDENTITY`, `SMOKE_PARTICIPANT_PASSWORD`, `SMOKE_STAFF_IDENTITY`, `SMOKE_STAFF_PASSWORD`, and `SMOKE_STAFF_TOTP_SECRET` as temporary shell variables. The command does not print those values.

## Participant invitations

The deterministic synthetic seed creates the `SMOKE-FICTIONAL-2026` invitation for technical testing. Do not publish invitation codes in the application or reuse this deterministic seed for a real pilot. A live invitation-management process requires named approval, expiry, role scope, revocation, secure delivery, and the recruitment release gate.
