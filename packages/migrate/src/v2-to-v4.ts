import type { CharacterCardV2, CharacterCardV4, Lorebook, LorebookEntry } from "@mnemoteam/types";
import { defaultMeta, wrapV4 } from "./defaults.js";

export function migrateV2toV4(v2: CharacterCardV2): CharacterCardV4 {
  const d = v2.data;

  const meta = {
    ...defaultMeta(),
    creator: d.creator || undefined,
    creator_notes: d.creator_notes || undefined,
    tags: d.tags?.length ? d.tags : undefined,
    character_version: d.character_version || undefined,
  };

  // Clean up undefined values
  if (!meta.creator) delete meta.creator;
  if (!meta.creator_notes) delete meta.creator_notes;
  if (!meta.tags) delete meta.tags;
  if (!meta.character_version) delete meta.character_version;

  let characterBook: Lorebook | undefined;
  if (d.character_book) {
    characterBook = {
      name: d.character_book.name,
      description: d.character_book.description,
      scan_depth: d.character_book.scan_depth,
      token_budget: d.character_book.token_budget,
      recursive_scanning: d.character_book.recursive_scanning,
      entries: d.character_book.entries.map((entry): LorebookEntry => ({
        id: entry.id,
        name: entry.name,
        comment: entry.comment,
        content: entry.content,
        enabled: entry.enabled,
        keys: entry.keys,
        secondary_keys: entry.secondary_keys,
        selective: entry.selective,
        case_sensitive: entry.case_sensitive,
        constant: entry.constant,
        insertion_order: entry.insertion_order,
        priority: entry.priority,
        placement: entry.position ? {
          target: entry.position === "before_char" ? "before_desc" : "after_desc",
        } : undefined,
      })),
      extensions: d.character_book.extensions,
    };
  }

  const data = {
    name: d.name,
    description: d.description,
    personality: d.personality,
    scenario: d.scenario,
    first_mes: d.first_mes,
    mes_example: d.mes_example,
    system_prompt: d.system_prompt,
    post_history_instructions: d.post_history_instructions,
    alternate_greetings: d.alternate_greetings,
    group_only_greetings: [] as string[],
    character_book: characterBook,
    extensions: d.extensions,
  };

  return wrapV4(meta, data);
}
