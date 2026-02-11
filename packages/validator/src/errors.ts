import type { ErrorObject } from "ajv";

export interface ValidationError {
  path: string;
  message: string;
  keyword: string;
  params: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function formatErrors(ajvErrors: ErrorObject[]): ValidationError[] {
  return ajvErrors.map((err) => ({
    path: err.instancePath || "/",
    message: formatMessage(err),
    keyword: err.keyword,
    params: err.params as Record<string, unknown>,
  }));
}

function formatMessage(err: ErrorObject): string {
  switch (err.keyword) {
    case "required":
      return `Missing required property: "${err.params.missingProperty}"`;
    case "type":
      return `Expected type "${err.params.type}", got ${typeof err.data}`;
    case "enum":
      return `Must be one of: ${(err.params.allowedValues as string[]).join(", ")}`;
    case "const":
      return `Must be "${err.params.allowedValue}"`;
    case "additionalProperties":
      return `Unknown property: "${err.params.additionalProperty}"`;
    case "minimum":
      return `Must be >= ${err.params.limit}`;
    case "maximum":
      return `Must be <= ${err.params.limit}`;
    case "format":
      return `Invalid format: expected "${err.params.format}"`;
    case "pattern":
      return `Does not match pattern: ${err.params.pattern}`;
    case "minItems":
      return `Array must have at least ${err.params.limit} items`;
    default:
      return err.message ?? `Validation failed: ${err.keyword}`;
  }
}
