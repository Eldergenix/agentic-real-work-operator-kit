#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const EXPECTED_PROJECT_REF = "ofdpxewtmtdsunjzhweu";
const ALLOWLIST = [
  "20260715125000_operator_intent_plan.sql",
  "20260715130000_operator_mandates.sql",
  "20260715140000_operator_action_events.sql",
  "20260715150000_operator_outcome_memory_models.sql",
];
const apply = process.argv.includes("--apply");
const acknowledged = process.argv.includes("--ack-backup-and-rollback");
const projectRefIndex = process.argv.indexOf("--project-ref");
const projectRef = projectRefIndex >= 0 ? process.argv[projectRefIndex + 1] : process.env.SUPABASE_PROJECT_REF;

if (projectRef !== EXPECTED_PROJECT_REF) {
  console.error(`Refusing migration release: expected project ref ${EXPECTED_PROJECT_REF}, received ${projectRef ?? "none"}.`);
  process.exit(2);
}

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  projectRef,
  migrationAllowlist: ALLOWLIST,
}, null, 2));

const list = spawnSync("npx", ["supabase", "migration", "list", "--linked"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (list.status !== 0) process.exit(list.status ?? 1);

if (!apply) {
  console.log("Dry run complete. Review the linked migration list against the exact allowlist above.");
  process.exit(0);
}
if (!acknowledged) {
  console.error("Refusing apply: pass --ack-backup-and-rollback only after staging, backup, RLS, drift, and rollback evidence are recorded.");
  process.exit(3);
}

// `db push --include-all` is intentionally not used: it can apply unrelated
// pending migrations. The target repository should generate a reviewed bundle
// or use its release system to apply exactly the allowlisted files.
console.error("Apply mode intentionally stops before mutation. Integrate the allowlist with Operator Kit's reviewed migration executor; never issue an unconditional linked db push.");
process.exit(4);
