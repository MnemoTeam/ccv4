# Character Card V4 Changelog

## Changes from V3 to V4

### Structural Changes

- **3-layer top-level split.** The card is reorganized into three distinct top-level objects: `meta` (authorship, timestamps, integrity), `data` (character content and behavior), and `assets` (media references). In V3, assets lived inside `data` and metadata fields were mixed with character content.

- **ISO 8601 timestamps.** `creation_date` and `modification_date` (unix seconds in V3) are replaced by `meta.created_at` and `meta.updated_at` using ISO 8601 date-time strings (e.g. `"2025-06-15T12:00:00Z"`).

- **Metadata fields relocated.** `creator`, `creator_notes`, `creator_notes_multilingual`, `tags`, and `character_version` move from `data` to `meta`.

### Lorebook

- **Structured decorators.** V3 decorator strings (`@@depth 4`, `@@position after_desc`, etc.) are replaced by structured JSON objects: `placement`, `placement_fallbacks`, `conditions`, and `behavior` fields on each lorebook entry. No string parsing is required.

- **Lorebook groups.** Lorebook entries may be organized into named groups via `character_book.groups` and per-entry `group` references. Groups carry shared defaults for placement, priority, and scan depth.

- **Standalone lorebook export.** A new `LorebookExportV4` wrapper (`spec: "lorebook_v4"`) is defined for exporting lorebooks independently of character cards.

### Card Variables and CBS Macros

- **Card variables.** A new `card_variables` array in `data` allows card creators to define user-configurable variables with types (`select`, `text`, `toggle`), defaults, and option lists.

- **New CBS macros.** Variable-aware macros are introduced:
  - `{{var::key}}` -- resolves to the current value of a card variable.
  - `{{var::key::fallback}}` -- resolves to the variable value or the fallback if unset.
  - `{{if::key::value}}...{{/if}}` -- conditional block, included when the variable equals the value.
  - `{{if::key::!value}}...{{/if}}` -- negated conditional block.
  - `{{ifset::key}}...{{/ifset}}` -- conditional block, included when the variable is set and non-empty.

- **Additional CBS macros.**
  - `{{date}}` -- current date.
  - `{{time}}` -- current time.
  - `{{message_count}}` -- number of messages in the conversation.
  - `{{persona}}` -- the user's active persona name.

### Prompt Overrides and Recommended Settings

- **Recommended settings.** A new `recommended_settings` object in `data` allows card creators to suggest model parameters (temperature, top_p, top_k, frequency_penalty, presence_penalty, min_p, top_a, typical_p, repetition_penalty, max_tokens, and custom values). These are advisory; frontends **MUST NOT** auto-override user settings.

- **Prompt overrides.** The existing `system_prompt` and `post_history_instructions` are formalized under `prompt_overrides` alongside new fields: `system_prompt`, `post_history_instructions`, `personality_format`, `scenario_format`, and `trim_responses`.

### Characters and Groups

- **Related characters.** A new `related_characters` array allows cards to reference other characters by URI and role (e.g. `"companion"`, `"rival"`, `"narrator"`).

- **Group behavior.** A new `group_behavior` object defines how the character behaves in group chats: response priority, talk-to patterns, and activity level.

### Persona Hints

- **Persona hints.** A new `persona_hints` object allows card creators to suggest user persona attributes: name, description, personality, and role. Frontends **MAY** offer these as defaults.

### Integrity System

- **Content hash.** `meta.content_hash` holds the SHA-256 hex digest of the RFC 8785 (JCS) canonical JSON serialization of the `data` object. Allows import-time tamper detection.

- **Signature.** `meta.signature` holds an Ed25519 signature over the content hash. This is informational and **MUST NOT** be used as DRM. Frontends **SHOULD** display a warning on mismatch but **MUST NOT** reject cards.

### Extensions

- **Required reverse-domain namespacing.** Extension keys **MUST** use reverse-domain notation (e.g. `"com.example.myfeature"`). Bare keys are no longer permitted in V4.

- **Preservation guarantee.** Applications **MUST NOT** destroy unrecognized extension keys during round-trip operations.

### Conformance Levels

- **Three conformance levels defined.**
  - *Minimal* -- parse top-level structure, V1-heritage fields, first greeting, basic macro substitution.
  - *Standard* -- all Minimal features plus lorebook with placement/conditions, assets, card variables, CBS macros, prompt overrides, recommended settings.
  - *Full* -- all Standard features plus integrity verification, groups, related characters, persona hints, standalone lorebook export, CHARX embedding.

### Embedding

- **PNG/APNG chunk name.** V4 cards use the `ccv4` tEXt chunk. Detection priority: `ccv4` > `ccv3` > `chara`.

- **CHARX enhancements.** `manifest.json` is now an optional file at the zip root. Application-specific data uses `app_data/{app_name}/` directories. Large binary assets **SHOULD** use store (no compression) method.
