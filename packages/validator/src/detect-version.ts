export type CardVersion = "v1" | "v2" | "v3" | "v4" | "unknown";

export function detectVersion(data: unknown): CardVersion {
  if (typeof data !== "object" || data === null) {
    return "unknown";
  }

  const obj = data as Record<string, unknown>;

  // V4: spec === "chara_card_v4"
  if (obj.spec === "chara_card_v4") {
    return "v4";
  }

  // V3: spec === "chara_card_v3"
  if (obj.spec === "chara_card_v3") {
    return "v3";
  }

  // V2: spec === "chara_card_v2"
  if (obj.spec === "chara_card_v2") {
    return "v2";
  }

  // V1: flat object with name, description, personality, scenario, first_mes, mes_example
  if (
    typeof obj.name === "string" &&
    typeof obj.description === "string" &&
    typeof obj.personality === "string" &&
    typeof obj.scenario === "string" &&
    typeof obj.first_mes === "string" &&
    typeof obj.mes_example === "string" &&
    !("spec" in obj) &&
    !("data" in obj)
  ) {
    return "v1";
  }

  return "unknown";
}
