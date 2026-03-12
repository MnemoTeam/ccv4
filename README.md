# Character Card V4 Specification

A JSON format for character cards used in AI roleplay and chat applications.

Developed at [mnemo.studio](https://mnemo.studio).

## Previous Versions

- [V1 Spec](https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v1.md)
- [V2 Spec](https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md)
- [V3 Spec](https://github.com/kwaroran/character-card-spec-v3/blob/main/SPEC_V3.md)

## What's New in V4

- 3-layer top-level structure (meta, data, assets)
- Structured lorebook decorators (no more string parsing)
- Card variables and new CBS macros
- Recommended settings and prompt overrides
- Related characters and group behavior
- Persona hints
- Content hash integrity system
- Three conformance levels: Minimal, Standard, Full

Full list of changes in [spec/CHANGELOG.md](spec/CHANGELOG.md).

## Repo Layout

```
spec/           Specification documents
schema/         JSON Schema files (draft 2020-12)
packages/
  types/        TypeScript type definitions
  validator/    AJV-based validation
  migrate/      Version migration (up and down)
cli/            Command-line tool
fixtures/       Test data
```

## Packages

### @mnemoteam/types

TypeScript types for V1 through V4 cards.

```
npm install @mnemoteam/types
```

```ts
import type { CharacterCardV4, AnyCharacterCard } from '@mnemoteam/types';
```

Exports: `CharacterCardV1`, `CharacterCardV2`, `CharacterCardV3`, `CharacterCardV4`, `AnyCharacterCard`.

### @mnemoteam/validator

Validates cards against the JSON schemas.

```
npm install @mnemoteam/validator
```

```ts
import { validate, detectVersion } from '@mnemoteam/validator';

const result = validate(card);
if (!result.valid) {
  console.error(result.errors);
}
```

Exports: `validate`, `validateLorebook`, `detectVersion`.

### @mnemoteam/migrate

Migrates cards between versions. Supports V1/V2/V3 to V4, and V4 down to V2/V3.

```
npm install @mnemoteam/migrate
```

```ts
import { migrateV2toV4, migrateV4toV3 } from '@mnemoteam/migrate';

const v4Card = migrateV2toV4(v2Card);
const v3Card = migrateV4toV3(v4Card);
```

Exports: `migrateV1toV4`, `migrateV2toV4`, `migrateV3toV4`, `migrateV4toV2`, `migrateV4toV3`.

## CLI

The `chara` command-line tool for working with character cards.

```
npm install -g @mnemoteam/cli
```

**Validate a card:**

```
chara validate card.json
chara validate lorebook.json --lorebook
```

**Migrate between versions:**

```
chara migrate card.json --to v4
chara migrate card.json --to v2 -o output.json
```

**Show card info:**

```
chara info card.json
```

**Convert between formats:**

```
chara convert card.json card.png
```

## Development

Prerequisites: Node.js >= 20, npm.

```
npm install
npm run build
npm test
```

## License

[MIT](LICENSE)
