import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { ValidationResult } from "./errors.js";
import { formatErrors } from "./errors.js";
import { getSchemas } from "./schemas.js";

let _validateCardFn: ReturnType<Ajv2020["compile"]> | null = null;
let _validateLorebookFn: ReturnType<Ajv2020["compile"]> | null = null;

function init() {
  if (_validateCardFn) return;
  const s = getSchemas();
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    schemas: [
      s.cardMeta,
      s.cardData,
      s.assetEntry,
      s.lorebook,
      s.lorebookEntry,
      s.cardVariable,
    ],
  });
  addFormats(ajv);
  _validateCardFn = ajv.compile(s.characterCard);
  _validateLorebookFn = ajv.compile(s.lorebookExport);
}

export function validate(data: unknown): ValidationResult {
  init();
  const valid = _validateCardFn!(data);
  if (valid) return { valid: true, errors: [] };
  return {
    valid: false,
    errors: formatErrors(_validateCardFn!.errors ?? []),
  };
}

export function validateLorebook(data: unknown): ValidationResult {
  init();
  const valid = _validateLorebookFn!(data);
  if (valid) return { valid: true, errors: [] };
  return {
    valid: false,
    errors: formatErrors(_validateLorebookFn!.errors ?? []),
  };
}
