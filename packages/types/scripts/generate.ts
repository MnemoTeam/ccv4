import { compile } from "json-schema-to-typescript";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaDir = resolve(__dirname, "../../../schema");
const outFile = resolve(__dirname, "../src/v4.generated.ts");

async function main() {
  const schema = JSON.parse(
    readFileSync(resolve(schemaDir, "character-card-v4.schema.json"), "utf-8")
  );

  // Resolve $refs by providing a cwd
  const ts = await compile(schema, "CharacterCardV4", {
    cwd: schemaDir,
    bannerComment: "/* Auto-generated from JSON Schema. Do not edit. */",
    additionalProperties: false,
    style: {
      semi: true,
      singleQuote: false,
    },
  });

  writeFileSync(outFile, ts, "utf-8");
  console.log(`Generated types written to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
