import { Command } from "commander";
import { readFileSync, writeFileSync } from "node:fs";

export const convertCommand = new Command("convert")
  .description("Convert between character card formats (JSON, PNG, CHARX)")
  .argument("<input>", "Input file path")
  .argument("<output>", "Output file path")
  .action((input: string, output: string) => {
    const inputExt = input.split(".").pop()?.toLowerCase();
    const outputExt = output.split(".").pop()?.toLowerCase();

    if (inputExt === "json" && outputExt === "json") {
      // Simple copy/reformat
      const content = readFileSync(input, "utf-8");
      const data = JSON.parse(content);
      writeFileSync(output, JSON.stringify(data, null, 2), "utf-8");
      console.log(`Converted ${input} → ${output}`);
      return;
    }

    // PNG and CHARX support would require additional dependencies (pngjs, adm-zip)
    // For now, provide a clear message
    if (inputExt === "png" || outputExt === "png") {
      console.log("PNG embedding/extraction requires additional setup.");
      console.log("Use the @character-card/validator package API for PNG operations.");
      process.exit(1);
    }

    if (inputExt === "charx" || outputExt === "charx") {
      console.log("CHARX format support requires additional setup.");
      console.log("Use the @character-card/validator package API for CHARX operations.");
      process.exit(1);
    }

    console.error(`Unsupported conversion: ${inputExt} → ${outputExt}`);
    process.exit(1);
  });
