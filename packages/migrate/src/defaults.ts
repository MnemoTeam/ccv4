import type { CardMeta, CardData, CharacterCardV4 } from "@character-card/types";

export function defaultMeta(): CardMeta {
  return {};
}

export function defaultData(): CardData {
  return {
    name: "",
    description: "",
    personality: "",
    scenario: "",
    first_mes: "",
    mes_example: "",
    system_prompt: "",
    post_history_instructions: "",
    alternate_greetings: [],
    group_only_greetings: [],
  };
}

export function wrapV4(meta: CardMeta, data: CardData, assets?: import("@character-card/types").AssetEntry[]): CharacterCardV4 {
  const card: CharacterCardV4 = {
    spec: "chara_card_v4",
    spec_version: "4.0",
    meta,
    data,
  };
  if (assets && assets.length > 0) {
    card.assets = assets;
  }
  return card;
}
