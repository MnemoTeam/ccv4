import type { CharacterCardV1, CharacterCardV4 } from "@character-card/types";
import { defaultMeta, defaultData, wrapV4 } from "./defaults.js";

export function migrateV1toV4(v1: CharacterCardV1): CharacterCardV4 {
  const meta = defaultMeta();
  const data = {
    ...defaultData(),
    name: v1.name,
    description: v1.description,
    personality: v1.personality,
    scenario: v1.scenario,
    first_mes: v1.first_mes,
    mes_example: v1.mes_example,
  };
  return wrapV4(meta, data);
}
