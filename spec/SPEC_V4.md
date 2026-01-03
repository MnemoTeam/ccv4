# Character Card V4 Specification

## Status

Normative

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Document Conventions](#2-document-conventions)
3. [Top-Level Structure](#3-top-level-structure)
4. [CardMeta](#4-cardmeta)
5. [CardData](#5-carddata)
6. [Assets](#6-assets)
7. [Lorebook](#7-lorebook)
8. [Card Variables and CBS Macros](#8-card-variables-and-cbs-macros)
9. [Recommended Settings](#9-recommended-settings)
10. [Prompt Overrides](#10-prompt-overrides)
11. [Related Characters and Group Behavior](#11-related-characters-and-group-behavior)
12. [Persona Hints](#12-persona-hints)
13. [Embedding Formats](#13-embedding-formats)
14. [Extensions](#14-extensions)
15. [Integrity System](#15-integrity-system)
16. [Backward Compatibility](#16-backward-compatibility)
17. [Conformance Levels](#17-conformance-levels)
18. [Standalone Lorebook Export](#18-standalone-lorebook-export)
- [Appendix A: CBS Macro Reference](#appendix-a-cbs-macro-reference)
- [Appendix B: Decorator to Structured Field Mapping](#appendix-b-decorator-to-structured-field-mapping)

---

## 1. Introduction

### 1.1 Purpose

This document defines the Character Card V4 specification (CCv4), a JSON-based format for representing fictional characters, their associated metadata, behavioral instructions, and media assets for use in AI-assisted roleplay and conversational applications.

### 1.2 Scope

This specification covers:

- The normative structure of a CharacterCardV4 JSON object.
- Embedding methods for PNG/APNG images, CHARX archives, and standalone JSON files.
- Lorebook (world information) entries with structured placement, conditions, and behavior.
- Card variables and curly-brace syntax (CBS) macros.
- Prompt overrides, recommended settings, and persona hints.
- An integrity system for tamper detection.
- Conformance levels for implementors.
- Migration paths from previous specification versions.

### 1.3 Terminology

The key words "**MUST**", "**MUST NOT**", "**REQUIRED**", "**SHALL**", "**SHALL NOT**", "**SHOULD**", "**SHOULD NOT**", "**RECOMMENDED**", "**NOT RECOMMENDED**", "**MAY**", and "**OPTIONAL**" in this document are to be interpreted as described in [KEYWORDS.md](KEYWORDS.md), per RFC 2119 and RFC 8174.

The term "application" refers to any software that reads, writes, or processes Character Card V4 objects.

The term "frontend" refers to any user-facing application that presents character card data to users and sends prompts to language models.

The term "character editor" refers to any application used to create or modify character cards.

---

## 2. Document Conventions

### 2.1 Data Format

All Character Card V4 objects **MUST** be serialized as JSON (ECMA-404 / RFC 8259). All JSON text **MUST** be encoded in UTF-8.

### 2.2 RFC 2119 Keywords

Requirement-level keywords are formatted in **bold** throughout this document. See [KEYWORDS.md](KEYWORDS.md).

### 2.3 Versioning

The `spec_version` field uses Semantic Versioning (SemVer) notation. The current version is `"4.0"`. Applications **SHOULD** perform version comparison by splitting the string on `'.'` and comparing each segment as an integer, left to right. For example, `"4.1"` is greater than `"4.0"`, and `"4.10"` is greater than `"4.9"`.

### 2.4 Type Notation

Type definitions in this document use TypeScript-style interface notation for clarity. These are illustrative, not normative TypeScript declarations.

---

## 3. Top-Level Structure

A CharacterCardV4 object **MUST** be a JSON object with the following top-level fields:

```typescript
interface CharacterCardV4 {
  spec: "chara_card_v4"
  spec_version: string              // SemVer, currently "4.0"
  meta: CardMeta
  data: CardData
  assets?: AssetEntry[]
}
```

### 3.1 `spec`

- Type: `string`
- **REQUIRED**
- Value **MUST** be `"chara_card_v4"`.
- Applications **SHOULD NOT** consider a card as following the V4 specification if this value is not exactly `"chara_card_v4"`.

### 3.2 `spec_version`

- Type: `string`
- **REQUIRED**
- Value **MUST** be `"4.0"` for this version of the specification.
- Applications **SHOULD NOT** reject a card if `spec_version` indicates a newer minor version (e.g. `"4.1"`). Applications **SHOULD** alert the user if the card was created with a newer version and **MAY** note that some features may not be supported.
- Version comparison: split the string on `'.'`, parse each segment as an integer, and compare segments left to right. `"4.2"` > `"4.1"` > `"4.0"`.

### 3.3 `meta`

- Type: `CardMeta`
- **REQUIRED**
- Contains authorship, timestamps, integrity data, and other non-prompt metadata. See [Section 4](#4-cardmeta).

### 3.4 `data`

- Type: `CardData`
- **REQUIRED**
- Contains all character content: descriptions, personality, greetings, lorebook, variables, and behavioral configuration. See [Section 5](#5-carddata).

### 3.5 `assets`

- Type: `AssetEntry[]`
- **OPTIONAL**
- Contains media asset references. See [Section 6](#6-assets).
- If this field is absent or undefined, applications **MUST** behave as if the value is the default asset array defined in [Section 6.2](#62-default-value).

### 3.6 Version Detection

When an application encounters a character card JSON object, it **SHOULD** detect the version using the following priority:

1. If `spec` is `"chara_card_v4"`, treat as V4.
2. If `spec` is `"chara_card_v3"`, treat as V3.
3. If `spec` is `"chara_card_v2"`, treat as V2.
4. If `spec` is absent and the object contains top-level fields `name`, `description`, `personality`, `scenario`, `first_mes`, `mes_example` (without a `data` wrapper), treat as V1.
5. Otherwise, reject or prompt the user.

---

## 4. CardMeta

The `meta` object contains authorship metadata, timestamps, and integrity information. None of the fields in `meta` **SHOULD** be included in prompts sent to language models.

```typescript
interface CardMeta {
  creator: string
  creator_notes: string
  creator_notes_multilingual?: Record<string, string>
  tags: string[]
  character_version: string
  created_at: string                // ISO 8601 date-time
  updated_at: string                // ISO 8601 date-time
  content_hash?: string             // SHA-256 hex digest
  signature?: string                // Ed25519 signature, hex or base64
  extensions: Record<string, any>
}
```

### 4.1 `meta.creator`

- Type: `string`
- **REQUIRED**
- The name or identifier of the card's creator.
- **MUST NOT** be included in prompts. **MAY** be displayed in the UI.

### 4.2 `meta.creator_notes`

- Type: `string`
- **REQUIRED**
- Notes from the creator intended for users of the card (usage instructions, content warnings, credits, etc.).
- **MUST NOT** appear in prompts sent to the model.
- Applications **SHOULD** display creator notes prominently and make them easily discoverable.
- If `creator_notes_multilingual` is present and contains a key matching the user's language, that value **SHOULD** be displayed instead. If `creator_notes_multilingual` is present but does not contain the user's language, and does contain an `"en"` key, the `"en"` value **SHOULD** be used. If neither matches, `creator_notes` serves as the fallback.

### 4.3 `meta.creator_notes_multilingual`

- Type: `Record<string, string>` (map of ISO 639-1 language codes to strings)
- **OPTIONAL**
- Provides translations of creator notes. Keys **MUST** be ISO 639-1 language codes without region subtags (e.g. `"en"`, `"ja"`, `"de"`).
- Applications **SHOULD** display the translation matching the user's locale. Applications **MAY** provide a language selector.

### 4.4 `meta.tags`

- Type: `string[]`
- **REQUIRED** (may be an empty array)
- Freeform tags for categorization and filtering.
- **MUST NOT** appear in prompts. Applications **SHOULD** support case-insensitive tag filtering.

### 4.5 `meta.character_version`

- Type: `string`
- **REQUIRED**
- A version string for the character card content (not the spec version). Freeform; **MAY** use SemVer, dates, or any scheme.
- **MUST NOT** appear in prompts. **MAY** be displayed in the UI.

### 4.6 `meta.created_at`

- Type: `string`
- **REQUIRED**
- ISO 8601 date-time string representing when the card was first created (e.g. `"2025-06-15T12:00:00Z"`).
- Applications **SHOULD** set this when a card is created. Applications **SHOULD NOT** modify this value after initial creation.
- Applications **MAY** set this to `"1970-01-01T00:00:00Z"` to indicate an unknown creation date.

### 4.7 `meta.updated_at`

- Type: `string`
- **REQUIRED**
- ISO 8601 date-time string representing when the card was last modified or exported.
- Applications **SHOULD** update this when the card is modified or exported.

### 4.8 `meta.content_hash`

- Type: `string`
- **OPTIONAL**
- The SHA-256 hex digest of the RFC 8785 (JSON Canonicalization Scheme / JCS) canonical serialization of the `data` object.
- See [Section 15](#15-integrity-system) for computation details and verification behavior.

### 4.9 `meta.signature`

- Type: `string`
- **OPTIONAL**
- An Ed25519 signature over the `content_hash` value, encoded as a hex string or base64 string.
- This is informational. It **MUST NOT** be used as DRM or access control. See [Section 15](#15-integrity-system).

### 4.10 `meta.extensions`

- Type: `Record<string, any>`
- **REQUIRED** (may be an empty object `{}`)
- Implementation-specific extended metadata. Keys **MUST** use reverse-domain namespacing (see [Section 14](#14-extensions)).
- The reserved key `_original_card` **MAY** be used to store the original card data from a previous spec version for lossless round-trip migration.

---

## 5. CardData

The `data` object contains all character content and behavioral configuration. Fields are organized by heritage (which spec version introduced them) and function.

```typescript
interface CardData {
  // V1 heritage
  name: string
  description: string
  personality: string
  scenario: string
  first_mes: string
  mes_example: string

  // V2 heritage
  system_prompt: string
  post_history_instructions: string
  alternate_greetings: string[]
  character_book?: Lorebook
  extensions: Record<string, any>

  // V3 heritage
  nickname?: string
  source?: string[]
  group_only_greetings: string[]

  // V4 new fields
  card_variables?: CardVariable[]
  recommended_settings?: RecommendedSettings
  prompt_overrides?: PromptOverrides
  related_characters?: RelatedCharacter[]
  group_behavior?: GroupBehavior
  persona_hints?: PersonaHints
}
```

### 5.1 V1 Heritage Fields

These fields originate from Character Card V1. All are **REQUIRED** and are of type `string`.

#### 5.1.1 `data.name`

The character's canonical name. This is the primary identifier for the character.

- **MUST** be a non-empty string.
- Used as the default value for `{{char}}` macro substitution when `nickname` is absent or empty.

#### 5.1.2 `data.description`

The character's description, personality traits, background, appearance, and other defining information as a prose block.

- **MAY** be a multi-line string.
- Applications **SHOULD** include this in the prompt context.

#### 5.1.3 `data.personality`

A summary of the character's personality traits.

- Applications **SHOULD** include this in the prompt context. The exact prompt location is determined by the application or by `prompt_overrides`.

#### 5.1.4 `data.scenario`

The starting scenario or setting for the conversation.

- Applications **SHOULD** include this in the prompt context.

#### 5.1.5 `data.first_mes`

The character's opening message when a new conversation begins.

- Applications **MUST** use this as the initial message unless the user selects an alternate greeting.

#### 5.1.6 `data.mes_example`

Example message exchanges demonstrating the character's writing style and voice.

- Applications **SHOULD** include these in the prompt context as few-shot examples. The exact format and placement is determined by the application.

### 5.2 V2 Heritage Fields

These fields were introduced in Character Card V2.

#### 5.2.1 `data.system_prompt`

- Type: `string`
- **REQUIRED**
- A system prompt suggested by the card creator.
- If non-empty, applications **SHOULD** use this as the system prompt by default. The `{{original}}` placeholder, if present, **MUST** be replaced with the user's own system prompt, allowing the card to wrap or extend the user's prompt rather than fully replacing it.
- An empty string means the card does not override the system prompt; the application **SHOULD** use its own default.
- See also [Section 10 (Prompt Overrides)](#10-prompt-overrides) for the `prompt_overrides` equivalent.

#### 5.2.2 `data.post_history_instructions`

- Type: `string`
- **REQUIRED**
- Instructions inserted after the conversation history (sometimes called "UJB" or "jailbreak" in frontends).
- Follows the same `{{original}}` substitution rules as `system_prompt`.
- An empty string means no override.

#### 5.2.3 `data.alternate_greetings`

- Type: `string[]`
- **REQUIRED** (may be an empty array)
- Additional opening messages the user can select instead of `first_mes`.
- Applications **MUST** offer a way for users to choose among these (e.g. swipe/select UI).

#### 5.2.4 `data.character_book`

- Type: `Lorebook | undefined`
- **OPTIONAL**
- A character-specific lorebook. See [Section 7](#7-lorebook).
- When present, applications **MUST** use this lorebook by default. It **SHOULD** be stacked with (not replace) any global/world lorebooks the user has configured.

#### 5.2.5 `data.extensions`

- Type: `Record<string, any>`
- **REQUIRED** (may be an empty object `{}`)
- Implementation-specific extended data for the character.
- Keys **MUST** use reverse-domain namespacing (see [Section 14](#14-extensions)).
- Applications **MUST NOT** destroy unrecognized keys during import/export.

### 5.3 V3 Heritage Fields

These fields were introduced in Character Card V3.

#### 5.3.1 `data.nickname`

- Type: `string | undefined`
- **OPTIONAL**
- An alternative display name for the character.
- When present and non-empty, `{{char}}` macro substitution **SHOULD** use this value instead of `data.name`.

#### 5.3.2 `data.source`

- Type: `string[] | undefined`
- **OPTIONAL**
- An array of identifiers or HTTP/HTTPS URLs pointing to the source or origin of the character card.
- **SHOULD NOT** be editable by end users (except entries added by the application itself).
- Applications **SHOULD** only append to this array and **SHOULD NOT** remove or modify entries they did not add.

#### 5.3.3 `data.group_only_greetings`

- Type: `string[]`
- **REQUIRED** (may be an empty array)
- Additional greetings used only in group chat contexts. These **SHOULD NOT** appear in solo chat greeting selection.

### 5.4 V4 New Fields

#### 5.4.1 `data.card_variables`

- Type: `CardVariable[] | undefined`
- **OPTIONAL**
- User-configurable variables. See [Section 8](#8-card-variables-and-cbs-macros).

#### 5.4.2 `data.recommended_settings`

- Type: `RecommendedSettings | undefined`
- **OPTIONAL**
- Suggested model parameters. See [Section 9](#9-recommended-settings).

#### 5.4.3 `data.prompt_overrides`

- Type: `PromptOverrides | undefined`
- **OPTIONAL**
- Prompt formatting overrides. See [Section 10](#10-prompt-overrides).

#### 5.4.4 `data.related_characters`

- Type: `RelatedCharacter[] | undefined`
- **OPTIONAL**
- References to other character cards. See [Section 11](#11-related-characters-and-group-behavior).

#### 5.4.5 `data.group_behavior`

- Type: `GroupBehavior | undefined`
- **OPTIONAL**
- Configuration for group chat behavior. See [Section 11](#11-related-characters-and-group-behavior).

#### 5.4.6 `data.persona_hints`

- Type: `PersonaHints | undefined`
- **OPTIONAL**
- Suggested user persona attributes. See [Section 12](#12-persona-hints).

---

## 6. Assets

The `assets` array contains references to media files associated with the character (icons, backgrounds, emotion sprites, user icons, etc.).

### 6.1 AssetEntry

```typescript
interface AssetEntry {
  type: string
  uri: string
  name: string
  ext: string
}
```

#### 6.1.1 `type`

- Type: `string`
- **REQUIRED**
- The functional category of the asset. Standard types:

| Type | Description |
|---|---|
| `"icon"` | Character icon or portrait. |
| `"background"` | Chat background image. |
| `"user_icon"` | User/persona icon. |
| `"emotion"` | Character emotion/expression sprite. |

- Applications **MAY** define custom types prefixed with `x_` (e.g. `"x_live2d"`).
- Applications **MAY** ignore asset types they do not support but **SHOULD** preserve them during export.

#### 6.1.2 `uri`

- Type: `string`
- **REQUIRED**
- The location of the asset. Supported URI schemes:

| Scheme | Description |
|---|---|
| `embeded://` | Path within a CHARX archive (note: the typo `embeded` is canonical, inherited from V3). |
| `ccdefault:` | Application-defined default for this asset type. |
| `https://` | Remote HTTPS URL. |
| `data:` | Inline base64 data URL (RFC 2397). |

- Applications **MUST** support `embeded://` and `ccdefault:` schemes.
- Applications **SHOULD** support `https://` and `data:` schemes.
- Applications **MAY** support additional schemes (e.g. `file://`). Unsupported schemes **SHOULD** be silently ignored for display but preserved during export.
- For PNG/APNG-embedded cards, when `uri` is `ccdefault:` and `type` is `"icon"`, the default **SHOULD** resolve to the PNG/APNG image file itself.

#### 6.1.3 `name`

- Type: `string`
- **REQUIRED**
- A human-readable identifier for the asset.
- **MUST NOT** be used in prompt engineering.
- Special `name` values by type:
  - `type: "icon"`, `name: "main"`: Applications **MUST** use this as the primary character icon if icon display is supported. If multiple `"icon"` assets exist, exactly one **MUST** have `name: "main"`.
  - `type: "background"`, `name: "main"`: Applications **MUST** use this as the primary background if background display is supported. At most one `"background"` asset **MAY** have `name: "main"`.
  - `type: "emotion"`: `name` **SHOULD** identify the emotion (e.g. `"happy"`, `"sad"`, `"angry"`, `"neutral"`).
  - `type: "user_icon"`: `name` **SHOULD** be the persona/user name associated with this icon.

#### 6.1.4 `ext`

- Type: `string`
- **REQUIRED**
- The file extension of the asset, lowercase, without a leading dot (e.g. `"png"`, `"webp"`, `"mp3"`).
- Applications **MAY** ignore assets with unsupported extensions but **SHOULD** preserve them during export.
- The value `"unknown"` **MAY** be used when the extension cannot be determined.
- If `uri` is `ccdefault:`, this field **SHOULD** be ignored by applications.

### 6.2 Default Value

If the top-level `assets` field is absent or undefined, applications **MUST** behave as if the value is:

```json
[
  {
    "type": "icon",
    "uri": "ccdefault:",
    "name": "main",
    "ext": "png"
  }
]
```

### 6.3 Asset Behavior Notes

- Applications **MAY** ignore assets they cannot display, load, or support, but **SHOULD** preserve the asset data for re-export.
- If an asset cannot be preserved (e.g. a large embedded binary that the application cannot store), the application **MUST** alert the user that asset data will be lost on export.
- When `type` is `"user_icon"` and one or more user icon assets are present, the application **MAY** disable its persona feature in favor of the card-provided user icon. This behavior **MAY** be toggleable by the user.
- Applications **SHOULD** support at least PNG, JPEG, and WebP image formats.

---

## 7. Lorebook

A lorebook (also called "world info" or "character book") contains contextual entries that are injected into the prompt when triggered by keyword matching or other conditions.

### 7.1 Lorebook Structure

```typescript
interface Lorebook {
  name?: string
  description?: string
  scan_depth?: number
  token_budget?: number
  recursive_scanning?: boolean
  groups?: LorebookGroup[]
  extensions: Record<string, any>
  entries: LorebookEntry[]
}
```

#### 7.1.1 `name`

- Type: `string | undefined`
- **OPTIONAL**
- Human-readable name for the lorebook. **MUST NOT** be used in prompt engineering.

#### 7.1.2 `description`

- Type: `string | undefined`
- **OPTIONAL**
- A description or comment about the lorebook. **MUST NOT** be used in prompt engineering.

#### 7.1.3 `scan_depth`

- Type: `number | undefined`
- **OPTIONAL**
- The number of recent messages to scan for keyword matches. Applies to all entries unless overridden per-entry via `placement.scan_depth_override`.
- If the context is not chat-based or message boundaries cannot be determined, applications **SHOULD** ignore this field.

#### 7.1.4 `token_budget`

- Type: `number | undefined`
- **OPTIONAL**
- Maximum total tokens that lorebook entries may consume. When the budget is exceeded, entries with the lowest `priority` **SHOULD** be dropped first.

#### 7.1.5 `recursive_scanning`

- Type: `boolean | undefined`
- **OPTIONAL**
- When `true`, applications **MAY** scan the content of already-triggered entries for additional keyword matches. When `false`, applications **MUST NOT** perform recursive scanning. When undefined, behavior is application-defined.

#### 7.1.6 `groups`

- Type: `LorebookGroup[] | undefined`
- **OPTIONAL**
- Named groups for organizing entries. See [Section 7.3](#73-lorebook-groups).

#### 7.1.7 `extensions`

- Type: `Record<string, any>`
- **REQUIRED** (may be `{}`)
- Implementation-specific extended data. Keys **MUST** use reverse-domain namespacing.

### 7.2 LorebookEntry

```typescript
interface LorebookEntry {
  // Required fields
  content: string
  enabled: boolean
  keys: string[]
  insertion_order: number

  // Optional identity fields
  id?: string | number
  name?: string
  comment?: string

  // Optional matching fields
  secondary_keys?: string[]
  selective?: boolean
  use_regex?: boolean
  case_sensitive?: boolean
  constant?: boolean
  exclude_keys?: string[]

  // Optional priority
  priority?: number

  // V4 structured fields (replace V3 decorators)
  placement?: Placement
  placement_fallbacks?: Placement[]
  conditions?: Conditions
  behavior?: Behavior

  // Group membership
  group?: string

  // Extensions
  extensions?: Record<string, any>
}
```

#### 7.2.1 Required Fields

**`content`** (string): The text injected into the prompt when this entry is triggered. After V3 migration, this field **MUST NOT** contain decorator strings; all decorators **MUST** be converted to structured fields. CBS macros within content are processed at runtime.

**`enabled`** (boolean): Whether this entry is active. When `false`, the entry **MUST NOT** be triggered under any circumstances.

**`keys`** (string[]): Primary keywords that trigger this entry. An entry matches when at least one key is found in the scanned context. If `use_regex` is `true`, keys are interpreted as regular expression patterns.

**`insertion_order`** (integer): Determines the sequence in which triggered entries are assembled into the prompt. Lower values are inserted earlier.

#### 7.2.2 Optional Identity Fields

**`id`** (string | number): A unique identifier for the entry within the lorebook. **MUST NOT** be used in prompt engineering.

**`name`** (string): A human-readable name. **MUST NOT** be used in prompt engineering.

**`comment`** (string): Author notes about the entry. **MUST NOT** be used in prompt engineering.

#### 7.2.3 Optional Matching Fields

**`secondary_keys`** (string[]): When `selective` is `true`, at least one secondary key must also match (in addition to a primary key) for the entry to trigger. When `use_regex` is `true`, behavior regarding secondary keys is application-defined.

**`selective`** (boolean): Enables the secondary key requirement. Default: `false`.

**`use_regex`** (boolean): When `true`, primary keys are interpreted as regular expressions. Invalid patterns **MUST** be treated as non-matching. Default: `false`.

**`case_sensitive`** (boolean): When `true`, key matching is case-sensitive. When `false`, matching is case-insensitive. When undefined, behavior is application-defined.

**`constant`** (boolean): When `true`, the entry is always triggered regardless of key matching (subject to `conditions`). When `use_regex` is `true`, this field **SHOULD** be ignored.

**`exclude_keys`** (string[]): Keywords that prevent this entry from triggering. If any exclude key is found in the scanned context, the entry **MUST NOT** trigger. This replaces the V3 `@@exclude_keys` decorator.

#### 7.2.4 Priority

**`priority`** (integer): Determines discard order when `token_budget` is exceeded. Higher priority entries are retained. When absent, applications **MAY** use `insertion_order` for discard ordering.

#### 7.2.5 Placement

```typescript
interface Placement {
  target?: "chat_history" | "before_desc" | "after_desc" | "personality" | "scenario" | "prefill"
  depth?: number
  reverse_depth?: number
  instruct_depth?: number
  reverse_instruct_depth?: number
  role?: "system" | "user" | "assistant"
  scan_depth_override?: number
  instruct_scan_depth_override?: number
}
```

**`target`**: Where in the prompt the entry's content is inserted.
- `"chat_history"`: Insert into the message history at the position specified by `depth` (default: depth 4).
- `"before_desc"`: Insert before the character description.
- `"after_desc"`: Insert after the character description.
- `"personality"`: Insert in the personality section of the prompt.
- `"scenario"`: Insert in the scenario section of the prompt.
- `"prefill"`: Insert as an assistant prefill message. When multiple entries target prefill, their contents **SHOULD** be concatenated.

If `target` is absent, the default is `"chat_history"`.

**`depth`** (integer >= 0): For `target: "chat_history"`, the number of messages from the bottom of the history at which to insert. Depth 0 means after the most recent message. If depth 0 is used with `role: "assistant"` and the environment supports prefill, the entry **SHOULD** be treated as a prefill.

**`reverse_depth`** (integer >= 0): Number of messages from the top of the chat history. Mutually exclusive intent with `depth`; if both are present, `depth` takes precedence.

**`instruct_depth`** (integer >= 0): Token-based depth for non-chat / instruct contexts. Applications in chat mode **SHOULD** ignore this.

**`reverse_instruct_depth`** (integer >= 0): Reverse token-based depth for instruct contexts.

**`role`** (`"system" | "user" | "assistant"`): The message role under which the entry content is injected. Applications in non-chat contexts **SHOULD** ignore this.

**`scan_depth_override`** (integer >= 0): Overrides the lorebook-level `scan_depth` for this entry only.

**`instruct_scan_depth_override`** (integer >= 0): Overrides scan depth for instruct-mode contexts.

**`placement_fallbacks`** (Placement[]): An ordered list of fallback placements. If the primary `placement` cannot be satisfied (e.g. the application does not support the target), applications **SHOULD** try each fallback in order.

#### 7.2.6 Conditions

```typescript
interface Conditions {
  min_turn?: number
  every_n_turns?: number
  greeting_index?: number
  user_icon_name?: string
  force_activate?: boolean
  force_deactivate?: boolean
  on_first_match?: "keep_active" | "deactivate" | "normal"
  disable_ui_prompts?: string[]
  variable_condition?: string
  group_only?: boolean
  solo_only?: boolean
  min_context_tokens?: number
}
```

**`min_turn`** (integer >= 0): The entry **SHOULD NOT** trigger until the assistant's message count reaches this value. Replaces V3 `@@activate_only_after`.

**`every_n_turns`** (integer >= 1): The entry triggers only every N turns (when `message_count % N == 0`). Replaces V3 `@@activate_only_every`.

**`greeting_index`** (integer >= 0): The entry triggers only when the active greeting matches this 0-based index (0 = `first_mes`, 1 = first alternate greeting, etc.). Replaces V3 `@@is_greeting`.

**`user_icon_name`** (string): The entry triggers only when the active user icon asset's `name` matches this value. Replaces V3 `@@is_user_icon`.

**`force_activate`** (boolean): When `true`, the entry always triggers regardless of key matching and other conditions. Replaces V3 `@@activate`.

**`force_deactivate`** (boolean): When `true`, the entry never triggers. Replaces V3 `@@dont_activate`. If both `force_activate` and `force_deactivate` are `true`, `force_activate` takes precedence (matching V3 behavior).

**`on_first_match`**: Controls behavior after the entry's first trigger.
- `"keep_active"`: The entry remains always active after its first match. Replaces V3 `@@keep_activate_after_match`.
- `"deactivate"`: The entry deactivates after its first match. Replaces V3 `@@dont_activate_after_match`.
- `"normal"`: Standard behavior (default).

**`disable_ui_prompts`** (string[]): A list of UI prompt identifiers to suppress when this entry is active. Standard identifiers: `"system_prompt"`, `"post_history_instructions"`. Replaces V3 `@@disable_ui_prompt`.

**`variable_condition`** (string): An expression referencing card variables that must evaluate to `true` for the entry to activate. The expression format is application-defined but **SHOULD** support simple equality checks (e.g. `"setting == fantasy"`).

**`group_only`** (boolean): When `true`, this entry only activates in group chat contexts.

**`solo_only`** (boolean): When `true`, this entry only activates in solo (non-group) chat contexts. If both `group_only` and `solo_only` are `true`, the entry never activates.

**`min_context_tokens`** (integer >= 0): The entry only activates when the available context window has at least this many tokens remaining.

#### 7.2.7 Behavior

```typescript
interface Behavior {
  ignore_on_max_context?: boolean
}
```

**`ignore_on_max_context`** (boolean): When `true`, this entry is dropped first (before priority-based discard) when the context reaches maximum capacity. Replaces V3 `@@ignore_on_max_context`.

#### 7.2.8 Group Membership

**`group`** (string): The name of the lorebook group this entry belongs to. See [Section 7.3](#73-lorebook-groups).

### 7.3 Lorebook Groups

```typescript
interface LorebookGroup {
  name: string
  enabled?: boolean
  default_placement?: Placement
  default_priority?: number
  default_scan_depth?: number
  extensions?: Record<string, any>
}
```

Lorebook groups allow organizing entries and applying shared defaults.

**`name`** (string, **REQUIRED**): The group identifier. Entry `group` fields reference this value.

**`enabled`** (boolean): When `false`, all entries in this group are disabled. Default: `true`.

**`default_placement`** (Placement): Default placement for entries in this group that do not specify their own `placement`. Entry-level placement takes precedence.

**`default_priority`** (integer): Default priority for entries in this group. Entry-level priority takes precedence.

**`default_scan_depth`** (integer): Default scan depth override for entries in this group. Entry-level `placement.scan_depth_override` takes precedence.

**`extensions`** (Record<string, any>): Group-level extensions.

### 7.4 Decorator Migration

V3 lorebook entries store placement, condition, and behavior data as `@@decorator` strings within the `content` field. V4 replaces these with the structured `placement`, `conditions`, and `behavior` objects described above.

Applications importing V3 cards **MUST** parse decorator strings and convert them to structured fields. See [MIGRATION.md](MIGRATION.md) and [Appendix B](#appendix-b-decorator-to-structured-field-mapping) for the complete mapping.

---

## 8. Card Variables and CBS Macros

### 8.1 Card Variables

Card variables allow card creators to expose user-configurable options that affect card behavior at runtime.

```typescript
interface CardVariable {
  key: string
  name: string
  description?: string
  type: "select" | "text" | "toggle"
  default: string
  options?: { value: string; label: string }[]
}
```

**`key`** (string, **REQUIRED**): A unique machine-readable identifier used in CBS macro references (e.g. in `{{var::key}}`). **MUST** be unique within the `card_variables` array.

**`name`** (string, **REQUIRED**): A human-readable display label.

**`description`** (string): An explanation of what this variable controls. Applications **SHOULD** display this to users.

**`type`** (string, **REQUIRED**): The input control type.
- `"select"`: A dropdown/picker. `options` **MUST** be present.
- `"text"`: A free-text input field.
- `"toggle"`: A boolean toggle. The value is `"true"` or `"false"` as strings.

**`default`** (string, **REQUIRED**): The default value. For `"toggle"` type, **MUST** be `"true"` or `"false"`. For `"select"` type, **MUST** be one of the `options[].value` values.

**`options`** (array): **REQUIRED** when `type` is `"select"`. Each entry has:
- `value` (string, **REQUIRED**): The machine-readable value.
- `label` (string, **REQUIRED**): The human-readable display label.

Applications supporting card variables **SHOULD** display a configuration UI allowing users to set variable values before or during a conversation. Variable values are session-scoped by default; persistence behavior is application-defined.

### 8.2 CBS Macros

Curly-brace syntax (CBS) macros are placeholders in card text that applications replace with computed values at runtime. CBS macros appear in double curly braces: `{{macro_name}}` or `{{macro_name:args}}`.

Applications **MUST** perform macro substitution in all text fields that are included in prompts (`description`, `personality`, `scenario`, `first_mes`, `mes_example`, `alternate_greetings`, `group_only_greetings`, `system_prompt`, `post_history_instructions`, and lorebook entry `content`).

CBS detection **SHOULD** be case-insensitive.

#### 8.2.1 Carried-Forward Macros (from V2/V3)

| Macro | Description |
|---|---|
| `{{char}}` | Replaced with `data.nickname` if non-empty, otherwise `data.name`. |
| `{{user}}` | Replaced with the user's display name or active persona name. |
| `{{random:A,B,C...}}` | Replaced with a randomly selected value from the comma-separated list. Commas may be escaped with `\,`. |
| `{{pick:A,B,C...}}` | Like `{{random}}`, but applications **SHOULD** return the same value for the same prompt context (deterministic within a generation). |
| `{{roll:N}}` or `{{roll:dN}}` | Replaced with a random integer between 1 and N (inclusive). |
| `{{//comment}}` | Replaced with an empty string. The comment is stripped and not sent to the model. Content **SHOULD NOT** trigger lorebook scanning. |
| `{{hidden_key:text}}` | Replaced with an empty string, but the text **SHOULD** be considered during recursive lorebook scanning. |
| `{{comment:text}}` | Replaced with an empty string when sent as a prompt. **MAY** be displayed inline in the UI. |
| `{{reverse:text}}` | Replaced with the reversed string (e.g. `{{reverse:Hello}}` becomes `olleH`). |
| `{{original}}` | In `system_prompt` and `post_history_instructions` only: replaced with the user's own system prompt or post-history instructions, allowing the card to wrap rather than replace the user's configuration. |

#### 8.2.2 V4 Variable Macros

| Macro | Description |
|---|---|
| `{{var::key}}` | Replaced with the current value of the card variable identified by `key`. If the variable is not defined or has no value, replaced with an empty string. |
| `{{var::key::fallback}}` | Replaced with the variable's value, or `fallback` if the variable is undefined or empty. |

#### 8.2.3 V4 Conditional Macros

| Macro | Description |
|---|---|
| `{{if::key::value}}...{{/if}}` | The enclosed content is included only if the variable `key` equals `value`. |
| `{{if::key::!value}}...{{/if}}` | The enclosed content is included only if the variable `key` does NOT equal `value`. |
| `{{ifset::key}}...{{/ifset}}` | The enclosed content is included only if the variable `key` is defined and non-empty. |

Conditional blocks **MAY** be nested. Applications that do not support nesting **SHOULD** process outermost blocks only.

If a frontend does not support card variables, it **SHOULD** resolve `{{var::key}}` to an empty string (or the fallback), and conditional blocks **SHOULD** be evaluated with variables treated as unset.

#### 8.2.4 V4 Context Macros

| Macro | Description |
|---|---|
| `{{date}}` | Replaced with the current date in the user's locale format or ISO 8601 date (e.g. `2025-06-15`). |
| `{{time}}` | Replaced with the current time in the user's locale format or 24-hour format (e.g. `14:30`). |
| `{{message_count}}` | Replaced with the number of messages in the current conversation (as a decimal string). |
| `{{persona}}` | Replaced with the user's active persona name. If no persona is active, replaced with the same value as `{{user}}`. |

### 8.3 Macro Processing Order

Applications **SHOULD** process macros in this order:

1. Variable macros (`{{var::...}}`)
2. Conditional blocks (`{{if::...}}`, `{{ifset::...}}`)
3. Context macros (`{{date}}`, `{{time}}`, `{{message_count}}`, `{{persona}}`)
4. Character/user macros (`{{char}}`, `{{user}}`, `{{original}}`)
5. Randomization macros (`{{random:...}}`, `{{pick:...}}`, `{{roll:...}}`)
6. Utility macros (`{{reverse:...}}`, `{{//...}}`, `{{hidden_key:...}}`, `{{comment:...}}`)

See [Appendix A](#appendix-a-cbs-macro-reference) for the complete reference table.

---

## 9. Recommended Settings

The `recommended_settings` object allows card creators to suggest model generation parameters. These settings are **advisory only**.

```typescript
interface RecommendedSettings {
  temperature?: number
  top_p?: number
  top_k?: number
  frequency_penalty?: number
  presence_penalty?: number
  min_p?: number
  top_a?: number
  typical_p?: number
  repetition_penalty?: number
  max_tokens?: number
  custom?: Record<string, number | string | boolean>
  extensions?: Record<string, any>
}
```

### 9.1 Standard Parameters

All fields are **OPTIONAL**. When present, they suggest a value for the corresponding model parameter:

| Field | Type | Description |
|---|---|---|
| `temperature` | number | Sampling temperature. |
| `top_p` | number | Nucleus sampling threshold. |
| `top_k` | number | Top-K sampling cutoff. |
| `frequency_penalty` | number | Frequency penalty for repeated tokens. |
| `presence_penalty` | number | Presence penalty for repeated tokens. |
| `min_p` | number | Minimum probability threshold. |
| `top_a` | number | Top-A sampling parameter. |
| `typical_p` | number | Typical sampling probability. |
| `repetition_penalty` | number | Repetition penalty multiplier. |
| `max_tokens` | number | Maximum tokens to generate per response. |

### 9.2 Custom Parameters

**`custom`** (Record<string, number | string | boolean>): A map of non-standard parameter names to values, for model-specific or application-specific settings.

### 9.3 Behavioral Requirements

- Applications **SHOULD** display recommended settings to the user when they are present.
- Applications **MAY** offer a one-click "apply recommended settings" action.
- Applications **MUST NOT** automatically override the user's existing settings without explicit user consent. The user **MUST** always be in control of model parameters.

---

## 10. Prompt Overrides

The `prompt_overrides` object provides structured control over how the card's content is formatted and injected into prompts.

```typescript
interface PromptOverrides {
  system_prompt?: string
  post_history_instructions?: string
  personality_format?: string
  scenario_format?: string
  trim_responses?: boolean
  extensions?: Record<string, any>
}
```

### 10.1 Fields

**`system_prompt`** (string): Overrides or supplements the system prompt. Follows the same `{{original}}` substitution semantics as `data.system_prompt`. When both `data.system_prompt` and `prompt_overrides.system_prompt` are present, `prompt_overrides.system_prompt` takes precedence.

**`post_history_instructions`** (string): Overrides or supplements post-history instructions. Same precedence rule as `system_prompt`.

**`personality_format`** (string): A template string controlling how the `data.personality` field is formatted in the prompt. **MAY** contain `{{personality}}` as a placeholder for the raw personality text.

**`scenario_format`** (string): A template string controlling how the `data.scenario` field is formatted in the prompt. **MAY** contain `{{scenario}}` as a placeholder for the raw scenario text.

**`trim_responses`** (boolean): When `true`, applications **SHOULD** trim trailing whitespace and incomplete sentences from model responses.

**`extensions`** (Record<string, any>): Implementation-specific overrides. Keys **MUST** use reverse-domain namespacing.

---

## 11. Related Characters and Group Behavior

### 11.1 Related Characters

```typescript
interface RelatedCharacter {
  name: string
  uri?: string
  role?: string
  description?: string
  extensions?: Record<string, any>
}
```

The `related_characters` array allows a card to reference other character cards that are related to this character (companions, rivals, family members, etc.).

**`name`** (string, **REQUIRED**): The name of the related character.

**`uri`** (string): A URI pointing to the related character's card file. **MAY** be an HTTPS URL, a `ccdefault:` reference, or an `embeded://` path within a CHARX archive.

**`role`** (string): The relationship or role of this character relative to the main character (e.g. `"companion"`, `"rival"`, `"narrator"`, `"sibling"`). Freeform.

**`description`** (string): A brief description of the related character or the relationship.

**`extensions`** (Record<string, any>): Implementation-specific data.

Applications **MAY** use this information to suggest group chat compositions, display relationship maps, or automatically load related characters.

### 11.2 Group Behavior

```typescript
interface GroupBehavior {
  response_priority?: number
  talk_to_patterns?: string[]
  activity_level?: "active" | "reactive" | "passive"
  extensions?: Record<string, any>
}
```

The `group_behavior` object defines how this character behaves when placed in a group chat with other characters.

**`response_priority`** (number): A numeric priority determining the order in which this character responds in group contexts. Higher values mean the character responds earlier. When multiple characters have equal priority, the order is application-defined.

**`talk_to_patterns`** (string[]): Patterns (plain text or regex) that, when matched in a message, indicate the message is directed at this character. Applications **MAY** use this to determine which character should respond.

**`activity_level`**: How actively this character participates.
- `"active"`: The character frequently initiates and responds.
- `"reactive"`: The character responds when addressed or relevant.
- `"passive"`: The character rarely speaks unless directly addressed.

**`extensions`** (Record<string, any>): Implementation-specific group behavior data.

---

## 12. Persona Hints

```typescript
interface PersonaHints {
  name?: string
  description?: string
  personality?: string
  role?: string
  extensions?: Record<string, any>
}
```

The `persona_hints` object allows card creators to suggest attributes for the user's persona when interacting with this character. These are **suggestions only**.

**`name`** (string): Suggested name for the user's persona.

**`description`** (string): Suggested description of the user's persona.

**`personality`** (string): Suggested personality traits for the user's persona.

**`role`** (string): Suggested role the user plays (e.g. `"detective"`, `"student"`, `"traveler"`).

**`extensions`** (Record<string, any>): Implementation-specific persona hint data.

Applications **MAY** offer these as defaults when the user has no persona configured. Applications **MUST NOT** override an existing user persona without consent.

---

## 13. Embedding Formats

Character Card V4 objects can be stored and transported in several formats.

### 13.1 JSON

A CharacterCardV4 object **MAY** be stored as a standalone JSON file. The file **SHOULD** use a `.json` extension. The entire file content **MUST** be a single valid CharacterCardV4 JSON object.

### 13.2 CHARX

CHARX is a ZIP-based archive format for bundling a character card with its assets.

#### 13.2.1 Structure

- The archive **MUST** contain `card.json` at the root, containing the CharacterCardV4 JSON object.
- The archive **MAY** contain `manifest.json` at the root, providing an index of archive contents. The manifest format is application-defined.
- Application-specific data **SHOULD** be stored in `app_data/{app_name}/` directories at the root. `{app_name}` **SHOULD** be a reverse-domain identifier or application slug.
- Asset files referenced by `embeded://` URIs **MUST** be stored at paths matching the URI (e.g. `embeded://assets/icon/main.png` corresponds to the archive path `assets/icon/main.png`).

#### 13.2.2 Compression

- Large binary assets (images, audio, video, models) **SHOULD** use the store (no compression) method in the ZIP archive, as these formats are typically already compressed.
- Text files (JSON, code) **MAY** use deflate compression.
- The archive **SHOULD NOT** be encrypted.
- File and directory names within the archive **SHOULD** use only ASCII characters to prevent compatibility issues.

#### 13.2.3 Recommended Directory Layout

Applications **SHOULD** follow this layout for assets within the archive:

| Asset Category | Directory |
|---|---|
| Images | `assets/{type}/images/` |
| Audio | `assets/{type}/audio/` |
| Video | `assets/{type}/video/` |
| Live2D models | `assets/{type}/l2d/` |
| 3D models | `assets/{type}/3d/` |
| AI models | `assets/{type}/ai/` |
| Fonts | `assets/{type}/fonts/` |
| Code | `assets/{type}/code/` |
| Other | `assets/{type}/other/` |

Where `{type}` corresponds to the asset's `type` field (e.g. `icon`, `background`, `emotion`).

#### 13.2.4 File Extension

CHARX files **MUST** use the `.charx` file extension.

#### 13.2.5 Rejection

Applications **MAY** reject a CHARX file if it is too large, corrupted, not a valid ZIP archive, encrypted (if the application does not support decryption), or otherwise unusable.

### 13.3 PNG / APNG

CharacterCardV4 objects **MAY** be embedded in PNG or APNG image files as tEXt chunks.

#### 13.3.1 Writing

The card **MUST** be embedded as a tEXt chunk with the keyword `ccv4`. The chunk value **MUST** be the JSON string of the CharacterCardV4 object, encoded as UTF-8 then base64.

#### 13.3.2 Reading / Version Detection

When reading a PNG/APNG file, applications **MUST** check for tEXt chunks in the following priority order:

1. `ccv4` -- Character Card V4. Use this if present.
2. `ccv3` -- Character Card V3. Use this if `ccv4` is not present.
3. `chara` -- Character Card V2 or V1. Use this as a last resort.

If multiple chunks are present, higher-priority chunks take precedence. Lower-priority chunks **SHOULD** be ignored.

#### 13.3.3 Backward-Compatible Writing

When writing a V4 card to PNG/APNG, applications **SHOULD** also write a `chara` chunk containing a V2 down-export of the card, so that older applications can read a basic version of the character. Applications **MAY** also write a `ccv3` chunk. Applications writing backward-compatible chunks **SHOULD** include a note in the down-exported card's `creator_notes` indicating that the card was created with V4 and may have reduced functionality.

---

## 14. Extensions

The `extensions` field appears in `meta`, `data`, lorebook, lorebook entries, and several other objects throughout the specification.

### 14.1 Namespacing

Extension keys **MUST** use reverse-domain namespacing to prevent conflicts between implementations.

**Valid examples:**
- `"com.example.myfeature"`
- `"io.github.myapp.custom_data"`
- `"org.charactercard.draft_feature"`

**Invalid examples:**
- `"myfeature"` (bare key, not allowed in V4)
- `"my-app/custom"` (not reverse-domain format)

### 14.2 Preservation

Applications **MUST NOT** destroy unrecognized extension keys during import, processing, or export. Unknown extensions **MUST** be preserved through round-trip operations.

### 14.3 Reserved Keys

The key `_original_card` in `meta.extensions` is reserved for storing the original card data from a previous specification version. This enables lossless round-trip migration. Applications **SHOULD NOT** use keys prefixed with `_` for other purposes.

---

## 15. Integrity System

The integrity system provides optional tamper detection for character cards. It is informational and **MUST NOT** be used as DRM or to restrict access.

### 15.1 Content Hash Computation

The `meta.content_hash` field, when present, **MUST** contain the SHA-256 hex digest (lowercase) of the canonical JSON serialization of the `data` object, computed using RFC 8785 (JSON Canonicalization Scheme / JCS).

#### Computation Steps

1. Extract the `data` object from the card.
2. Serialize it using RFC 8785 JCS canonical form (deterministic key ordering, normalized number representation, no insignificant whitespace).
3. Compute the SHA-256 hash of the resulting UTF-8 byte string.
4. Encode the hash as a lowercase hexadecimal string.

#### Example (pseudocode)

```
canonical_json = JCS.serialize(card.data)
hash_bytes = SHA256(canonical_json)
card.meta.content_hash = hex_encode(hash_bytes)
```

### 15.2 Signature

The `meta.signature` field, when present, **MUST** contain an Ed25519 signature over the UTF-8 byte representation of the `content_hash` string.

The signature **MAY** be encoded as a hexadecimal string or a base64 string. Applications **SHOULD** attempt both decodings.

Key distribution is out of scope for this specification. Creators **MAY** publish their public keys through external channels.

### 15.3 Verification Behavior

- Applications **SHOULD** verify `content_hash` on import by recomputing the hash and comparing it to the stored value.
- If the hash does not match, applications **SHOULD** display a warning to the user indicating that the card content may have been modified since it was signed.
- Applications **MUST NOT** reject a card solely because its hash does not match or its signature is invalid.
- Applications **MAY** verify the signature if a public key is available, and **MAY** display the verification result in the UI.

### 15.4 Hash Recomputation

Applications **SHOULD** recompute and update `content_hash` whenever `data` is modified. If the application cannot compute JCS canonical JSON, it **SHOULD** remove the `content_hash` field rather than leaving a stale value.

---

## 16. Backward Compatibility

### 16.1 Importing Older Cards

Applications supporting V4 **SHOULD** also accept V1, V2, and V3 cards and migrate them to V4 internally. See [MIGRATION.md](MIGRATION.md) for detailed migration procedures.

### 16.2 Lossless Round-Trip

When importing a card from an older format, applications **SHOULD** store the original card data in `meta.extensions._original_card`. This enables lossless down-export back to the original format.

### 16.3 Down-Export

Applications **SHOULD** support exporting V4 cards as V3 and V2 formats for interoperability with older applications. See [MIGRATION.md](MIGRATION.md) for field mapping details. V4-only features that cannot be represented in older formats **SHOULD** be stored in the target format's `extensions` field where possible, or dropped with a user notification.

---

## 17. Conformance Levels

This specification defines three conformance levels. An application **MAY** claim conformance at any level.

### 17.1 Minimal Conformance

A Minimal-conformant application **MUST**:

- Parse the top-level CharacterCardV4 structure (`spec`, `spec_version`, `meta`, `data`, `assets`).
- Read and use V1-heritage fields: `name`, `description`, `personality`, `scenario`, `first_mes`, `mes_example`.
- Display `first_mes` as the opening message.
- Perform basic CBS macro substitution: `{{char}}` and `{{user}}` at minimum.
- Preserve unknown fields and extensions during round-trip export.

### 17.2 Standard Conformance

A Standard-conformant application **MUST** meet all Minimal requirements and additionally:

- Support the full lorebook system including `placement`, `conditions`, and `behavior` fields.
- Support the `assets` array and display icons at minimum.
- Support card variables and the `{{var::...}}`, `{{if::...}}`, `{{ifset::...}}` CBS macros.
- Support all carried-forward CBS macros (`{{random:...}}`, `{{pick:...}}`, `{{roll:...}}`, `{{//...}}`, `{{hidden_key:...}}`, `{{comment:...}}`, `{{reverse:...}}`).
- Support the V4 context macros (`{{date}}`, `{{time}}`, `{{message_count}}`, `{{persona}}`).
- Support `prompt_overrides` and `recommended_settings` (display and optional apply).
- Support `alternate_greetings` selection.

### 17.3 Full Conformance

A Full-conformant application **MUST** meet all Standard requirements and additionally:

- Verify `content_hash` on import and display integrity status.
- Support `related_characters` display and optional loading.
- Support `group_behavior` for group chat scenarios.
- Support `persona_hints` display and optional application.
- Support standalone lorebook export (`LorebookExportV4`).
- Support CHARX reading and writing.
- Support PNG/APNG embedding (read and write `ccv4` chunks).
- Support lorebook `groups`.
- Support `placement_fallbacks`.

---

## 18. Standalone Lorebook Export

Lorebooks **MAY** be exported and imported independently of character cards.

### 18.1 Format

```typescript
interface LorebookExportV4 {
  spec: "lorebook_v4"
  spec_version: string    // currently "4.0"
  data: Lorebook
}
```

**`spec`** (string, **REQUIRED**): **MUST** be `"lorebook_v4"`.

**`spec_version`** (string, **REQUIRED**): **MUST** be `"4.0"` for this version.

**`data`** (Lorebook, **REQUIRED**): The lorebook object, identical in structure to `data.character_book` as defined in [Section 7](#7-lorebook).

### 18.2 File Format

Standalone lorebooks **SHOULD** be stored as JSON files. Applications **MAY** use any file extension, but `.json` is **RECOMMENDED**.

### 18.3 Compatibility

Applications **SHOULD** accept V3 lorebook exports (`spec: "lorebook_v3"`) and migrate them by converting decorator strings in entry content to structured fields per [MIGRATION.md](MIGRATION.md).

---

## Appendix A: CBS Macro Reference

Complete reference of all CBS macros supported in Character Card V4.

### A.1 Character and User Macros

| Macro | Category | Description | Since |
|---|---|---|---|
| `{{char}}` | Identity | Character's nickname (or name if nickname is empty). | V2 |
| `{{user}}` | Identity | User's display name. | V2 |
| `{{persona}}` | Identity | User's active persona name; same as `{{user}}` if no persona is active. | V4 |

### A.2 Randomization Macros

| Macro | Category | Description | Since |
|---|---|---|---|
| `{{random:A,B,C...}}` | Random | Random selection from comma-separated values. Escape commas with `\,`. | V3 |
| `{{pick:A,B,C...}}` | Random | Deterministic random selection (same result for same prompt context). | V3 |
| `{{roll:N}}` / `{{roll:dN}}` | Random | Random integer from 1 to N. | V3 |

### A.3 Comment and Utility Macros

| Macro | Category | Description | Since |
|---|---|---|---|
| `{{//text}}` | Comment | Stripped from output. Not used for lorebook scanning. | V3 |
| `{{hidden_key:text}}` | Comment | Stripped from output. Used for recursive lorebook scanning. | V3 |
| `{{comment:text}}` | Comment | Stripped from prompt. May be displayed inline in UI. | V3 |
| `{{reverse:text}}` | Utility | Reverses the text string. | V3 |
| `{{original}}` | Override | In `system_prompt` / `post_history_instructions`: replaced with the user's own prompt text. | V2 |

### A.4 Variable Macros

| Macro | Category | Description | Since |
|---|---|---|---|
| `{{var::key}}` | Variable | Current value of card variable `key`. Empty string if unset. | V4 |
| `{{var::key::fallback}}` | Variable | Value of `key`, or `fallback` if unset/empty. | V4 |

### A.5 Conditional Macros

| Macro | Category | Description | Since |
|---|---|---|---|
| `{{if::key::value}}...{{/if}}` | Conditional | Include content if variable `key` equals `value`. | V4 |
| `{{if::key::!value}}...{{/if}}` | Conditional | Include content if variable `key` does NOT equal `value`. | V4 |
| `{{ifset::key}}...{{/ifset}}` | Conditional | Include content if variable `key` is set and non-empty. | V4 |

### A.6 Context Macros

| Macro | Category | Description | Since |
|---|---|---|---|
| `{{date}}` | Context | Current date (locale or ISO 8601 format). | V4 |
| `{{time}}` | Context | Current time (locale or 24-hour format). | V4 |
| `{{message_count}}` | Context | Number of messages in the current conversation. | V4 |

---

## Appendix B: Decorator to Structured Field Mapping

Complete bidirectional mapping between V3 decorator strings and V4 structured lorebook entry fields. See also [MIGRATION.md](MIGRATION.md) for migration procedures.

### B.1 Placement Decorators

| V3 Decorator | V4 Structured Field | Value | Notes |
|---|---|---|---|
| `@@depth N` | `placement.target = "chat_history"`, `placement.depth = N` | integer | Messages from bottom. Depth 0 + role assistant = prefill. |
| `@@instruct_depth N` | `placement.instruct_depth = N` | integer | Tokens from end in instruct mode. |
| `@@reverse_depth N` | `placement.reverse_depth = N` | integer | Messages from top. |
| `@@reverse_instruct_depth N` | `placement.reverse_instruct_depth = N` | integer | Tokens from start in instruct mode. |
| `@@position before_desc` | `placement.target = "before_desc"` | -- | Before character description. |
| `@@position after_desc` | `placement.target = "after_desc"` | -- | After character description. |
| `@@position personality` | `placement.target = "personality"` | -- | In personality section. |
| `@@position scenario` | `placement.target = "scenario"` | -- | In scenario section. |
| `@@role system` | `placement.role = "system"` | -- | |
| `@@role user` | `placement.role = "user"` | -- | |
| `@@role assistant` | `placement.role = "assistant"` | -- | |
| `@@scan_depth N` | `placement.scan_depth_override = N` | integer | Per-entry scan depth override. |
| `@@instruct_scan_depth N` | `placement.instruct_scan_depth_override = N` | integer | Per-entry instruct scan depth. |

### B.2 Condition Decorators

| V3 Decorator | V4 Structured Field | Value | Notes |
|---|---|---|---|
| `@@activate_only_after N` | `conditions.min_turn = N` | integer | Min assistant message count. |
| `@@activate_only_every N` | `conditions.every_n_turns = N` | integer | Activate every N turns. |
| `@@is_greeting N` | `conditions.greeting_index = N` | integer | 0-based greeting index. |
| `@@is_user_icon name` | `conditions.user_icon_name = name` | string | Match active user icon name. |
| `@@keep_activate_after_match` | `conditions.on_first_match = "keep_active"` | -- | Always active after first match. |
| `@@dont_activate_after_match` | `conditions.on_first_match = "deactivate"` | -- | Deactivate after first match. |
| `@@activate` | `conditions.force_activate = true` | -- | Force entry active. |
| `@@dont_activate` | `conditions.force_deactivate = true` | -- | Force entry inactive. |
| `@@disable_ui_prompt type` | `conditions.disable_ui_prompts` (append `type`) | string[] | Multiple decorators append. |

### B.3 Key Decorators

| V3 Decorator | V4 Structured Field | Value | Notes |
|---|---|---|---|
| `@@additional_keys a,b,c` | `secondary_keys` (merge) | string[] | Merged with existing secondary_keys. |
| `@@exclude_keys a,b,c` | `exclude_keys` | string[] | Keys that prevent activation. |

### B.4 Behavior Decorators

| V3 Decorator | V4 Structured Field | Value | Notes |
|---|---|---|---|
| `@@ignore_on_max_context` | `behavior.ignore_on_max_context = true` | -- | Drop when context is full. |

### B.5 Fallback Decorators

V3 fallback decorators (lines starting with `@@@`) are ordered alternatives to the preceding `@@` decorator. In V4:

- Fallback placement decorators **MAY** be converted to entries in `placement_fallbacks`.
- Application-specific fallback decorators **SHOULD** be stored in `extensions`.
- The order of `placement_fallbacks` preserves the top-to-bottom order of `@@@` lines.

### B.6 Reverse Mapping (V4 to V3)

To convert structured fields back to decorator strings for V3 down-export:

| V4 Field | V3 Decorator |
|---|---|
| `placement.target = "chat_history"` + `placement.depth = N` | `@@depth N` |
| `placement.target = "before_desc"` | `@@position before_desc` |
| `placement.target = "after_desc"` | `@@position after_desc` |
| `placement.target = "personality"` | `@@position personality` |
| `placement.target = "scenario"` | `@@position scenario` |
| `placement.target = "prefill"` | `@@depth 0` + `@@role assistant` |
| `placement.instruct_depth = N` | `@@instruct_depth N` |
| `placement.reverse_depth = N` | `@@reverse_depth N` |
| `placement.reverse_instruct_depth = N` | `@@reverse_instruct_depth N` |
| `placement.role = R` | `@@role R` |
| `placement.scan_depth_override = N` | `@@scan_depth N` |
| `placement.instruct_scan_depth_override = N` | `@@instruct_scan_depth N` |
| `conditions.min_turn = N` | `@@activate_only_after N` |
| `conditions.every_n_turns = N` | `@@activate_only_every N` |
| `conditions.greeting_index = N` | `@@is_greeting N` |
| `conditions.user_icon_name = S` | `@@is_user_icon S` |
| `conditions.on_first_match = "keep_active"` | `@@keep_activate_after_match` |
| `conditions.on_first_match = "deactivate"` | `@@dont_activate_after_match` |
| `conditions.force_activate = true` | `@@activate` |
| `conditions.force_deactivate = true` | `@@dont_activate` |
| `conditions.disable_ui_prompts = [T]` | `@@disable_ui_prompt T` (one per entry) |
| `exclude_keys = [K]` | `@@exclude_keys K1,K2,...` |
| `behavior.ignore_on_max_context = true` | `@@ignore_on_max_context` |
| `placement_fallbacks[i]` | `@@@decorator value` lines after the primary |

Decorator lines **MUST** be prepended to the `content` field, separated from the content body by an empty line.
