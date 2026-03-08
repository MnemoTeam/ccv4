import { Command } from "commander";
import { validateCommand } from "./commands/validate.js";
import { migrateCommand } from "./commands/migrate.js";
import { infoCommand } from "./commands/info.js";
import { convertCommand } from "./commands/convert.js";

const program = new Command();

program
  .name("chara")
  .description("Character Card V4 CLI tool")
  .version("0.1.0");

program.addCommand(validateCommand);
program.addCommand(migrateCommand);
program.addCommand(infoCommand);
program.addCommand(convertCommand);

program.parse();
