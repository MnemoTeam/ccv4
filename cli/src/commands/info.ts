import { Command } from "commander";
import { readFileSync } from "node:fs";
import { detectVersion } from "@character-card/validator";

export const infoCommand = new Command("info")
  .description("Display information about a character card")
  .argument("<file>", "Path to JSON file")
  .action((file: string) => {
    try {
      const content = readFileSync(file, "utf-8");
      const data = JSON.parse(content);
      const version = detectVersion(data);

      console.log(`Version: ${version}`);

      if (version === "v1") {
        console.log(`Name: ${data.name}`);
      } else if (version === "v2" || version === "v3") {
        console.log(`Name: ${data.data?.name}`);
        console.log(`Creator: ${data.data?.creator ?? "N/A"}`);
        if (data.data?.character_book?.entries) {
          console.log(`Lorebook entries: ${data.data.character_book.entries.length}`);
        }
      } else if (version === "v4") {
        console.log(`Name: ${data.data?.name}`);
        console.log(`Creator: ${data.meta?.creator ?? "N/A"}`);
        if (data.meta?.created_at) {
          console.log(`Created: ${data.meta.created_at}`);
        }
        if (data.data?.character_book?.entries) {
          console.log(`Lorebook entries: ${data.data.character_book.entries.length}`);
        }
        if (data.assets?.length) {
          console.log(`Assets: ${data.assets.length}`);
        }
        if (data.data?.card_variables?.length) {
          console.log(`Card variables: ${data.data.card_variables.length}`);
        }
        if (data.meta?.content_hash) {
          console.log(`Content hash: ${data.meta.content_hash}`);
        }
      } else {
        console.log("Unknown format.");
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });
