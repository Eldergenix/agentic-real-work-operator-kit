import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, relative } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const required = [
  "README.md",
  "PACKAGE_MANIFEST.md",
  "STATUS_AND_ASSUMPTIONS.md",
  "INTEGRATION_NOTICE.md",
  "REVIEW_GUIDE.md",
  "AGENT_IMPLEMENTATION_PROMPT.md",
  "docs/00_MASTER_IMPLEMENTATION_PLAN.md",
  "docs/01_FEATURE_AND_FUNCTIONAL_SPEC.md",
  "docs/02_SYSTEM_ARCHITECTURE.md",
  "docs/03_INTENT_COMPILER_AND_PLAN_IR.md",
  "docs/04_AUTHORITY_CAPABILITY_AND_RISK.md",
  "docs/05_BROKER_LIFECYCLE_AND_RECOVERY.md",
  "docs/06_PROVIDER_ADAPTER_STANDARD.md",
  "docs/07_HUMAN_CONTEXT_MEMORY_AND_CONSENT.md",
  "docs/08_WORLD_MODEL_AND_ML_ROADMAP.md",
  "docs/09_EVALUATION_PROMOTION_AND_STATISTICS.md",
  "docs/10_SECURITY_THREAT_MODEL.md",
  "docs/11_FORMAL_VERIFICATION.md",
  "docs/12_CLOUDFLARE_SUPABASE_AND_DEPLOYMENT.md",
  "docs/13_OPERATOR_UX_IMPLEMENTATION.md",
  "docs/14_DOMAIN_IMPLEMENTATION_WAVES.md",
  "docs/15_TEST_AND_QUALIFICATION_PLAN.md",
  "docs/16_OPERATIONS_AND_INCIDENT_RUNBOOK.md",
  "docs/21_IMPLEMENTATION_BACKLOG.md",
  "docs/22_ACCEPTANCE_AND_TRACEABILITY.md",
  "docs/24_CODEBASE_INTEGRATION_SEQUENCE.md",
  "docs/25_DOMAIN_ACTION_REGISTRY.md",
  "planning/FEATURE_CATALOG.yaml",
  "planning/WORK_BREAKDOWN.yaml",
  "planning/ACCEPTANCE_MATRIX.csv",
  "references/RESEARCH_INDEX.csv",
  "references/RESEARCH_LINKS.md",
  "references/RELATED_REPOS.csv",
  "references/GITHUB_REPOSITORIES.md",
  "references/OFFICIAL_PLATFORM_DOCS.md",
  "references/DESIGN_DECISION_MAP.md",
  "references/SOURCE_VERIFICATION.md",
  "references/REFERENCES.bib",
  "openapi/operator-api.yaml",
  "ml/model-tournament.yaml",
  "ml/promotion-policy.yaml",
  "provider-sim/scenarios.yaml",
  "provider-sim/calendar-server.mjs",
  "scripts/smoke-provider-simulator.mjs",
  "mobile/operator-ui-state.schema.json",
  "mobile/expo-device-command/Package.swift",
  "mobile/expo-device-command/package.json",
  "mobile/expo-device-command/expo-module.config.json",
  "mobile/expo-device-command/ios/OperatorDeviceCommandModule.swift",
  "mobile/expo-device-command/android/src/main/java/expo/modules/operatordevicecommand/OperatorDeviceCommandModule.kt",
  "mobile/expo-device-command/Sources/OperatorDeviceCommand/DeviceCommandValidator.swift",
  "mobile/expo-device-command/Tests/OperatorDeviceCommandTests/DeviceCommandValidatorTests.swift",
  "src/lib/operator/goal-spec.ts",
  "src/lib/operator/plan-ir.ts",
  "src/lib/operator/provenance.ts",
  "src/lib/operator/authorization-gate.ts",
  "src/lib/operator/broker.ts",
  "src/lib/operator/lifecycle.ts",
  "src/lib/operator/device-command.ts",
  "src/lib/operator/domain-manifest.ts",
  "src/lib/operator/provider-fault-simulator.ts",
  "src/lib/operator/ui-projection.ts",
  "src/lib/operator/adapters/google-calendar.ts",
  "infra/cloudflare/operator/src/index.ts",
  "infra/cloudflare/operator/src/lease-coordinator.ts",
  "infra/cloudflare/operator/wrangler.jsonc",
  "supabase/migrations/20260715125000_operator_intent_plan.sql",
  "supabase/migrations/20260715130000_operator_mandates.sql",
  "supabase/migrations/20260715140000_operator_action_events.sql",
  "supabase/migrations/20260715150000_operator_outcome_memory_models.sql",
  "supabase/tests/001_schema_and_security_contract.sql",
  "supabase/tests/002_lifecycle_contract.sql",
  "supabase/tests/003_rls_contract.sql",
  "supabase/tests/010_pgtap_schema_and_rls.sql",
  "supabase/tests/011_pgtap_lifecycle.sql",
  "supabase/tests/012_pgtap_append_only_and_functions.sql",
  "supabase/tests/013_pgtap_budget_reservation.sql",
  "supabase/tests/020_operator_qualification_template.sql",
  "specs/tla/ActionLifecycle.tla",
  "specs/tla/BudgetReservation.tla",
  "specs/tla/IntentInterruption.tla",
  "specs/tla/RevocationEpoch.tla",
  ".github/workflows/operator-ci.yml",
  "evidence/VALIDATION_REPORT.md",
];

for (const path of required) {
  try {
    const info = await stat(join(root, path));
    if (!info.isFile()) throw new Error("not a file");
  } catch {
    throw new Error(`Required package file is missing: ${path}`);
  }
}

const files = await walk(root);
if (files.some((file) => relative(root, file).replaceAll("\\", "/").startsWith("node_modules/"))) {
  throw new Error("node_modules must not be part of the distributable package");
}

const textExtensions = new Set([
  ".bib",
  ".csv",
  ".json",
  ".jsonc",
  ".md",
  ".mjs",
  ".sql",
  ".swift",
  ".kt",
  ".tla",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const forbiddenPatterns: Array<[RegExp, string]> = [
  [/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/u, "private key"],
  [/\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/u, "OpenAI-style API secret"],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/u, "GitHub token"],
  [/\bAKIA[0-9A-Z]{16}\b/u, "AWS access key"],
  [/\bxox[baprs]-[A-Za-z0-9-]{20,}\b/u, "Slack token"],
  [/SUPABASE_SERVICE_ROLE_KEY\s*[=:]\s*["'][A-Za-z0-9._-]{20,}["']/u, "embedded Supabase service key"],
  [/Authorization\s*:\s*["']Bearer\s+[A-Za-z0-9._-]{24,}["']/u, "embedded bearer token"],
];

let byteCount = 0;
const digest = createHash("sha256");
for (const file of files.sort()) {
  const rel = relative(root, file).replaceAll("\\", "/");
  const buffer = await readFile(file);
  byteCount += buffer.byteLength;
  digest.update(rel);
  digest.update("\0");
  digest.update(buffer);
  if (!textExtensions.has(extname(file).toLowerCase())) continue;
  const text = buffer.toString("utf8");
  if (extname(file).toLowerCase() === ".json") {
    try {
      JSON.parse(text);
    } catch (error) {
      throw new Error(`Invalid JSON in ${rel}: ${error instanceof Error ? error.message : "unknown"}`);
    }
  }
  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(text)) throw new Error(`Possible ${label} found in ${rel}`);
  }
}

const migrationDir = join(root, "supabase/migrations");
const migrationNames = (await readdir(migrationDir)).filter((name) => name.endsWith(".sql"));
const prefixes = new Set<string>();
for (const name of migrationNames) {
  const prefix = name.split("_", 1)[0] ?? "";
  if (!/^\d{14}$/u.test(prefix)) throw new Error(`Invalid migration timestamp prefix: ${name}`);
  if (prefixes.has(prefix)) throw new Error(`Duplicate migration timestamp prefix: ${prefix}`);
  prefixes.add(prefix);
}

const expectedMigrations = [
  "20260715125000_operator_intent_plan.sql",
  "20260715130000_operator_mandates.sql",
  "20260715140000_operator_action_events.sql",
  "20260715150000_operator_outcome_memory_models.sql",
];
if (JSON.stringify(migrationNames.sort()) !== JSON.stringify(expectedMigrations)) {
  throw new Error(`Unexpected migration set: ${migrationNames.sort().join(", ")}`);
}

const numberedDocs = (await readdir(join(root, "docs"))).filter((name) => /^\d{2}_.+\.md$/u.test(name));
const docPrefixes = new Map<string, string[]>();
for (const name of numberedDocs) {
  const prefix = name.slice(0, 2);
  docPrefixes.set(prefix, [...(docPrefixes.get(prefix) ?? []), name]);
}
const duplicateDocs = [...docPrefixes.entries()].filter(([, names]) => names.length > 1);
if (duplicateDocs.length > 0) {
  throw new Error(`Duplicate numbered documentation: ${duplicateDocs.map(([prefix, names]) => `${prefix}=[${names.join(", ")}]`).join("; ")}`);
}

const databaseTests = (await readdir(join(root, "supabase/tests"))).filter((name) => /^\d{3}_.+\.sql$/u.test(name));
const testPrefixes = new Map<string, string[]>();
for (const name of databaseTests) {
  const prefix = name.slice(0, 3);
  testPrefixes.set(prefix, [...(testPrefixes.get(prefix) ?? []), name]);
}
const duplicateDatabaseTests = [...testPrefixes.entries()].filter(([, names]) => names.length > 1);
if (duplicateDatabaseTests.length > 0) {
  throw new Error(`Duplicate database-test numbering: ${duplicateDatabaseTests.map(([prefix, names]) => `${prefix}=[${names.join(", ")}]`).join("; ")}`);
}

const lifecycleSql = await readFile(
  join(root, "supabase/migrations/20260715140000_operator_action_events.sql"),
  "utf8",
);
for (const rpc of [
  "operator_create_action",
  "operator_append_action_event",
  "operator_reserve",
  "operator_transition_reservation",
]) {
  if (!lifecycleSql.includes(`function operator.${rpc}`)) {
    throw new Error(`Lifecycle migration is missing RPC ${rpc}`);
  }
}
if (/create\s+trigger\s+([a-z0-9_]+)[\s\S]{0,120}?create\s+trigger\s+\1/iu.test(lifecycleSql)) {
  throw new Error("Duplicated trigger declaration detected");
}

const allSql = await Promise.all(migrationNames.map((name) => readFile(join(migrationDir, name), "utf8")));
if (allSql.some((text) => /create\s+(?:table|function|schema)\s+(?:if\s+not\s+exists\s+)?public\.operator_/iu.test(text))) {
  throw new Error("Operator authority objects must not be created under public.operator_ names");
}

const memorySql = await readFile(
  join(root, "supabase/migrations/20260715150000_operator_outcome_memory_models.sql"),
  "utf8",
);
if (!memorySql.includes("create trigger memory_items_immutable")) {
  throw new Error("Memory items must have an append-only update/delete trigger");
}
if (await fileExists(join(root, "infra/cloudflare/operator/src/action-coordinator.ts"))) {
  throw new Error("Unused competing Durable Object coordinator must not be present");
}

const workerConfig = await readFile(join(root, "infra/cloudflare/operator/wrangler.jsonc"), "utf8");
for (const requirement of ["nodejs_compat", "observability", "durable_objects", "services", "workers_dev"]) {
  if (!workerConfig.includes(`\"${requirement}\"`)) {
    throw new Error(`Worker configuration is missing ${requirement}`);
  }
}

if (!workerConfig.includes('"workers_dev": false')) {
  throw new Error("Private operator Worker must set workers_dev=false");
}
if (/"routes?"\s*:/u.test(workerConfig)) {
  throw new Error("Private operator Worker must not define public routes");
}

console.log(
  JSON.stringify({
    event: "operator_package_validated",
    files: files.length,
    bytes: byteCount,
    migrations: migrationNames.length,
    contentDigest: digest.digest("hex"),
  }),
);

async function walk(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "dist-worker", "coverage", ".wrangler", ".build", ".swiftpm"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(path)));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
