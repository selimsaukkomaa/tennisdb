// The stiffness rule (docs/phase-2-data-model.md, D2) and the feel tokens derived from it (D8).
import { describe, expect, test } from 'vitest';
import { assembleDb } from '../../src/core/db';
import { bandFor, feelTokens, stiffnessLabel } from '../../src/core/stiffness';

const db = assembleDb();
const str = (id: string) => db.strings.find((s) => s.id === id)!;

describe('bandFor: each band starts at its lower bound', () => {
  test.each([
    [0.45, 'Very Soft'],
    [0.69, 'Very Soft'],
    [0.7, 'Soft'],
    [0.84, 'Soft'],
    [0.85, 'Med-Soft'],
    [0.91, 'Med-Soft'],
    [0.92, 'Medium'],
    [0.97, 'Medium'],
    [0.98, 'Med-Firm'],
    [1.04, 'Med-Firm'],
    [1.05, 'Firm'],
    [1.09, 'Firm'],
    [1.1, 'Very Firm'],
    [1.2, 'Very Firm'],
  ])('%s kg/mm is %s', (k, band) => expect(bandFor(k)).toBe(band));

  test('a range by its midpoint, without floating-point drift', () => {
    expect(bandFor({ min: 0.85, max: 0.95 })).toBe('Med-Soft'); // 0.90
    expect(bandFor({ min: 0.9, max: 0.95 })).toBe('Medium'); // 0.925
    expect(bandFor({ min: 0.95, max: 1 })).toBe('Medium'); // 0.975
    expect(bandFor({ min: 1.05, max: 1.1 })).toBe('Firm'); // 1.075
  });
});

describe('labels', () => {
  test('derived from the figure', () => {
    expect(stiffnessLabel(str('toroline-o-toro-tour').stiffness)).toBe('Very Firm · 1.10');
    expect(stiffnessLabel(str('restring-sync').stiffness)).toBe('Med-Soft · 0.85–0.95');
    expect(stiffnessLabel(str('grapplesnake-paradox-pro').stiffness)).toBe('Medium · ~0.95');
  });
  test('the stored band without a figure, "Med" folded into "Medium"', () => {
    expect(stiffnessLabel(str('toroline-vamos').stiffness)).toBe('Medium');
    expect(stiffnessLabel(str('toroline-cash').stiffness)).toBe('Med-Firm');
  });
});

describe('feel tokens', () => {
  test('Firm or Soft follows the band, after Crisp and before Plush and Lively', () => {
    expect(feelTokens(str('toroline-o-toro-tour'))).toBe('crisp,firm');
    expect(feelTokens(str('luxilon-alu-power-feel'))).toBe('crisp,soft,lively');
    expect(feelTokens(str('yonex-poly-tour-rev'))).toBe('soft');
    expect(feelTokens(str('toroline-truffle-x'))).toMatch(/^soft,plush/);
  });
  test('a hybrid takes Firm or Soft from its own band', () => {
    const kpop = db.hybrids.find((h) => h.id === 'toroline-k-pop')!;
    expect(feelTokens(kpop)).toBe('crisp,firm');
  });
  test('the 8 strings v1.1 moved from Firm to Soft', () => {
    const moved = [
      'yonex-poly-tour-strike',
      'yonex-poly-tour-rev',
      'restring-sync',
      'grapplesnake-tour-m8',
      'grapplesnake-paradox-pro',
      'luxilon-alu-power-feel',
      'luxilon-4g-soft',
      'tourna-big-hitter-silver-rough',
    ];
    for (const id of moved) expect(feelTokens(str(id)).split(',')).toContain('soft');
  });
});
