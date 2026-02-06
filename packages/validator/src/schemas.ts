import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

function findSchemaDir(): string {
	// Works from both src/ and dist/ since tsup provides import.meta shim for CJS
	let dir: string;
	try {
		dir = dirname(fileURLToPath(import.meta.url));
	} catch {
		dir = __dirname;
	}
	const candidates = [
		resolve(dir, "../../../schema"),
		resolve(dir, "../../schema"),
	];
	for (const candidate of candidates) {
		try {
			readFileSync(resolve(candidate, "character-card-v4.schema.json"), "utf-8");
			return candidate;
		} catch {
			continue;
		}
	}
	throw new Error(`Could not find schema directory. Searched:\n${candidates.join("\n")}`);
}

let _schemas: ReturnType<typeof loadSchemas> | null = null;

function loadSchema(dir: string, name: string): Record<string, unknown> {
	return JSON.parse(readFileSync(resolve(dir, name), "utf-8")) as Record<string, unknown>;
}

function loadSchemas() {
	const dir = findSchemaDir();
	return {
		cardMeta: loadSchema(dir, "card-meta.schema.json"),
		cardData: loadSchema(dir, "card-data.schema.json"),
		assetEntry: loadSchema(dir, "asset-entry.schema.json"),
		lorebook: loadSchema(dir, "lorebook.schema.json"),
		lorebookEntry: loadSchema(dir, "lorebook-entry.schema.json"),
		cardVariable: loadSchema(dir, "card-variable.schema.json"),
		characterCard: loadSchema(dir, "character-card-v4.schema.json"),
		lorebookExport: loadSchema(dir, "lorebook-export-v4.schema.json"),
	};
}

export function getSchemas() {
	if (!_schemas) _schemas = loadSchemas();
	return _schemas;
}
