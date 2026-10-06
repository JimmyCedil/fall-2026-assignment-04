---
name: kysely-migration-generator
description: Generate a PostgreSQL Kysely TypeScript migration when asked to convert a Mermaid ERD or database diagram in docs/architecture/ into database tables and constraints.
---

# Kysely Migration Generator

## Read the Schema

1. Read the requested Mermaid ERD from docs/architecture/.
   Prefer the .mmd source when available. If only an SVG is supplied
   and its schema cannot be reliably recovered, request its .mmd source.
2. Inspect src/db/migrations/001_initial_schema.ts, other migrations,
   src/db/migrator.ts, and package.json before generating code.
3. Identify existing tables. Do not recreate existing tables or drop
   them in the new migration's down function.
4. Preserve existing column names and types when referencing them.
5. Read Mermaid comments for nullability, defaults, and business rules.
   Clarify important ambiguity instead of inventing constraints.

## Translation Rules

- Convert entity and column names to snake_case.
  For example, USERS becomes users.
- Map int or integer to integer, string to text, boolean to boolean,
  date to date, timestamp to timestamp, and uuid to uuid.
- Use PostgreSQL-compatible Kysely column types.
- For a standalone integer primary key, use an auto-generating type:
  .addColumn('id', 'serial', (col) => col.primaryKey())
- For a standalone UUID primary key, import sql from kysely and use:
  .addColumn('id', 'uuid', (col) =>
    col.primaryKey().defaultTo(sql`gen_random_uuid()`))
- Preserve composite primary keys using addPrimaryKeyConstraint.
  Do not make junction-table foreign keys auto-generating.
- Foreign keys must match the referenced column's type and use:
  .references('parent_table.id').onDelete('cascade')
- For ||--o{, put the foreign key on the many-side table.
  Do not add a unique constraint to that foreign key.
- For ||--o|, put the foreign key on the dependent table and add
  .unique() so each parent has at most one dependent row.
- Determine foreign-key nullability from the parent-side cardinality:
  exactly one parent requires .notNull(); an optional parent permits null.
- Apply .unique() to UK attributes.
- Use junction tables for many-to-many relationships and enforce
  uniqueness of each pair using a composite primary key or constraint.
- Apply documented nullability and defaults to other columns.

## Migration Structure

1. Create parent tables before tables that reference them.
   If dependencies form a cycle, add the affected foreign-key
   constraints after creating the tables.
2. Write a new file:
   src/db/migrations/<timestamp>_<migration_name>.ts
   Use a sortable timestamp such as YYYYMMDDHHmmss.
3. Import Kysely as a type from kysely. Import sql only if needed.
4. Export both functions:

   export async function up(db: Kysely<any>): Promise<void>
   export async function down(db: Kysely<any>): Promise<void>

5. Await every schema operation and end each with .execute().
6. In down, remove any separately added cyclic constraints first,
   then drop only tables created by this migration in reverse
   dependency order.
7. Do not edit previously executed migrations.

## Verification

1. Run npm run build.
2. Fix any TypeScript errors in the new migration and rebuild.
3. Run npm run migrate:up against the local assignment database.
4. If migration execution fails, inspect the error and migration
   state before correcting and retrying.
5. Do not claim success unless both commands pass.

## Final Response

- Reference the generated migration file.
- Explain table relationships and treatment of existing tables.
- Report the actual build and migration results.