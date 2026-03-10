import { Command } from "commander";
import { readFileSync, writeFileSync } from "node:fs";
import { detectVersion } from "@character-card/validator";
import {
  migrateV1toV4,
  migrateV2toV4,
  migrateV3toV4,
  migrateV4toV2,
  migrateV4toV3,
} from "@character-card/migrate";

export const migrateCommand = new Command("migrate")
  .description("Migrate a character card between versions")
  .argument("<file>", "Path to input JSON file")
  .option("-o, --output <file>", "Output file path (default: stdout)")
  .option("--to <version>", "Target version: v2, v3, v4 (default: v4)", "v4")
  .action((file: string, opts: { output?: string; to: string }) => {
    try {
      const content = readFileSync(file, "utf-8");
      const data = JSON.parse(content);
      const version = detectVersion(data);

      let result: unknown;

      if (opts.to === "v4") {
        switch (version) {
          case "v1":
            result = migrateV1toV4(data);
            break;
          case "v2":
            result = migrateV2toV4(data);
            break;
          case "v3":
            result = migrateV3toV4(data);
            break;
          case "v4":
            console.log("Card is already V4.");
            result = data;
            break;
          default:
            console.error(`Unknown card version. Cannot migrate.`);
            process.exit(1);
        }
      } else if (opts.to === "v3") {
        if (version !== "v4") {
          console.error("Can only export to V3 from a V4 card. Migrate to V4 first.");
          process.exit(1);
        }
        result = migrateV4toV3(data);
      } else if (opts.to === "v2") {
        if (version !== "v4") {
          console.error("Can only export to V2 from a V4 card. Migrate to V4 first.");
          process.exit(1);
        }
        result = migrateV4toV2(data);
      } else {
        console.error(`Unknown target version: ${opts.to}`);
        process.exit(1);
      }

      const output = JSON.stringify(result, null, 2);

      if (opts.output) {
        writeFileSync(opts.output, output, "utf-8");
        console.log(`Written to ${opts.output}`);
      } else {
        console.log(output);
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });
