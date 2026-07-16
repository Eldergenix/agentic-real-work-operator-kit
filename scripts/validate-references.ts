import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

type CsvRow = Record<string, string>;

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = "";
    } else if (char === '\n') {
      row.push(field.replace(/\r$/u, ""));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("Malformed CSV: unterminated quoted field");
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/u, ""));
    rows.push(row);
  }
  const [header, ...data] = rows;
  if (!header) return [];
  return data.map((values, rowIndex) => {
    if (values.length !== header.length) {
      throw new Error(`Malformed CSV row ${rowIndex + 2}: expected ${header.length} columns, received ${values.length}`);
    }
    return Object.fromEntries(header.map((column, columnIndex) => [column, values[columnIndex] ?? ""]));
  });
}

function assertUnique(rows: CsvRow[], field: string, label: string): void {
  const seen = new Set<string>();
  for (const row of rows) {
    const value = row[field]?.trim();
    if (!value) throw new Error(`${label} row is missing ${field}`);
    if (seen.has(value)) throw new Error(`${label} contains duplicate ${field}: ${value}`);
    seen.add(value);
  }
}

function assertHttps(url: string, label: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label} is not a valid URL: ${url}`);
  }
  if (parsed.protocol !== "https:") throw new Error(`${label} must use HTTPS: ${url}`);
}

const researchCsv = await readFile(join(root, "references/RESEARCH_INDEX.csv"), "utf8");
const reposCsv = await readFile(join(root, "references/RELATED_REPOS.csv"), "utf8");
const researchMarkdown = await readFile(join(root, "references/RESEARCH_LINKS.md"), "utf8");
const reposMarkdown = await readFile(join(root, "references/GITHUB_REPOSITORIES.md"), "utf8");
const bibliography = await readFile(join(root, "references/REFERENCES.bib"), "utf8");
const sourceVerification = await readFile(join(root, "references/SOURCE_VERIFICATION.md"), "utf8");

const research = parseCsv(researchCsv);
const repositories = parseCsv(reposCsv);

if (research.length < 25) throw new Error(`Research index is unexpectedly small: ${research.length}`);
if (repositories.length < 20) throw new Error(`Repository index is unexpectedly small: ${repositories.length}`);

for (const column of ["id", "title", "year", "status", "url", "implementation_relevance", "adoption_rule"]) {
  if (!(column in (research[0] ?? {}))) throw new Error(`Research CSV is missing column ${column}`);
}
for (const column of ["id", "repository", "category", "url", "relevance", "adoption_rule"]) {
  if (!(column in (repositories[0] ?? {}))) throw new Error(`Repository CSV is missing column ${column}`);
}

assertUnique(research, "id", "research index");
assertUnique(research, "url", "research index");
assertUnique(repositories, "id", "repository index");
assertUnique(repositories, "url", "repository index");

for (const row of research) {
  const id = row["id"]?.trim() ?? "";
  const url = row["url"]?.trim() ?? "";
  if (!/^R\d{2}$/u.test(id)) throw new Error(`Invalid research ID: ${id}`);
  assertHttps(url, `Research ${id} URL`);
  if (!researchMarkdown.includes(`| ${id} |`)) throw new Error(`Research ${id} is absent from RESEARCH_LINKS.md`);
  if (!researchMarkdown.includes(url)) throw new Error(`Research ${id} URL is absent from RESEARCH_LINKS.md`);
  const identifier = url.match(/arxiv\.org\/abs\/(\d{4}\.\d{4,5})/u)?.[1];
  if (identifier && !bibliography.includes(identifier)) {
    throw new Error(`ArXiv source ${id} (${identifier}) is absent from REFERENCES.bib`);
  }
}

for (const row of repositories) {
  const id = row["id"]?.trim() ?? "";
  const url = row["url"]?.trim() ?? "";
  if (!/^G\d{2}$/u.test(id)) throw new Error(`Invalid repository ID: ${id}`);
  assertHttps(url, `Repository ${id} URL`);
  if (new URL(url).hostname !== "github.com") throw new Error(`Repository ${id} is not a GitHub URL: ${url}`);
  if (!reposMarkdown.includes(`| ${id} |`)) throw new Error(`Repository ${id} is absent from GITHUB_REPOSITORIES.md`);
  if (!reposMarkdown.includes(url)) throw new Error(`Repository ${id} URL is absent from GITHUB_REPOSITORIES.md`);
}

for (const requiredStatement of [
  "Source verification does not reproduce experimental results",
  "pin and review an exact commit before adoption",
  "Official API documentation must be re-read immediately before implementation and release",
]) {
  if (!sourceVerification.includes(requiredStatement)) {
    throw new Error(`SOURCE_VERIFICATION.md is missing required limitation: ${requiredStatement}`);
  }
}

console.log(
  JSON.stringify({
    event: "operator_references_validated",
    researchSources: research.length,
    repositories: repositories.length,
  }),
);
