import type { CharacterCardV3, CharacterCardV4, CharacterCardV3Data, CharacterBookV3, CharacterBookEntryV3 } from "@character-card/types";
import { toDecoratorString } from "./parse-decorators.js";

function isoToUnix(iso: string | undefined): number | undefined {
  if (!iso) return undefined;
  const ms = Date.parse(iso);
  if (isNaN(ms)) return undefined;
  return Math.floor(ms / 1000);
}

export function migrateV4toV3(v4: CharacterCardV4): CharacterCardV3 {
  const { meta, data, assets } = v4;

  let characterBook: CharacterBookV3 | undefined;
  if (data.character_book) {
    const cb = data.character_book;
    characterBook = {
      name: cb.name,
      description: cb.description,
      scan_depth: cb.scan_depth,
      token_budget: cb.token_budget,
      recursive_scanning: cb.recursive_scanning,
      entries: cb.entries.map((entry): CharacterBookEntryV3 => {
        // Convert structured fields back to decorator strings
        const decorators = toDecoratorString(
          entry.placement,
          entry.placement_fallbacks,
          entry.conditions,
          entry.behavior,
          entry.exclude_keys,
        );

        const content = decorators
          ? `${decorators}\n${entry.content}`
          : entry.content;

        return {
          keys: entry.keys,
          content,
          enabled: entry.enabled,
          insertion_order: entry.insertion_order,
          case_sensitive: entry.case_sensitive,
          name: entry.name,
          priority: entry.priority,
          id: typeof entry.id === "string" ? undefined : entry.id,
          comment: entry.comment,
          selective: entry.selective,
          secondary_keys: entry.secondary_keys,
          constant: entry.constant,
          position: mapTargetToPosition(entry.placement?.target),
          use_regex: entry.use_regex,
          extensions: entry.extensions ?? {},
        };
      }),
      extensions: cb.extensions ?? {},
    };
  }

  const v3Data: CharacterCardV3Data = {
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
    nickname: data.nickname,
    creator_notes_multilingual: meta.creator_notes_multilingual,
    source: meta.source,
    group_only_greetings: data.group_only_greetings,
    creation_date: isoToUnix(meta.created_at),
    modification_date: isoToUnix(meta.updated_at),
    assets: assets?.map(a => ({
      type: a.type,
      name: a.name,
      uri: a.uri,
      ext: a.ext,
    })),
  };

  return {
    spec: "chara_card_v3",
    spec_version: "3.0",
    data: v3Data,
  };
}

function mapTargetToPosition(target?: string): "before_char" | "after_char" | undefined {
  if (!target) return undefined;
  if (target === "before_desc") return "before_char";
  if (target === "after_desc") return "after_char";
  return undefined;
}
