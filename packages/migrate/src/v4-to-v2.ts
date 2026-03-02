import type { CharacterCardV2, CharacterCardV4, CharacterCardV2Data, CharacterBookV2, CharacterBookEntryV2 } from "@character-card/types";

export function migrateV4toV2(v4: CharacterCardV4): CharacterCardV2 {
  const { meta, data } = v4;

  let characterBook: CharacterBookV2 | undefined;
  if (data.character_book) {
    const cb = data.character_book;
    characterBook = {
      name: cb.name,
      description: cb.description,
      scan_depth: cb.scan_depth,
      token_budget: cb.token_budget,
      recursive_scanning: cb.recursive_scanning,
      entries: cb.entries.map((entry): CharacterBookEntryV2 => ({
        keys: entry.keys,
        content: entry.content,  // No decorators - V2 doesn't support them
        enabled: entry.enabled,
        insertion_order: entry.insertion_order,
        case_sensitive: entry.case_sensitive,
        name: entry.name,
        priority: entry.priority,
        id: typeof entry.id === "number" ? entry.id : undefined,
        comment: entry.comment,
        selective: entry.selective,
        secondary_keys: entry.secondary_keys,
        constant: entry.constant,
        position: mapTargetToV2Position(entry.placement?.target),
        extensions: entry.extensions ?? {},
      })),
      extensions: cb.extensions ?? {},
    };
  }

  const v2Data: CharacterCardV2Data = {
    name: data.name,
    description: data.description,
    personality: data.personality,
    scenario: data.scenario,
    first_mes: data.first_mes,
    mes_example: data.mes_example,
    creator_notes: meta.creator_notes ?? "",
    system_prompt: data.system_prompt,
    post_history_instructions: data.post_history_instructions,
    alternate_greetings: data.alternate_greetings,
    tags: meta.tags ?? [],
    creator: meta.creator ?? "",
    character_version: meta.character_version ?? "",
    character_book: characterBook,
    extensions: data.extensions ?? {},
  };

  return {
    spec: "chara_card_v2",
    spec_version: "2.0",
    data: v2Data,
  };
}

function mapTargetToV2Position(target?: string): "before_char" | "after_char" | undefined {
  if (!target) return undefined;
  if (target === "before_desc") return "before_char";
  if (target === "after_desc") return "after_char";
  return undefined;
}
