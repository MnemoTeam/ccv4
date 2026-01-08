# Character Card Migration Guide

This document provides detailed instructions for migrating character cards between specification versions. See [KEYWORDS.md](KEYWORDS.md) for requirement-level terminology.

---

## Table of Contents

1. [V1 to V4](#v1-to-v4)
2. [V2 to V4](#v2-to-v4)
3. [V3 to V4](#v3-to-v4)
4. [V4 to V3 (Down-Export)](#v4-to-v3-down-export)
5. [V4 to V2 (Down-Export)](#v4-to-v2-down-export)
6. [Decorator to Structured Field Mapping](#decorator-to-structured-field-mapping)

---

## V1 to V4

Character Card V1 defines six flat fields with no wrapper object. To migrate a V1 card to V4:

### Source Fields (V1)

| Field | Type |
|---|---|
| `name` | string |
| `description` | string |
| `personality` | string |
| `scenario` | string |
| `first_mes` | string |
| `mes_example` | string |

### Migration Steps

1. Create the V4 top-level structure:

```json
{
  "spec": "chara_card_v4",
  "spec_version": "4.0",
  "meta": { ... },
  "data": { ... },
  "assets": [ ... ]
}
```

2. Map V1 fields into `data`:

| V1 Field | V4 Field |
|---|---|
| `name` | `data.name` |
| `description` | `data.description` |
| `personality` | `data.personality` |
| `scenario` | `data.scenario` |
| `first_mes` | `data.first_mes` |
| `mes_example` | `data.mes_example` |

3. Set empty defaults for all V2+ fields in `data`:

```json
{
  "system_prompt": "",
  "post_history_instructions": "",
  "alternate_greetings": [],
  "group_only_greetings": [],
  "extensions": {}
}
```

4. Create a minimal `meta` object:

```json
{
  "creator": "",
  "creator_notes": "",
  "tags": [],
  "character_version": "",
  "created_at": "<current ISO 8601 timestamp>",
  "updated_at": "<current ISO 8601 timestamp>"
}
```

5. Set `assets` to the default:

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

6. Store the original V1 card in `meta.extensions` for lossless round-trip:

```json
{
  "meta": {
    "extensions": {
      "_original_card": { ...original V1 object... }
    }
  }
}
```

---

## V2 to V4

Character Card V2 (`spec: "chara_card_v2"`) wraps V1 fields in a `data` object and adds metadata, lorebook, and prompt fields.

### Field Mapping

#### Fields that move from `data` to `meta`

| V2 Location | V4 Location |
|---|---|
| `data.creator` | `meta.creator` |
| `data.creator_notes` | `meta.creator_notes` |
| `data.tags` | `meta.tags` |
| `data.character_version` | `meta.character_version` |

#### Fields that remain in `data`

| V2 Field | V4 Field | Notes |
|---|---|---|
| `data.name` | `data.name` | |
| `data.description` | `data.description` | |
| `data.personality` | `data.personality` | |
| `data.scenario` | `data.scenario` | |
| `data.first_mes` | `data.first_mes` | |
| `data.mes_example` | `data.mes_example` | |
| `data.system_prompt` | `data.system_prompt` | Moves under `data.prompt_overrides` if using the new structure |
| `data.post_history_instructions` | `data.post_history_instructions` | Moves under `data.prompt_overrides` if using the new structure |
| `data.alternate_greetings` | `data.alternate_greetings` | |
| `data.extensions` | `data.extensions` | Re-key to reverse-domain namespacing |

#### New defaults for V4-only fields in `data`

```json
{
  "group_only_greetings": [],
  "nickname": "",
  "source": [],
  "card_variables": [],
  "recommended_settings": {},
  "prompt_overrides": {},
  "related_characters": [],
  "group_behavior": {},
  "persona_hints": {}
}
```

#### Assets

Set to the default asset array since V2 has no asset system:

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

### Lorebook Migration (V2 to V4)

V2 `character_book` entries carry over with these adjustments:

| V2 Entry Field | V4 Entry Field | Notes |
|---|---|---|
| `keys` | `keys` | Direct copy |
| `content` | `content` | Direct copy |
| `extensions` | `extensions` | Re-key to reverse-domain namespacing |
| `enabled` | `enabled` | Direct copy |
| `insertion_order` | `insertion_order` | Direct copy |
| `case_sensitive` | `case_sensitive` | Direct copy |
| `name` | `name` | Direct copy |
| `priority` | `priority` | Direct copy |
| `id` | `id` | Direct copy |
| `comment` | `comment` | Direct copy |
| `selective` | `selective` | Direct copy |
| `secondary_keys` | `secondary_keys` | Direct copy |
| `constant` | `constant` | Direct copy |
| `position` | `placement.target` | `"before_char"` maps to `"before_desc"`, `"after_char"` maps to `"after_desc"` |
| *(not present)* | `placement` | Set to `{}` if V2 `position` is absent |
| *(not present)* | `conditions` | Set to `{}` |
| *(not present)* | `behavior` | Set to `{}` |
| *(not present)* | `use_regex` | Set to `false` |

V2 lorebook-level fields (`name`, `description`, `scan_depth`, `token_budget`, `recursive_scanning`, `extensions`) copy directly.

### Lossless Round-Trip

Store the original V2 card in `meta.extensions._original_card`.

---

## V3 to V4

Character Card V3 (`spec: "chara_card_v3"`) is a superset of V2. All V2 migration rules above apply, plus the following V3-specific changes.

### Additional Fields that Move from `data` to `meta`

| V3 Location | V4 Location | Notes |
|---|---|---|
| `data.creator_notes_multilingual` | `meta.creator_notes_multilingual` | Direct copy |
| `data.creation_date` | `meta.created_at` | Unix seconds to ISO 8601 conversion |
| `data.modification_date` | `meta.updated_at` | Unix seconds to ISO 8601 conversion |

### Timestamp Conversion

```
V3 unix seconds (number) --> V4 ISO 8601 string

Example:
  1718452800 --> "2024-06-15T12:00:00Z"

Conversion:
  new Date(unix_seconds * 1000).toISOString()

If the V3 value is 0 or absent, set the V4 value to the current timestamp.
```

### Fields that Stay in `data`

| V3 Field | V4 Field | Notes |
|---|---|---|
| `data.nickname` | `data.nickname` | Direct copy |
| `data.source` | `data.source` | Direct copy |
| `data.group_only_greetings` | `data.group_only_greetings` | Direct copy |

### Assets

V3 `data.assets` moves to the top-level `assets` array. The array content (objects with `type`, `uri`, `name`, `ext`) is identical in structure. If `data.assets` is absent, use the default.

### Lorebook Decorator Migration

This is the most significant change. V3 lorebook entries contain decorator strings in their `content` field. These **MUST** be parsed and converted to structured fields.

#### Process

1. Scan the `content` field for lines beginning with `@@` (decorator lines) or `@@@` (fallback decorator lines).
2. Parse each decorator into its name and value(s).
3. Map each decorator to the corresponding structured field (see the [full mapping table](#decorator-to-structured-field-mapping) below).
4. Remove all decorator lines (and associated leading/trailing blank lines) from the `content` field.

#### Example

**V3 content with decorators:**

```
@@depth 4
@@role system
@@activate_only_after 3
@@scan_depth 10
@@exclude_keys villain,enemy
@@ignore_on_max_context

The ancient library contains forbidden knowledge...
```

**V4 structured fields:**

```json
{
  "content": "The ancient library contains forbidden knowledge...",
  "placement": {
    "target": "chat_history",
    "depth": 4,
    "role": "system",
    "scan_depth_override": 10
  },
  "conditions": {
    "min_turn": 3
  },
  "behavior": {
    "ignore_on_max_context": true
  },
  "exclude_keys": ["villain", "enemy"]
}
```

### Fallback Decorators

V3 fallback decorators (lines starting with `@@@`) are implementation-specific overrides. During migration:

- If the primary decorator (`@@`) is one of the standard V4 mapped decorators, use the primary.
- Fallback decorators (`@@@`) that map to standard fields **MAY** be stored in `placement_fallbacks`.
- Application-specific fallback decorators **SHOULD** be stored in the entry's `extensions`.

### Lossless Round-Trip

Store the original V3 card in `meta.extensions._original_card`.

---

## V4 to V3 (Down-Export)

When exporting a V4 card as V3 for backward compatibility:

### Top-Level

```json
{
  "spec": "chara_card_v3",
  "spec_version": "3.0",
  "data": { ... }
}
```

### Meta Fields Back to Data

| V4 Location | V3 Location |
|---|---|
| `meta.creator` | `data.creator` |
| `meta.creator_notes` | `data.creator_notes` |
| `meta.creator_notes_multilingual` | `data.creator_notes_multilingual` |
| `meta.tags` | `data.tags` |
| `meta.character_version` | `data.character_version` |
| `meta.created_at` | `data.creation_date` (ISO 8601 to unix seconds) |
| `meta.updated_at` | `data.modification_date` (ISO 8601 to unix seconds) |

### Timestamp Conversion

```
V4 ISO 8601 string --> V3 unix seconds (number)

Example:
  "2024-06-15T12:00:00Z" --> 1718452800

Conversion:
  Math.floor(new Date(iso_string).getTime() / 1000)
```

### Assets Back to Data

Top-level `assets` array moves to `data.assets`. The structure is identical.

### Lorebook: Structured Fields to Decorator Strings

Each lorebook entry's structured `placement`, `conditions`, and `behavior` fields **MUST** be converted back to decorator strings prepended to `content`.

Use the [mapping table](#decorator-to-structured-field-mapping) in reverse. For each structured field that has a value, emit the corresponding `@@decorator value` line.

**V4 structured:**

```json
{
  "content": "The ancient library contains forbidden knowledge...",
  "placement": {
    "target": "chat_history",
    "depth": 4,
    "role": "system"
  },
  "conditions": {
    "min_turn": 3
  },
  "behavior": {
    "ignore_on_max_context": true
  }
}
```

**V3 content with decorators:**

```
@@depth 4
@@role system
@@activate_only_after 3
@@ignore_on_max_context

The ancient library contains forbidden knowledge...
```

#### Placement Target Mapping (Reverse)

| V4 `placement.target` | V3 Output |
|---|---|
| `"chat_history"` | Use `@@depth` with `placement.depth` value |
| `"before_desc"` | `@@position before_desc` |
| `"after_desc"` | `@@position after_desc` |
| `"personality"` | `@@position personality` |
| `"scenario"` | `@@position scenario` |
| `"prefill"` | `@@depth 0` with `@@role assistant` |

### V4-Only Fields

| V4 Field | V3 Handling |
|---|---|
| `data.card_variables` | Store in `data.extensions` |
| `data.recommended_settings` | Store in `data.extensions` |
| `data.related_characters` | Store in `data.extensions` |
| `data.group_behavior` | Store in `data.extensions` |
| `data.persona_hints` | Store in `data.extensions` |
| `data.prompt_overrides` | Map `system_prompt` and `post_history_instructions` to their V3 `data` equivalents; store remaining fields in `data.extensions` |
| `meta.content_hash` | Drop (not representable in V3) |
| `meta.signature` | Drop (not representable in V3) |
| Lorebook `groups` | Drop group references; entry data is preserved |
| Lorebook `placement_fallbacks` | Convert to `@@@` fallback decorator lines |
| Lorebook `conditions.*` | Convert to decorator strings per mapping table |
| Lorebook `behavior.*` | Convert to decorator strings per mapping table |
| Lorebook `exclude_keys` | Convert to `@@exclude_keys` decorator |

---

## V4 to V2 (Down-Export)

When exporting a V4 card as V2 for maximum compatibility:

### Top-Level

```json
{
  "spec": "chara_card_v2",
  "spec_version": "2.0",
  "data": { ... }
}
```

### Field Mapping

| V4 Location | V2 Location | Notes |
|---|---|---|
| `data.name` | `data.name` | |
| `data.description` | `data.description` | |
| `data.personality` | `data.personality` | |
| `data.scenario` | `data.scenario` | |
| `data.first_mes` | `data.first_mes` | |
| `data.mes_example` | `data.mes_example` | |
| `data.alternate_greetings` | `data.alternate_greetings` | |
| `meta.creator` | `data.creator` | |
| `meta.creator_notes` | `data.creator_notes` | |
| `meta.tags` | `data.tags` | |
| `meta.character_version` | `data.character_version` | |
| `data.system_prompt` or `data.prompt_overrides.system_prompt` | `data.system_prompt` | |
| `data.post_history_instructions` or `data.prompt_overrides.post_history_instructions` | `data.post_history_instructions` | |
| `data.extensions` | `data.extensions` | |

### Dropped Fields

The following V3/V4 fields have no V2 equivalent and **MUST** be dropped or stored in `data.extensions`:

- `data.nickname`
- `data.source`
- `data.group_only_greetings`
- `data.card_variables`
- `data.recommended_settings`
- `data.related_characters`
- `data.group_behavior`
- `data.persona_hints`
- `data.prompt_overrides` (beyond `system_prompt` and `post_history_instructions`)
- All `meta` fields except those mapped above
- Top-level `assets` (drop, or store in `data.extensions` for preservation)

### Lorebook Simplification

| V4 Lorebook Feature | V2 Handling |
|---|---|
| `placement.target` | Map `"before_desc"` to `"before_char"`, `"after_desc"` to `"after_char"`; drop other values |
| `placement.depth`, `placement.role`, etc. | Drop |
| `placement_fallbacks` | Drop |
| `conditions` | Drop |
| `behavior` | Drop |
| `use_regex` | Drop (V2 does not support it) |
| `exclude_keys` | Drop |
| `groups` | Drop |
| Decorator strings in content | Strip all decorator lines from content |

### CBS Macros

V4-only macros (`{{var::...}}`, `{{if::...}}`, `{{ifset::...}}`, `{{date}}`, `{{time}}`, `{{message_count}}`, `{{persona}}`) **SHOULD** be resolved to their default/fallback values where possible, or stripped if not resolvable.

V2-compatible macros (`{{char}}`, `{{user}}`) are preserved.

---

## Decorator to Structured Field Mapping

This table provides the complete bidirectional mapping between V3 decorator strings and V4 structured fields on lorebook entries.

### Placement Decorators

| V3 Decorator | V4 Structured Field | Value Type | Notes |
|---|---|---|---|
| `@@depth N` | `placement.target = "chat_history"`, `placement.depth = N` | integer | Messages from bottom. If N=0 and role=assistant, treated as prefill. |
| `@@instruct_depth N` | `placement.instruct_depth = N` | integer | Tokens from end in instruct/non-chat mode |
| `@@reverse_depth N` | `placement.reverse_depth = N` | integer | Messages from top |
| `@@reverse_instruct_depth N` | `placement.reverse_instruct_depth = N` | integer | Tokens from start in instruct mode |
| `@@position before_desc` | `placement.target = "before_desc"` | string | Before character description |
| `@@position after_desc` | `placement.target = "after_desc"` | string | After character description |
| `@@position personality` | `placement.target = "personality"` | string | In personality section |
| `@@position scenario` | `placement.target = "scenario"` | string | In scenario section |
| `@@role system\|user\|assistant` | `placement.role = "system"\|"user"\|"assistant"` | string | Message role for insertion |
| `@@scan_depth N` | `placement.scan_depth_override = N` | integer | Per-entry override of lorebook scan_depth |
| `@@instruct_scan_depth N` | `placement.instruct_scan_depth_override = N` | integer | Per-entry instruct scan depth override |

### Condition Decorators

| V3 Decorator | V4 Structured Field | Value Type | Notes |
|---|---|---|---|
| `@@activate_only_after N` | `conditions.min_turn = N` | integer | Minimum assistant message count |
| `@@activate_only_every N` | `conditions.every_n_turns = N` | integer | Activate every N turns |
| `@@is_greeting N` | `conditions.greeting_index = N` | integer | 0-based greeting index |
| `@@is_user_icon name` | `conditions.user_icon_name = "name"` | string | Active user icon asset name |
| `@@keep_activate_after_match` | `conditions.on_first_match = "keep_active"` | string | Always match after first match |
| `@@dont_activate_after_match` | `conditions.on_first_match = "deactivate"` | string | Never match after first match |
| `@@activate` | `conditions.force_activate = true` | boolean | Force entry active |
| `@@dont_activate` | `conditions.force_deactivate = true` | boolean | Force entry inactive |
| `@@disable_ui_prompt type` | `conditions.disable_ui_prompts = ["type"]` | string[] | Disable named UI prompts. Multiple decorators append to array. |

### Key Decorators

| V3 Decorator | V4 Structured Field | Value Type | Notes |
|---|---|---|---|
| `@@additional_keys a,b,c` | `secondary_keys = ["a","b","c"]` | string[] | Merged with existing secondary_keys. May appear multiple times. |
| `@@exclude_keys a,b,c` | `exclude_keys = ["a","b","c"]` | string[] | Keys that prevent activation |

### Behavior Decorators

| V3 Decorator | V4 Structured Field | Value Type | Notes |
|---|---|---|---|
| `@@ignore_on_max_context` | `behavior.ignore_on_max_context = true` | boolean | Drop when context is at capacity |

### Unmapped Decorators

Decorators that are application-specific (prefixed with application names or unrecognized) **SHOULD** be stored in the entry's `extensions` object under an appropriate reverse-domain key.

### Fallback Decorator Mapping

V3 fallback decorators (`@@@name value`) represent ordered alternatives. In V4:

- If the fallback maps to a placement field, it **MAY** be added to `placement_fallbacks` as an additional `Placement` object.
- If the fallback is application-specific, store it in `extensions`.
- The order of `placement_fallbacks` array entries preserves the top-to-bottom order of `@@@` lines in V3.
