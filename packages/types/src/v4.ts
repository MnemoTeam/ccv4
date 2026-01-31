// ===== Top-level =====

export interface CharacterCardV4 {
  spec: "chara_card_v4";
  spec_version: "4.0";
  meta: CardMeta;
  data: CardData;
  assets?: AssetEntry[];
}

// ===== Meta =====

export interface CardMeta {
  id?: string;
  creator?: string;
  creator_notes?: string;
  creator_notes_multilingual?: Record<string, string>;
  tags?: string[];
  source?: string[];
  character_version?: string;
  created_at?: string;
  updated_at?: string;
  content_hash?: string;
  signature?: CardSignature;
  extensions?: Record<string, unknown>;
}

export interface CardSignature {
  method: "ed25519";
  public_key: string;
  signature: string;
  key_source?: string;
}

// ===== Data =====

export interface CardData {
  // V1 heritage
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;

  // V2 heritage
  system_prompt: string;
  post_history_instructions: string;
  alternate_greetings: string[];
  character_book?: Lorebook;

  // V3 heritage
  nickname?: string;
  group_only_greetings: string[];

  // V4 new
  card_variables?: CardVariable[];
  recommended_settings?: RecommendedSettings;
  prompt_overrides?: PromptOverrides;
  related_characters?: RelatedCharacter[];
  group_behavior?: GroupBehavior;
  persona_hints?: PersonaHints;

  extensions?: Record<string, unknown>;
}

// ===== Assets =====

export interface AssetEntry {
  type: string;
  name: string;
  uri: string;
  ext: string;
  size?: number;
  hash?: string;
  label?: string;
  mime_type?: string;
}

// ===== Lorebook =====

export interface Lorebook {
  name?: string;
  description?: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  entries: LorebookEntry[];
  groups?: LorebookGroup[];
  extensions?: Record<string, unknown>;
}

export interface LorebookEntry {
  id?: string | number;
  name?: string;
  comment?: string;
  content: string;
  enabled: boolean;
  keys: string[];
  secondary_keys?: string[];
  selective?: boolean;
  use_regex?: boolean;
  case_sensitive?: boolean;
  constant?: boolean;
  exclude_keys?: string[];
  insertion_order: number;
  priority?: number;
  placement?: LorebookPlacement;
  placement_fallbacks?: LorebookPlacement[];
  conditions?: LorebookConditions;
  behavior?: LorebookBehavior;
  extensions?: Record<string, unknown>;
}

export interface LorebookPlacement {
  target?: "chat_history" | "before_desc" | "after_desc" | "personality" | "scenario" | "prefill";
  depth?: number;
  reverse_depth?: number;
  instruct_depth?: number;
  reverse_instruct_depth?: number;
  role?: "system" | "user" | "assistant";
  scan_depth_override?: number;
  instruct_scan_depth_override?: number;
}

export interface LorebookConditions {
  min_turn?: number;
  every_n_turns?: number;
  greeting_index?: number;
  user_icon_name?: string;
  force_activate?: boolean;
  force_deactivate?: boolean;
  on_first_match?: "keep_active" | "deactivate" | "normal";
  disable_ui_prompts?: string[];
  variable_condition?: string;
  group_only?: boolean;
  solo_only?: boolean;
  min_context_tokens?: number;
}

export interface LorebookBehavior {
  ignore_on_max_context?: boolean;
}

export interface LorebookGroup {
  id: string;
  name: string;
  enabled: boolean;
  entry_ids: (string | number)[];
  shared_placement?: LorebookPlacement;
  shared_conditions?: LorebookConditions;
}

// ===== Card Variables =====

export interface CardVariable {
  key: string;
  name: string;
  description?: string;
  type: "select" | "text" | "toggle";
  default: string;
  options?: CardVariableOption[];
}

export interface CardVariableOption {
  value: string;
  label: string;
}

// ===== Recommended Settings =====

export interface RecommendedSettings {
  models?: RecommendedModel[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  min_p?: number;
  repetition_penalty?: number;
  max_tokens?: number;
  prompt_format?: "chat" | "instruct" | "completion";
  content_rating?: "sfw" | "nsfw" | "mixed";
}

export interface RecommendedModel {
  api: string;
  model?: string;
  min_context?: number;
}

// ===== Prompt Overrides =====

export interface PromptOverrides {
  system_prompt_prefix?: string;
  system_prompt_suffix?: string;
  char_definition_template?: string;
  context_prefix?: string;
  context_suffix?: string;
  example_separator?: string;
  example_as_system?: boolean;
}

// ===== Related Characters =====

export interface RelatedCharacter {
  name: string;
  relationship: string;
  card_uri?: string;
  relationship_context?: string;
  group_dynamic?: string;
}

// ===== Group Behavior =====

export interface GroupBehavior {
  initiative: number;
  response_to?: string[];
  role?: string;
}

// ===== Persona Hints =====

export interface PersonaHints {
  suggested_name?: string;
  suggested_persona?: string;
  assumed_traits?: string[];
  suggested_user_icon?: string;
}

// ===== Standalone Lorebook Export =====

export interface LorebookExportV4 {
  spec: "lorebook_v4";
  spec_version: "4.0";
  data: Lorebook;
}
