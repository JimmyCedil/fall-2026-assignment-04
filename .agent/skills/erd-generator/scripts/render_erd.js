import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const input = resolve(
  process.argv[2] ?? 'docs/architecture/schema.mmd'
);
const output = resolve('docs/architecture/erd.svg');

try {
  if (!existsSync(input)) {
    throw new Error(`Input file not found: ${input}`);
  }

  mkdirSync(dirname(output), { recursive: true });

  // Remove any previous diagram so a failed run cannot look successful.
  rmSync(output, { force: true });

  const result = spawnSync(
    'npx',
    ['--no-install', 'mmdc', '-i', input, '-o', output],
    { encoding: 'utf8' }
  );

  if (result.error || result.status !== 0) {
    throw new Error(
      result.stderr?.trim() ||
      result.error?.message ||
      result.stdout?.trim() ||
      `Mermaid CLI failed with status ${result.status}`
    );
  }

  if (!existsSync(output) || statSync(output).size === 0) {
    throw new Error('Mermaid CLI did not create a nonempty SVG.');
  }

  console.log('SUCCESS');
  process.exitCode = 0;
} catch (error) {
  rmSync(output, { force: true });
  console.error(
    `SYNTAX_ERROR: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
}