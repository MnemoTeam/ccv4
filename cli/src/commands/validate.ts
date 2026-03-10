import { Command } from "commander";
import { readFileSync } from "node:fs";
import { validate, validateLorebook } from "@character-card/validator";

export const validateCommand = new Command("validate")
  .description("Validate a character card or lorebook against the V4 schema")
  .argument("<file>", "Path to JSON file")
  .option("--lorebook", "Validate as standalone lorebook")
  .action((file: string, opts: { lorebook?: boolean }) => {
    try {
      const content = readFileSync(file, "utf-8");
      const data = JSON.parse(content);

      const result = opts.lorebook ? validateLorebook(data) : validate(data);

      if (result.valid) {
        console.log("Valid!");
      } else {
        console.error("Validation failed:");
        for (const err of result.errors) {
          console.error(`  ${err.path}: ${err.message}`);
        }
        process.exit(1);
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });
