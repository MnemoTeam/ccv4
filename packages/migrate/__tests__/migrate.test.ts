import { describe, it, expect } from "vitest";
import { migrateV1toV4 } from "../src/v1-to-v4.js";
import { migrateV2toV4 } from "../src/v2-to-v4.js";
import { migrateV3toV4 } from "../src/v3-to-v4.js";
import { migrateV4toV2 } from "../src/v4-to-v2.js";
import { migrateV4toV3 } from "../src/v4-to-v3.js";
import { parseDecorators, toDecoratorString } from "../src/parse-decorators.js";
import type { CharacterCardV1, CharacterCardV2, CharacterCardV3 } from "@mnemoteam/types";

const v1Card: CharacterCardV1 = {
  name: "Alice",
  description: "A curious adventurer",
  personality: "Curious, brave",
  scenario: "In a fantasy world",
  first_mes: "Hello, traveler!",
  mes_example: "<START>\n{{user}}: Hi\n{{char}}: Hello!",
};

const v2Card: CharacterCardV2 = {
  spec: "chara_card_v2",
  spec_version: "2.0",
  data: {
    name: "Alice",
    description: "A curious adventurer",
    personality: "Curious, brave",
    scenario: "In a fantasy world",
    first_mes: "Hello, traveler!",
    mes_example: "<START>\n{{user}}: Hi\n{{char}}: Hello!",
    creator_notes: "My first character",
    system_prompt: "You are Alice.",
    post_history_instructions: "",
    alternate_greetings: ["Greetings!", "Welcome!"],
    tags: ["fantasy", "adventure"],
    creator: "TestCreator",
    character_version: "1.0",
    extensions: {},
    character_book: {
      entries: [
        {
          keys: ["sword"],
          content: "Alice carries a magic sword.",
          enabled: true,
          insertion_order: 0,
          extensions: {},
        },
      ],
      extensions: {},
    },
  },
};

const v3Card: CharacterCardV3 = {
  spec: "chara_card_v3",
  spec_version: "3.0",
  data: {
    ...v2Card.data,
    nickname: "Ali",
    group_only_greetings: ["Hey everyone!"],
    creation_date: 1700000000,
    modification_date: 1700100000,
    source: ["https://example.com/alice"],
    creator_notes_multilingual: { ja: "初めてのキャラクター" },
    assets: [
      { type: "icon", name: "main", uri: "embeded://icon.png", ext: "png" },
    ],
    character_book: {
      entries: [
        {
          keys: ["sword"],
          content: "@@depth 4\n@@role system\n@@activate_only_after 3\nAlice carries a magic sword.",
          enabled: true,
          insertion_order: 0,
          extensions: {},
        },
        {
          keys: ["shield"],
          content: "@@position before_char\n@@exclude_keys dragon,fire\nA magical shield.",
          enabled: true,
          insertion_order: 1,
          extensions: {},
        },
      ],
      extensions: {},
    },
  },
};

describe("V1 → V4", () => {
  it("migrates all V1 fields", () => {
    const v4 = migrateV1toV4(v1Card);
    expect(v4.spec).toBe("chara_card_v4");
    expect(v4.spec_version).toBe("4.0");
    expect(v4.data.name).toBe("Alice");
    expect(v4.data.description).toBe("A curious adventurer");
    expect(v4.data.personality).toBe("Curious, brave");
    expect(v4.data.scenario).toBe("In a fantasy world");
    expect(v4.data.first_mes).toBe("Hello, traveler!");
    expect(v4.data.mes_example).toBe("<START>\n{{user}}: Hi\n{{char}}: Hello!");
  });

  it("sets empty defaults for V2+ fields", () => {
    const v4 = migrateV1toV4(v1Card);
    expect(v4.data.system_prompt).toBe("");
    expect(v4.data.post_history_instructions).toBe("");
    expect(v4.data.alternate_greetings).toEqual([]);
    expect(v4.data.group_only_greetings).toEqual([]);
  });
});

describe("V2 → V4", () => {
  it("moves creator metadata to meta", () => {
    const v4 = migrateV2toV4(v2Card);
    expect(v4.meta.creator).toBe("TestCreator");
    expect(v4.meta.creator_notes).toBe("My first character");
    expect(v4.meta.tags).toEqual(["fantasy", "adventure"]);
    expect(v4.meta.character_version).toBe("1.0");
  });

  it("preserves lorebook entries", () => {
    const v4 = migrateV2toV4(v2Card);
    expect(v4.data.character_book?.entries).toHaveLength(1);
    expect(v4.data.character_book?.entries[0].content).toBe("Alice carries a magic sword.");
  });

  it("sets group_only_greetings to empty array", () => {
    const v4 = migrateV2toV4(v2Card);
    expect(v4.data.group_only_greetings).toEqual([]);
  });
});

describe("V3 → V4", () => {
  it("converts unix timestamps to ISO 8601", () => {
    const v4 = migrateV3toV4(v3Card);
    expect(v4.meta.created_at).toBeDefined();
    expect(v4.meta.updated_at).toBeDefined();
    // Verify they're valid ISO strings
    expect(new Date(v4.meta.created_at!).getTime()).toBe(1700000000 * 1000);
    expect(new Date(v4.meta.updated_at!).getTime()).toBe(1700100000 * 1000);
  });

  it("moves assets to top-level", () => {
    const v4 = migrateV3toV4(v3Card);
    expect(v4.assets).toHaveLength(1);
    expect(v4.assets![0].type).toBe("icon");
    expect(v4.assets![0].uri).toBe("embeded://icon.png");
  });

  it("parses decorators from lorebook entries", () => {
    const v4 = migrateV3toV4(v3Card);
    const entries = v4.data.character_book!.entries;

    // First entry: @@depth 4, @@role system, @@activate_only_after 3
    expect(entries[0].placement?.depth).toBe(4);
    expect(entries[0].placement?.role).toBe("system");
    expect(entries[0].conditions?.min_turn).toBe(3);
    expect(entries[0].content).toBe("Alice carries a magic sword.");

    // Second entry: @@position before_char, @@exclude_keys dragon,fire
    expect(entries[1].placement?.target).toBe("before_desc");
    expect(entries[1].exclude_keys).toEqual(["dragon", "fire"]);
    expect(entries[1].content).toBe("A magical shield.");
  });

  it("moves multilingual notes to meta", () => {
    const v4 = migrateV3toV4(v3Card);
    expect(v4.meta.creator_notes_multilingual).toEqual({ ja: "初めてのキャラクター" });
  });

  it("preserves nickname in data", () => {
    const v4 = migrateV3toV4(v3Card);
    expect(v4.data.nickname).toBe("Ali");
  });

  it("moves source to meta", () => {
    const v4 = migrateV3toV4(v3Card);
    expect(v4.meta.source).toEqual(["https://example.com/alice"]);
  });
});

describe("V4 → V3 roundtrip", () => {
  it("preserves core data through V3→V4→V3", () => {
    const v4 = migrateV3toV4(v3Card);
    const v3Back = migrateV4toV3(v4);

    expect(v3Back.data.name).toBe(v3Card.data.name);
    expect(v3Back.data.nickname).toBe(v3Card.data.nickname);
    expect(v3Back.data.creator).toBe(v3Card.data.creator);
    expect(v3Back.data.group_only_greetings).toEqual(v3Card.data.group_only_greetings);
  });

  it("converts decorators back to content strings", () => {
    const v4 = migrateV3toV4(v3Card);
    const v3Back = migrateV4toV3(v4);
    const entries = v3Back.data.character_book!.entries;

    // Should contain decorator strings
    expect(entries[0].content).toContain("@@depth 4");
    expect(entries[0].content).toContain("@@role system");
    expect(entries[0].content).toContain("Alice carries a magic sword.");
  });
});

describe("V4 → V2", () => {
  it("drops V3/V4 fields gracefully", () => {
    const v4 = migrateV3toV4(v3Card);
    const v2 = migrateV4toV2(v4);

    expect(v2.spec).toBe("chara_card_v2");
    expect(v2.spec_version).toBe("2.0");
    expect(v2.data.name).toBe("Alice");
    // V3 fields should not be present
    expect((v2.data as any).nickname).toBeUndefined();
    expect((v2.data as any).assets).toBeUndefined();
  });

  it("preserves lorebook entries without decorators", () => {
    const v4 = migrateV3toV4(v3Card);
    const v2 = migrateV4toV2(v4);
    const entries = v2.data.character_book!.entries;

    // Content should be clean (no decorators)
    expect(entries[0].content).toBe("Alice carries a magic sword.");
    expect(entries[0].content).not.toContain("@@");
  });
});

describe("parseDecorators", () => {
  it("parses depth decorator", () => {
    const result = parseDecorators("@@depth 4\nContent here");
    expect(result.placement.depth).toBe(4);
    expect(result.cleanedContent).toBe("Content here");
  });

  it("parses multiple decorators", () => {
    const result = parseDecorators("@@depth 4\n@@role system\n@@activate_only_after 3\nContent");
    expect(result.placement.depth).toBe(4);
    expect(result.placement.role).toBe("system");
    expect(result.conditions.min_turn).toBe(3);
    expect(result.cleanedContent).toBe("Content");
  });

  it("parses fallback decorators (@@@ prefix)", () => {
    const result = parseDecorators("@@depth 4\n@@@depth 2\n@@@position before_char\nContent");
    expect(result.placement.depth).toBe(4);
    expect(result.placementFallbacks).toHaveLength(2);
    expect(result.placementFallbacks[0].depth).toBe(2);
    expect(result.placementFallbacks[1].target).toBe("before_desc");
  });

  it("parses exclude_keys", () => {
    const result = parseDecorators("@@exclude_keys dragon,fire\nContent");
    expect(result.excludeKeys).toEqual(["dragon", "fire"]);
  });

  it("handles content with no decorators", () => {
    const result = parseDecorators("Just plain content\nWith multiple lines");
    expect(result.cleanedContent).toBe("Just plain content\nWith multiple lines");
    expect(Object.keys(result.placement)).toHaveLength(0);
  });

  it("parses boolean decorators", () => {
    const result = parseDecorators("@@activate\n@@ignore_on_max_context\nContent");
    expect(result.conditions.force_activate).toBe(true);
    expect(result.behavior.ignore_on_max_context).toBe(true);
  });
});

describe("toDecoratorString", () => {
  it("converts placement to decorator string", () => {
    const result = toDecoratorString({ depth: 4, role: "system" });
    expect(result).toContain("@@depth 4");
    expect(result).toContain("@@role system");
  });

  it("returns empty string for no fields", () => {
    const result = toDecoratorString();
    expect(result).toBe("");
  });

  it("includes fallbacks with @@@ prefix", () => {
    const result = toDecoratorString(
      { depth: 4 },
      [{ depth: 2, target: "before_desc" }],
    );
    expect(result).toContain("@@depth 4");
    expect(result).toContain("@@@depth 2");
    expect(result).toContain("@@@position before_char");
  });
});
