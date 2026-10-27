import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  cvFileName,
  formatDate,
  formatMonth,
  formatRange,
  mailtoHref,
  normalizeIsoDate,
  normalizeMonth,
  safeUrl,
  splitLines,
  splitTags,
} from '../src/lib/cv/format.ts';
import { createEmptyCv, createSampleCv } from '../src/lib/cv/model.ts';
import {
  loadCv,
  normalizeCv,
  parseCvJson,
  STORAGE_KEY,
  saveCv,
  serializeCv,
} from '../src/lib/cv/storage.ts';

test('empty and sample documents round-trip through the versioned format', () => {
  for (const document of [createEmptyCv(), createSampleCv()]) {
    assert.deepEqual(parseCvJson(serializeCv(document)), document);
  }
  const first = createEmptyCv();
  first.person.name = 'Changed';
  assert.equal(createEmptyCv().person.name, '');
});

test('unrelated, malformed and unsupported files cannot replace a CV', () => {
  for (const text of [
    '{',
    'null',
    '[]',
    '{}',
    '{"hello":"world"}',
    '{"schemaVersion":1,"person":null}',
    '{"schemaVersion":"1","person":{}}',
    '{"schemaVersion":2,"person":{}}',
  ]) {
    assert.throws(() => parseCvJson(text));
  }
});

test('imports discard unknown fields and normalize bounded untrusted values', () => {
  const normalized = normalizeCv({
    schemaVersion: 1,
    person: {
      name: ' Alex ',
      email: 42,
      summary: 'x'.repeat(3000),
      photo: 'https://tracking.invalid/photo',
    },
    experience: [
      null,
      {
        id: 'duplicate',
        current: 'true',
        start: '2020-13',
        highlights: [' Text ', 42],
      },
      { id: 'duplicate' },
    ],
    skills: [{ items: Array(60).fill('TypeScript') }],
    malicious: '<script>bad()</script>',
  });
  assert.equal(normalized.person.name, 'Alex');
  assert.equal(normalized.person.email, '');
  assert.equal(normalized.person.summary.length, 2000);
  assert.equal(normalized.person.photo, '');
  assert.equal(normalized.experience.length, 2);
  assert.notEqual(normalized.experience[0].id, normalized.experience[1].id);
  assert.equal(normalized.experience[0].current, false);
  assert.equal(normalized.experience[0].start, '');
  assert.deepEqual(normalized.experience[0].highlights, ['Text']);
  assert.equal(normalized.skills[0].items.length, 30);
  assert.equal('malicious' in normalized, false);
});

test('oversized or non-raster photos are rejected rather than truncated', () => {
  for (const photo of [
    'data:image/svg+xml;base64,PHN2Zz4=',
    'data:image/jpeg;base64,!!!!',
    `data:image/jpeg;base64,${'a'.repeat(600_000)}`,
  ]) {
    const cv = createEmptyCv();
    cv.person.photo = photo;
    assert.equal(normalizeCv(cv).person.photo, '');
  }
});

test('date formatting validates dates without timezone dependence', () => {
  assert.equal(normalizeMonth('2020-02'), '2020-02');
  assert.equal(normalizeMonth('2020'), '2020');
  for (const value of ['1899', '2101', '2020-00', '2020-13', null]) {
    assert.equal(normalizeMonth(value), '');
  }
  assert.equal(formatMonth('2020-02'), '02/2020');
  assert.equal(normalizeIsoDate('2020-02-29'), '2020-02-29');
  assert.equal(normalizeIsoDate('2021-02-29'), '');
  assert.equal(formatDate('1994-05-12'), '12.05.1994');
  assert.equal(formatRange('2020-02', '', true), '02/2020 – heute');
  assert.equal(formatRange('2020', '', false), 'seit 2020');
});

test('links only allow web protocols and list formatting is predictable', () => {
  assert.equal(
    mailtoHref('alex?cv@example.com'),
    'mailto:alex%3Fcv%40example.com',
  );
  assert.equal(mailtoHref('alex@example.com?bcc=other@example.com'), '');
  for (const input of [
    'javascript:alert(1)',
    'data:text/html,bad',
    'file:///etc/passwd',
  ]) {
    assert.equal(safeUrl(input), '');
  }
  assert.equal(safeUrl('example.com'), 'https://example.com/');
  assert.deepEqual(splitLines(' one \r\n\n two '), ['one', 'two']);
  assert.deepEqual(splitTags('React, TypeScript; Astro'), [
    'React',
    'TypeScript',
    'Astro',
  ]);
  assert.equal(cvFileName('../../Alex Muster'), 'alex-muster');
});

test('storage reads are safe for corrupted data and write failures propagate', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(loadCv(storage), null);
  const document = createSampleCv();
  saveCv(storage, document);
  assert.deepEqual(loadCv(storage), document);
  values.set(STORAGE_KEY, '{broken');
  assert.equal(loadCv(storage), null);
  assert.equal(
    loadCv({
      getItem() {
        throw new Error('blocked');
      },
    }),
    null,
  );
  assert.throws(
    () =>
      saveCv(
        {
          setItem() {
            throw new Error('quota');
          },
        },
        document,
      ),
    /quota/,
  );
});
