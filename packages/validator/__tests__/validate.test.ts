import { describe, it, expect } from "vitest";
import { validate, validateLorebook, detectVersion } from "../src/index.js";

// Minimal valid V4 card
const minimalValid = {
  spec: "chara_card_v4",
  spec_version: "4.0",
  meta: {},
  data: {
    name: "Test Character",
    description: "A test character",
    personality: "Friendly",
    scenario: "A test scenario",
    first_mes: "Hello!",
    mes_example: "<START>\n{{user}}: Hi\n{{char}}: Hello!",
    system_prompt: "",
    post_history_instructions: "",
    alternate_greetings: [],
    group_only_greetings: [],
  },
};

describe("validate", () => {
  it("accepts a minimal valid V4 card", () => {
    const result = validate(minimalValid);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("accepts a fully populated V4 card", () => {
    const full = {
      ...minimalValid,
      meta: {
        id: "test-uuid",
        creator: "TestCreator",
        creator_notes: "Test notes",
        tags: ["test", "example"],
        source: ["https://example.com"],
        character_version: "1.0",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        content_hash: "abc123",
      },
      data: {
        ...minimalValid.data,
        nickname: "Testy",
        card_variables: [
          {
            key: "gender",
            name: "Your Gender",
            type: "select",
            default: "female",
            options: [
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ],
          },
        ],
        character_book: {
          entries: [
            {
              content: "Test lore",
              enabled: true,
              keys: ["test"],
              insertion_order: 0,
            },
          ],
        },
      },
      assets: [
        {
          type: "icon",
          name: "main",
          uri: "ccdefault:",
          ext: "png",
        },
      ],
    };
    const result = validate(full);
    expect(result.valid).toBe(true);
  });

  it("rejects missing spec field", () => {
    const { spec: _spec, ...rest } = minimalValid;
    const result = validate(rest);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.path === "/" || e.message.includes("spec"))
    ).toBe(true);
  });

  it("rejects wrong spec value", () => {
    const result = validate({ ...minimalValid, spec: "chara_card_v3" });
    expect(result.valid).toBe(false);
  });

  it("rejects missing required data fields", () => {
    const result = validate({
      spec: "chara_card_v4",
      spec_version: "4.0",
      meta: {},
      data: { name: "Test" },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects additional properties at top level", () => {
    const result = validate({ ...minimalValid, extra: "field" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("extra"))).toBe(true);
  });

  it("validates lorebook entry placement", () => {
    const card = {
      ...minimalValid,
      data: {
        ...minimalValid.data,
        character_book: {
          entries: [
            {
              content: "Test",
              enabled: true,
              keys: ["test"],
              insertion_order: 0,
              placement: {
                target: "chat_history",
                depth: 4,
                role: "system",
              },
            },
          ],
        },
      },
    };
    const result = validate(card);
    expect(result.valid).toBe(true);
  });

  it("rejects invalid placement target", () => {
    const card = {
      ...minimalValid,
      data: {
        ...minimalValid.data,
        character_book: {
          entries: [
            {
              content: "Test",
              enabled: true,
              keys: ["test"],
              insertion_order: 0,
              placement: {
                target: "invalid_target",
              },
            },
          ],
        },
      },
    };
    const result = validate(card);
    expect(result.valid).toBe(false);
  });

  it("validates card variables with select requiring options", () => {
    const card = {
      ...minimalValid,
      data: {
        ...minimalValid.data,
        card_variables: [
          {
            key: "mode",
            name: "Mode",
            type: "select",
            default: "a",
            // Missing required options for select type
          },
        ],
      },
    };
    const result = validate(card);
    expect(result.valid).toBe(false);
  });

  it("accepts text type variable without options", () => {
    const card = {
      ...minimalValid,
      data: {
        ...minimalValid.data,
        card_variables: [
          {
            key: "custom_name",
            name: "Custom Name",
            type: "text",
            default: "Traveler",
          },
        ],
      },
    };
    const result = validate(card);
    expect(result.valid).toBe(true);
  });
});

describe("detectVersion", () => {
  it("detects V4", () => {
    expect(
      detectVersion({ spec: "chara_card_v4", spec_version: "4.0", meta: {}, data: {} })
    ).toBe("v4");
  });

  it("detects V3", () => {
    expect(
      detectVersion({ spec: "chara_card_v3", spec_version: "3.0", data: {} })
    ).toBe("v3");
  });

  it("detects V2", () => {
    expect(
      detectVersion({ spec: "chara_card_v2", spec_version: "2.0", data: {} })
    ).toBe("v2");
  });

  it("detects V1", () => {
    expect(
      detectVersion({
        name: "Test",
        description: "Test",
        personality: "Test",
        scenario: "Test",
        first_mes: "Hello",
        mes_example: "",
      })
    ).toBe("v1");
  });

  it("returns unknown for null", () => {
    expect(detectVersion(null)).toBe("unknown");
  });

  it("returns unknown for non-object", () => {
    expect(detectVersion("string")).toBe("unknown");
  });
});

describe("validateLorebook", () => {
  it("accepts valid standalone lorebook", () => {
    const result = validateLorebook({
      spec: "lorebook_v4",
      spec_version: "4.0",
      data: {
        entries: [
          {
            content: "Test lore entry",
            enabled: true,
            keys: ["test"],
            insertion_order: 0,
          },
        ],
      },
    });
    expect(result.valid).toBe(true);
  });

  it("rejects invalid standalone lorebook", () => {
    const result = validateLorebook({
      spec: "lorebook_v4",
      spec_version: "4.0",
      data: {
        // missing entries
      },
    });
    expect(result.valid).toBe(false);
  });
});
