export * from "./v1.js";
export * from "./v2.js";
export * from "./v3.js";
export * from "./v4.js";

// Union type for version detection
import type { CharacterCardV1 } from "./v1.js";
import type { CharacterCardV2 } from "./v2.js";
import type { CharacterCardV3 } from "./v3.js";
import type { CharacterCardV4 } from "./v4.js";

export type AnyCharacterCard =
	| CharacterCardV1
	| CharacterCardV2
	| CharacterCardV3
	| CharacterCardV4;
