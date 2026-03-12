import type {
  CharacterCardV3, CharacterCardV4, CardMeta, CardData,
  Lorebook, LorebookEntry, AssetEntry,
} from "@mnemoteam/types";
import { wrapV4 } from "./defaults.js";
import { parseDecorators } from "./parse-decorators.js";

function unixToISO(unix: number | undefined): string | undefined {
  if (unix == null) return undefined;
  return new Date(unix * 1000).toISOString();
}

function isEmpty(obj: Record<string, unknown> | undefined): boolean {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
}

export function migrateV3toV4(v3: CharacterCardV3): CharacterCardV4 {
  const d = v3.data;

  const meta: CardMeta = {};

  if (d.creator) meta.creator = d.creator;
  if (d.creator_notes) meta.creator_notes = d.creator_notes;
  if (d.creator_notes_multilingual && !isEmpty(d.creator_notes_multilingual)) {
    meta.creator_notes_multilingual = d.creator_notes_multilingual;
  }
  if (d.tags?.length) meta.tags = d.tags;
  if (d.character_version) meta.character_version = d.character_version;

  const createdAt = unixToISO(d.creation_date);
  const updatedAt = unixToISO(d.modification_date);
  if (createdAt) meta.created_at = createdAt;
  if (updatedAt) meta.updated_at = updatedAt;

  // Migrate lorebook with decorator parsing
  let characterBook: Lorebook | undefined;
  if (d.character_book) {
    const cb = d.character_book;
    characterBook = {
      name: cb.name,
      description: cb.description,
      scan_depth: cb.scan_depth,
      token_budget: cb.token_budget,
      recursive_scanning: cb.recursive_scanning,
      entries: cb.entries.map((entry): LorebookEntry => {
        const parsed = parseDecorators(entry.content);

        const migrated: LorebookEntry = {
          id: entry.id,
          name: entry.name,
          comment: entry.comment,
          content: parsed.cleanedContent,
          enabled: entry.enabled,
          keys: [...entry.keys, ...parsed.additionalKeys],
          secondary_keys: entry.secondary_keys,
          selective: entry.selective,
          use_regex: entry.use_regex,
          case_sensitive: entry.case_sensitive,
          constant: entry.constant,
          insertion_order: entry.insertion_order,
          priority: entry.priority,
        };

        // Apply position from V2 field if no decorator overrode it
        if (entry.position && !parsed.placement.target) {
          parsed.placement.target = entry.position === "before_char" ? "before_desc" : "after_desc";
        }

        if (Object.keys(parsed.placement).length > 0) {
          migrated.placement = parsed.placement;
        }
        if (parsed.placementFallbacks.length > 0) {
          migrated.placement_fallbacks = parsed.placementFallbacks;
        }
        if (Object.keys(parsed.conditions).length > 0) {
          migrated.conditions = parsed.conditions;
        }
        if (Object.keys(parsed.behavior).length > 0) {
          migrated.behavior = parsed.behavior;
        }
        if (parsed.excludeKeys.length > 0) {
          migrated.exclude_keys = parsed.excludeKeys;
        }

        return migrated;
      }),
      extensions: cb.extensions,
    };
  }

  // Migrate assets to top-level
  let assets: AssetEntry[] | undefined;
  if (d.assets?.length) {
    assets = d.assets.map((a) => ({
      type: a.type,
      name: a.name,
      uri: a.uri,
      ext: a.ext,
    }));
  }

  const data: CardData = {
    name: d.name,
    description: d.description,
    personality: d.personality,
    scenario: d.scenario,
    first_mes: d.first_mes,
    mes_example: d.mes_example,
    system_prompt: d.system_prompt,
    post_history_instructions: d.post_history_instructions,
    alternate_greetings: d.alternate_greetings,
    group_only_greetings: d.group_only_greetings ?? [],
    character_book: characterBook,
    extensions: d.extensions,
  };

  if (d.nickname) data.nickname = d.nickname;
  if (d.source?.length) {
    // source goes to meta
    meta.source = d.source;
  }

  return wrapV4(meta, data, assets);
}
