---
name: erd-generator
description: Generate and validate Mermaid entity-relationship diagrams when asked to design an ERD, database schema, data model, or database architecture diagram from domain requirements.
---

# ERD Generator

## Workflow

1. Read the domain requirements and inspect existing migrations in
   src/db/migrations/ to identify tables that already exist.
2. Identify entities, attributes, primary keys, foreign keys, and
   relationship cardinalities. Clarify important missing business rules
   before generating the diagram.
3. Preserve existing tables and their actual column names and types.
   Mark existing tables with Mermaid comments so downstream migration
   generation knows not to recreate them.
4. Use Mermaid erDiagram syntax. Mark primary keys with PK, foreign
   keys with FK, and unique attributes with UK.
5. Represent many-to-many relationships using junction entities.
6. Use ||--o{ for one-to-many and ||--o| for an optional one-to-one
   relationship. Record nullability, defaults, and other business
   constraints in Mermaid comments.
7. Create docs/architecture/ if necessary, then write the diagram
   directly to docs/architecture/schema.mmd without Markdown fences.
8. From the repository root, execute:

   node .agent/skills/erd-generator/scripts/render_erd.js docs/architecture/schema.mmd

## Validation and Self-Correction

- The renderer must compile the diagram using the local Mermaid CLI.
- If it exits with code 0 and prints SUCCESS, rendering succeeded.
- If it exits with a non-zero code and prints SYNTAX_ERROR:
  1. Read the error trace.
  2. Correct the Mermaid syntax in docs/architecture/schema.mmd.
  3. Run the same renderer command again.
- Allow up to three correction retries after the initial attempt.
- If the error describes an environment or dependency problem, report
  that problem instead of repeatedly changing valid Mermaid syntax.
- If all retries fail, report the final error and do not claim success.

## Final Response

After successful compilation:
- Present the complete diagram in a Mermaid code block.
- Reference docs/architecture/schema.mmd as the source.
- Reference docs/architecture/erd.svg as the rendered image.
- Briefly explain the business decisions and existing tables.