import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import en from '@/locales/en.json';

/**
 * Keys live in code (ADR 0022): every key used must exist in en.json, and every key in en.json
 * must be used. Keys built at runtime (`errors.<CODE>`, `menu.<key>`, `lang.<code>`) are exempt
 * from the "used" check.
 */
const SRC = resolve('src');
const DYNAMIC_PREFIXES = ['errors.', 'menu.', 'lang.'];
const KEY_LITERAL =
  /['"`]((?:auth|common|shell|status|validation|errors|lang|roles|staff|dashboard)\.[A-Za-z0-9_.-]+)['"`]/g;
const PLURAL = /_(zero|one|two|few|many|other)$/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === 'locales' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

const defined = new Set(Object.keys(en).map((k) => k.replace(PLURAL, '')));
const used = new Set(
  sourceFiles(SRC).flatMap((f) =>
    [...readFileSync(f, 'utf8').matchAll(KEY_LITERAL)].map((m) => m[1]!),
  ),
);

describe('translation keys', () => {
  it('every key used in the code exists in en.json', () => {
    expect([...used].filter((k) => !defined.has(k))).toEqual([]);
  });

  it('every key in en.json is used (runtime-built prefixes excepted)', () => {
    const unused = [...defined].filter(
      (k) => !used.has(k) && !DYNAMIC_PREFIXES.some((p) => k.startsWith(p)),
    );
    expect(unused).toEqual([]);
  });

  it('every value is a non-empty string', () => {
    for (const [k, v] of Object.entries(en))
      expect(typeof v === 'string' && v.length > 0, k).toBe(true);
  });
});
