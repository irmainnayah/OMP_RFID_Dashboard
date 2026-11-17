import type { BayData } from '../types/bay';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mapApiToBays, parseLocationBays, type ApiBayItem } from '../services/bayMapping.ts';

const NOW = new Date('2026-01-01T10:00:00');

const mk = (loc: string, unit: string, extra: Partial<ApiBayItem> = {}): ApiBayItem => ({
  location_bays: loc,
  unit_number: unit,
  assigned_mechanics: `Mek ${unit}`,
  plan_start_time: '07:30:00',
  estimade_rfu: '2026-01-01 13:30:00',
  ...extra,
});

const ALL: ApiBayItem[] = [
  mk('BAY 01 DALAM', 'D01'), mk('BAY 02 DALAM', 'D02'), mk('BAY 07 DALAM', 'D07'), mk('BAY 08 DALAM', 'D08'),
  mk('BAY 01 LUAR', 'L01'), mk('BAY 02 LUAR', 'L02'), mk('BAY 07 LUAR', 'L07'), mk('BAY 08 LUAR', 'L08'),
];

const byId = (bays: BayData[], id: string) => bays.find((b) => b.id === id)!;

test('4 DALAM + 4 LUAR menghasilkan 8 kartu dengan lokasi benar', () => {
  const { bays, issues } = mapApiToBays(ALL, NOW);
  assert.equal(bays.length, 8);
  assert.equal(issues.length, 0);
  for (const b of bays) {
    const prefix = b.section === 'PARKIRAN DALAM' ? 'D' : 'L';
    assert.equal(b.equipmentId, `${prefix}${b.bayNumber.slice(4)}`);
  }
});

test('nomor sama di lokasi berbeda tidak tertukar', () => {
  const { bays } = mapApiToBays([mk('BAY 01 LUAR', 'L01'), mk('BAY 01 DALAM', 'D01')], NOW);
  assert.equal(byId(bays, 'dalam-bay-01').equipmentId, 'D01');
  assert.equal(byId(bays, 'luar-bay-01').equipmentId, 'L01');
});

test('urutan record tidak berpengaruh', () => {
  const a = mapApiToBays(ALL, NOW).bays;
  const b = mapApiToBays([...ALL].reverse(), NOW).bays;
  assert.deepEqual(a, b);
});

test('bay tanpa data tetap kosong, field lain dipetakan', () => {
  const { bays } = mapApiToBays([mk('BAY 02 LUAR', 'L02')], NOW);
  assert.equal(bays.length, 8);
  assert.equal(bays.filter((b) => b.status === null).length, 7);
  const b = byId(bays, 'luar-bay-02');
  assert.equal(b.status, 'IN_SERVICE');
  assert.equal(b.mechanic, 'Mek L02');
  assert.equal(b.startService, '07:30');
  assert.equal(b.targetFinish, '13:30');
  assert.equal(b.targetFinishDate, new Date('2026-01-01T13:30:00').toISOString());
});

test('OVERDUE jika estimade_rfu sudah lewat', () => {
  const { bays } = mapApiToBays([mk('BAY 01 DALAM', 'D01', { estimade_rfu: '2026-01-01 08:00:00' })], NOW);
  assert.equal(byId(bays, 'dalam-bay-01').status, 'OVERDUE');
});

test('nomor/lokasi tidak dikenal dilewati dan dilaporkan', () => {
  const bad = [
    mk('BAY 03 DALAM', 'X1'), mk('BAY 01', 'X2'), mk('BAY DALAM', 'X3'),
    mk('BAY 01 TENGAH', 'X4'), mk('BAY 01 DALAM LUAR', 'X5'), mk('', 'X6'),
    { unit_number: 'X7' } as ApiBayItem,
  ];
  const { bays, issues } = mapApiToBays(bad, NOW);
  assert.equal(bays.length, 8);
  assert.ok(bays.every((b) => b.status === null));
  assert.equal(issues.length, 7);
  assert.ok(issues.every((i) => i.type === 'UNRECOGNIZED'));
});

test('duplikat tidak dipilih diam-diam: kartu kosong + issue DUPLICATE', () => {
  const { bays, issues } = mapApiToBays(
    [mk('BAY 07 LUAR', 'A'), mk('BAY 07 LUAR', 'B'), mk('BAY 07 DALAM', 'C')],
    NOW,
  );
  assert.equal(bays.length, 8);
  assert.equal(byId(bays, 'luar-bay-07').status, null);
  assert.equal(byId(bays, 'dalam-bay-07').equipmentId, 'C');
  assert.deepEqual(issues, [{ type: 'DUPLICATE', bayKey: 'luar-bay-07', unitNumbers: ['A', 'B'] }]);
});

test('parseLocationBays variasi format', () => {
  assert.equal(parseLocationBays('bays 2 dalam'), 'dalam-bay-02');
  assert.equal(parseLocationBays('BAY 08 LUAR'), 'luar-bay-08');
  assert.equal(parseLocationBays(null), null);
});
