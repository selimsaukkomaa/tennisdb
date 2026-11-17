// HTML string building with escaping by default, in the same string-template idiom as v0.990.
// Interpolated values are escaped unless wrapped in raw(); arrays are rendered and joined.

export class SafeHtml {
  constructor(readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

/** Escapes & < > " exactly as v0.990's esc() did. */
export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Marks trusted markup to pass through unescaped: the views' own fixed markup and the HTML copy
 * in content/copy.json. Nothing in data/ is HTML since v1.0 (validate.ts: plain-text).
 */
export function raw(s: string | null | undefined): SafeHtml {
  return new SafeHtml(s ?? '');
}

type Value = SafeHtml | string | number | boolean | null | undefined | readonly Value[];

function render(v: Value): string {
  if (v == null || v === false) return '';
  if (v instanceof SafeHtml) return v.value;
  if (Array.isArray(v)) return v.map(render).join('');
  return esc(v);
}

export function html(strings: TemplateStringsArray, ...values: Value[]): SafeHtml {
  let out = strings[0]!;
  for (let i = 0; i < values.length; i++) out += render(values[i]!) + strings[i + 1]!;
  return new SafeHtml(out);
}

/** Joins rendered items with a separator, e.g. gauges with <br>. */
export function join(items: readonly Value[], sep: SafeHtml): SafeHtml {
  return new SafeHtml(items.map(render).join(sep.value));
}
