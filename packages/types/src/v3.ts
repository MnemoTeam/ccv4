import type { CharacterCardV2Data, CharacterBookV2, CharacterBookEntryV2 } from "./v2.js";

export interface CharacterCardV3 {
  spec: "chara_card_v3";
  spec_version: "3.0";
  data: CharacterCardV3Data;
}

export interface CharacterCardV3Data extends Omit<CharacterCardV2Data, "character_book"> {
  // V3 additions
  nickname?: string;
  creator_notes_multilingual?: Record<string, string>;
  source?: string[];
  group_only_greetings: string[];
  creation_date?: number;       // Unix timestamp
  modification_date?: number;   // Unix timestamp
  character_book?: CharacterBookV3;
  assets?: AssetEntryV3[];
}

export interface CharacterBookV3 extends Omit<CharacterBookV2, "entries"> {
  entries: CharacterBookEntryV3[];
}

export interface CharacterBookEntryV3 extends Omit<CharacterBookEntryV2, "id"> {
  use_regex?: boolean;
  id?: number | string;
}

export interface AssetEntryV3 {
  type: string;
  uri: string;
  name: string;
  ext: string;
}
