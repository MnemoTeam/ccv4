import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  external: [
    "@character-card/types",
    "@character-card/validator",
    "@character-card/migrate",
  ],
});
