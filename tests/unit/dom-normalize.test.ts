// The DOM parity spec erases only the declared differences; everything else must survive.
import { expect, test } from 'vitest';
import { describeDifference, eraseDeclaredDifferences } from '../visual/dom';

test('erases the version text, backup buttons, empty footer and entry ids', () => {
  const app = [
    '<div class="version-tag">',
    '  "v0.991"',
    '<div class="log-panel-footer">',
    '  <span class="log-backup">',
    '    <button class="log-backup-btn">',
    '      "Export log"',
    '<div class="log-entry" data-entry-id="6f1c2a5e-8f3b-4c2d-9e1a-0b7c4d5e6f70">',
  ];
  const legacy = [
    '<div class="version-tag">',
    '  "v0.990"',
    '<div class="log-entry" data-entry-id="1792672152774-3h707t">',
  ];
  expect(eraseDeclaredDifferences(app)).toEqual(eraseDeclaredDifferences(legacy));
});

test('keeps a footer that still has the Clear all button', () => {
  const lines = [
    '<div class="log-panel-footer">',
    '  <span class="log-backup">',
    '    <button class="log-backup-btn">',
    '  <button class="log-wipe-btn" data-log-wipe="regna">',
  ];
  expect(eraseDeclaredDifferences(lines)).toEqual([
    '<div class="log-panel-footer">',
    '  <button class="log-wipe-btn" data-log-wipe="regna">',
  ]);
});

test('leaves every other difference visible', () => {
  const a = [
    '<div class="version-tag">',
    '  "v0.990"',
    '<span class="ctx-strung-empty">',
    '  "nothing logged yet"',
  ];
  const b = [
    '<div class="version-tag">',
    '  "v0.991"',
    '<span class="ctx-strung-empty">',
    '  "nothing logged"',
  ];
  // The version text is erased; the context-line change must still show.
  const diff = describeDifference(eraseDeclaredDifferences(a), eraseDeclaredDifferences(b));
  expect(diff).toMatch(/differs at line 3/);
  expect(diff).toContain('"nothing logged"');
  expect(describeDifference(a, a)).toBe('');
});
