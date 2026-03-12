import type { LorebookPlacement, LorebookConditions, LorebookBehavior } from "@mnemoteam/types";

export interface ParsedDecorators {
  placement: LorebookPlacement;
  placementFallbacks: LorebookPlacement[];
  conditions: LorebookConditions;
  behavior: LorebookBehavior;
  additionalKeys: string[];
  excludeKeys: string[];
  cleanedContent: string;
}

const DECORATOR_REGEX = /^@@(@?)(\w+)(?:\s+(.*))?$/;

export function parseDecorators(content: string): ParsedDecorators {
  const lines = content.split("\n");
  const placement: LorebookPlacement = {};
  const placementFallbacks: LorebookPlacement[] = [];
  const conditions: LorebookConditions = {};
  const behavior: LorebookBehavior = {};
  const additionalKeys: string[] = [];
  const excludeKeys: string[] = [];
  const contentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(DECORATOR_REGEX);

    if (!match) {
      contentLines.push(line);
      continue;
    }

    const [, isFallback, name, rawValue] = match;
    const value = rawValue?.trim() ?? "";

    if (isFallback === "@") {
      // @@@ fallback decorator - parse as a fallback placement
      const fallback = parseFallbackDecorator(name, value);
      if (fallback) {
        placementFallbacks.push(fallback);
      }
      continue;
    }

    switch (name) {
      // Placement decorators
      case "depth":
        placement.depth = parseInt(value, 10);
        break;
      case "reverse_depth":
        placement.reverse_depth = parseInt(value, 10);
        break;
      case "instruct_depth":
        placement.instruct_depth = parseInt(value, 10);
        break;
      case "reverse_instruct_depth":
        placement.reverse_instruct_depth = parseInt(value, 10);
        break;
      case "position":
        placement.target = mapPosition(value);
        break;
      case "role":
        placement.role = value as "system" | "user" | "assistant";
        break;
      case "scan_depth":
        placement.scan_depth_override = parseInt(value, 10);
        break;
      case "instruct_scan_depth":
        placement.instruct_scan_depth_override = parseInt(value, 10);
        break;

      // Condition decorators
      case "activate_only_after":
        conditions.min_turn = parseInt(value, 10);
        break;
      case "activate_only_every":
        conditions.every_n_turns = parseInt(value, 10);
        break;
      case "is_greeting":
        conditions.greeting_index = parseInt(value, 10);
        break;
      case "is_user_icon":
        conditions.user_icon_name = value;
        break;
      case "activate":
        conditions.force_activate = true;
        break;
      case "dont_activate":
        conditions.force_deactivate = true;
        break;
      case "keep_activate_after_match":
        conditions.on_first_match = "keep_active";
        break;
      case "dont_activate_after_match":
        conditions.on_first_match = "deactivate";
        break;
      case "disable_ui_prompt":
        conditions.disable_ui_prompts = conditions.disable_ui_prompts ?? [];
        conditions.disable_ui_prompts.push(value);
        break;

      // Behavior decorators
      case "ignore_on_max_context":
        behavior.ignore_on_max_context = true;
        break;

      // Key decorators
      case "additional_keys":
        additionalKeys.push(...value.split(",").map(k => k.trim()).filter(Boolean));
        break;
      case "exclude_keys":
        excludeKeys.push(...value.split(",").map(k => k.trim()).filter(Boolean));
        break;

      default:
        // Unknown decorator - keep as content
        contentLines.push(line);
        break;
    }
  }

  // Clean content: remove leading/trailing blank lines that surrounded decorators
  const cleanedContent = trimBlankLines(contentLines.join("\n"));

  return {
    placement,
    placementFallbacks,
    conditions,
    behavior,
    additionalKeys,
    excludeKeys,
    cleanedContent,
  };
}

function parseFallbackDecorator(name: string, value: string): LorebookPlacement | null {
  const placement: LorebookPlacement = {};

  switch (name) {
    case "depth":
      placement.depth = parseInt(value, 10);
      break;
    case "reverse_depth":
      placement.reverse_depth = parseInt(value, 10);
      break;
    case "position":
      placement.target = mapPosition(value);
      break;
    case "role":
      placement.role = value as "system" | "user" | "assistant";
      break;
    default:
      return null;
  }

  return placement;
}

function mapPosition(value: string): LorebookPlacement["target"] {
  const map: Record<string, LorebookPlacement["target"]> = {
    "before_char": "before_desc",
    "after_char": "after_desc",
    "before_desc": "before_desc",
    "after_desc": "after_desc",
    "chat_history": "chat_history",
    "personality": "personality",
    "scenario": "scenario",
    "prefill": "prefill",
  };
  return map[value] ?? "chat_history";
}

function trimBlankLines(text: string): string {
  return text.replace(/^\s*\n/, "").replace(/\n\s*$/, "");
}

// ===== Reverse: Structured fields → decorator strings =====

export function toDecoratorString(
  placement?: LorebookPlacement,
  placementFallbacks?: LorebookPlacement[],
  conditions?: LorebookConditions,
  behavior?: LorebookBehavior,
  excludeKeys?: string[],
): string {
  const lines: string[] = [];

  if (placement) {
    if (placement.target) lines.push(`@@position ${reverseMapPosition(placement.target)}`);
    if (placement.depth != null) lines.push(`@@depth ${placement.depth}`);
    if (placement.reverse_depth != null) lines.push(`@@reverse_depth ${placement.reverse_depth}`);
    if (placement.instruct_depth != null) lines.push(`@@instruct_depth ${placement.instruct_depth}`);
    if (placement.reverse_instruct_depth != null) lines.push(`@@reverse_instruct_depth ${placement.reverse_instruct_depth}`);
    if (placement.role) lines.push(`@@role ${placement.role}`);
    if (placement.scan_depth_override != null) lines.push(`@@scan_depth ${placement.scan_depth_override}`);
    if (placement.instruct_scan_depth_override != null) lines.push(`@@instruct_scan_depth ${placement.instruct_scan_depth_override}`);
  }

  if (placementFallbacks) {
    for (const fb of placementFallbacks) {
      if (fb.target) lines.push(`@@@position ${reverseMapPosition(fb.target)}`);
      if (fb.depth != null) lines.push(`@@@depth ${fb.depth}`);
      if (fb.reverse_depth != null) lines.push(`@@@reverse_depth ${fb.reverse_depth}`);
      if (fb.role) lines.push(`@@@role ${fb.role}`);
    }
  }

  if (conditions) {
    if (conditions.min_turn != null) lines.push(`@@activate_only_after ${conditions.min_turn}`);
    if (conditions.every_n_turns != null) lines.push(`@@activate_only_every ${conditions.every_n_turns}`);
    if (conditions.greeting_index != null) lines.push(`@@is_greeting ${conditions.greeting_index}`);
    if (conditions.user_icon_name) lines.push(`@@is_user_icon ${conditions.user_icon_name}`);
    if (conditions.force_activate) lines.push("@@activate");
    if (conditions.force_deactivate) lines.push("@@dont_activate");
    if (conditions.on_first_match === "keep_active") lines.push("@@keep_activate_after_match");
    if (conditions.on_first_match === "deactivate") lines.push("@@dont_activate_after_match");
    if (conditions.disable_ui_prompts) {
      for (const prompt of conditions.disable_ui_prompts) {
        lines.push(`@@disable_ui_prompt ${prompt}`);
      }
    }
  }

  if (behavior?.ignore_on_max_context) {
    lines.push("@@ignore_on_max_context");
  }

  if (excludeKeys && excludeKeys.length > 0) {
    lines.push(`@@exclude_keys ${excludeKeys.join(",")}`);
  }

  return lines.join("\n");
}

function reverseMapPosition(target: string): string {
  const map: Record<string, string> = {
    "before_desc": "before_char",
    "after_desc": "after_char",
    "chat_history": "chat_history",
    "personality": "personality",
    "scenario": "scenario",
    "prefill": "prefill",
  };
  return map[target] ?? target;
}
