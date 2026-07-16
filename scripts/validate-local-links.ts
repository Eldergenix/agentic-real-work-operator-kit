import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const historicalFiles = new Set([
  "docs/20_FRONTIER_V3_SOURCE.md",
  "docs/source/FRONTIER_V3_RESEARCH_AMENDMENT.md",
]);

const markdownFiles = (await walk(root)).filter((path) => extname(path).toLowerCase() === ".md");
const failures: Array<{ file: string; target: string }> = [];
let checked = 0;
let skippedHistorical = 0;

for (const file of markdownFiles) {
  const rel = relative(root, file).replaceAll("\\", "/");
  if (historicalFiles.has(rel)) {
    skippedHistorical += 1;
    continue;
  }

  const source = stripCode(await readFile(file, "utf8"));
  const links = extractMarkdownLinks(source);
  for (const rawTarget of links) {
    const target = rawTarget.trim().replace(/^<|>$/gu, "").split(/\s+/u)[0] ?? "";
    if (
      target.length === 0 ||
      target.startsWith("#") ||
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      target.startsWith("sandbox:") ||
      target.startsWith("data:")
    ) {
      continue;
    }

    let decoded: string;
    try {
      decoded = decodeURIComponent(target.split("#", 1)[0]?.split("?", 1)[0] ?? "");
    } catch {
      failures.push({ file: rel, target });
      continue;
    }
    if (decoded.length === 0) continue;

    const absolute = resolve(dirname(file), normalize(decoded));
    if (!absolute.startsWith(root)) {
      failures.push({ file: rel, target: `${target} (escapes package root)` });
      continue;
    }
    checked += 1;
    try {
      await stat(absolute);
    } catch {
      failures.push({ file: rel, target });
    }
  }
}

if (failures.length > 0) {
  throw new Error(
    `Broken local Markdown links:\n${failures.map(({ file, target }) => `- ${file} -> ${target}`).join("\n")}`,
  );
}

console.log(
  JSON.stringify({
    event: "operator_local_links_validated",
    markdownFiles: markdownFiles.length,
    checked,
    skippedHistorical,
  }),
);

function stripCode(source: string): string {
  return source
    .replace(/```[\s\S]*?```/gu, "")
    .replace(/~~~[\s\S]*?~~~/gu, "")
    .replace(/`[^`\n]*`/gu, "");
}

function extractMarkdownLinks(source: string): string[] {
  const results: string[] = [];
  const expression = /(?<!!)\[[^\]]*\]\(([^)]+)\)/gu;
  for (const match of source.matchAll(expression)) {
    const target = match[1];
    if (target) results.push(target);
  }
  return results;
}

async function walk(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "dist-worker", "coverage", ".wrangler"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(path)));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}
