import { normalizeIsoDate, normalizeMonth } from './format.ts';
import {
  type CertificateEntry,
  CV_SCHEMA_VERSION,
  type CvDocument,
  createId,
  type EducationEntry,
  type ExperienceEntry,
  type LanguageEntry,
  type ProjectEntry,
  type SkillGroup,
} from './model.ts';

export const STORAGE_KEY = 'beaver-tools.cv.v1';

const MAX_TEXT = 200;
const MAX_LONG_TEXT = 2000;
const MAX_HIGHLIGHTS = 40;
const MAX_HIGHLIGHT_LENGTH = 500;
const MAX_ENTRIES = 40;
const MAX_SKILL_GROUPS = 20;
const MAX_SKILL_ITEMS = 30;
const MAX_PHOTO_LENGTH = 600_000;

export class CvImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CvImportError';
  }
}

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, max = MAX_TEXT): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, MAX_LONG_TEXT) : '';
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asArray(value: unknown, max = MAX_ENTRIES): unknown[] {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

function asPhoto(value: unknown): string {
  if (typeof value !== 'string') return '';
  if (value.length > MAX_PHOTO_LENGTH) return '';
  if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(value))
    return '';
  return value;
}

function asId(value: unknown, prefix: string, used: Set<string>): string {
  const candidate = asString(value, 120);
  if (candidate && !used.has(candidate)) {
    used.add(candidate);
    return candidate;
  }
  const generated = createId(prefix);
  used.add(generated);
  return generated;
}

function asHighlights(value: unknown): string[] {
  return asArray(value, MAX_HIGHLIGHTS)
    .map((item) => asString(item, MAX_HIGHLIGHT_LENGTH))
    .filter(Boolean);
}

function normalizeExperience(
  value: unknown,
  used: Set<string>,
): ExperienceEntry | null {
  const entry = asObject(value);
  if (!entry) return null;
  return {
    id: asId(entry.id, 'experience', used),
    role: asString(entry.role),
    company: asString(entry.company),
    location: asString(entry.location),
    start: normalizeMonth(entry.start),
    end: normalizeMonth(entry.end),
    current: asBoolean(entry.current),
    highlights: asHighlights(entry.highlights),
  };
}

function normalizeEducation(
  value: unknown,
  used: Set<string>,
): EducationEntry | null {
  const entry = asObject(value);
  if (!entry) return null;
  return {
    id: asId(entry.id, 'education', used),
    degree: asString(entry.degree),
    institution: asString(entry.institution),
    location: asString(entry.location),
    start: normalizeMonth(entry.start),
    end: normalizeMonth(entry.end),
    current: asBoolean(entry.current),
    description: asText(entry.description),
  };
}

function normalizeSkillGroup(
  value: unknown,
  used: Set<string>,
): SkillGroup | null {
  const group = asObject(value);
  if (!group) return null;
  return {
    id: asId(group.id, 'skills', used),
    name: asString(group.name),
    items: asArray(group.items, MAX_SKILL_ITEMS)
      .map((item) => asString(item, 80))
      .filter(Boolean),
  };
}

function normalizeLanguage(
  value: unknown,
  used: Set<string>,
): LanguageEntry | null {
  const entry = asObject(value);
  if (!entry) return null;
  return {
    id: asId(entry.id, 'language', used),
    name: asString(entry.name),
    level: asString(entry.level, 80),
    note: asString(entry.note),
  };
}

function normalizeProject(
  value: unknown,
  used: Set<string>,
): ProjectEntry | null {
  const entry = asObject(value);
  if (!entry) return null;
  return {
    id: asId(entry.id, 'project', used),
    name: asString(entry.name),
    url: asString(entry.url, 500),
    description: asText(entry.description),
    highlights: asHighlights(entry.highlights),
  };
}

function normalizeCertificate(
  value: unknown,
  used: Set<string>,
): CertificateEntry | null {
  const entry = asObject(value);
  if (!entry) return null;
  return {
    id: asId(entry.id, 'certificate', used),
    name: asString(entry.name),
    issuer: asString(entry.issuer),
    date: normalizeMonth(entry.date),
    url: asString(entry.url, 500),
  };
}

function normalizeList<T>(
  value: unknown,
  normalize: (entry: unknown, used: Set<string>) => T | null,
  max = MAX_ENTRIES,
): T[] {
  const used = new Set<string>();
  return asArray(value, max)
    .map((item) => normalize(item, used))
    .filter((item): item is T => item !== null);
}

export function normalizeCv(input: unknown): CvDocument {
  const root = asObject(input);
  if (!root) {
    throw new CvImportError(
      'Die Datei enthält kein gültiges Lebenslauf-Objekt.',
    );
  }
  const version = root.schemaVersion;
  if (typeof version === 'number' && version > CV_SCHEMA_VERSION) {
    throw new CvImportError(
      'Die Datei stammt aus einer neueren Version und kann nicht gelesen werden.',
    );
  }

  if (version !== CV_SCHEMA_VERSION || !asObject(root.person)) {
    throw new CvImportError(
      'Bitte eine exportierte beaver-tools-Lebenslaufdatei wählen.',
    );
  }

  const person = asObject(root.person) ?? ({} as Record<string, unknown>);
  return {
    schemaVersion: CV_SCHEMA_VERSION,
    person: {
      name: asString(person.name, 120),
      headline: asString(person.headline, 160),
      email: asString(person.email, 160),
      phone: asString(person.phone, 60),
      location: asString(person.location, 160),
      website: asString(person.website, 500),
      linkedin: asString(person.linkedin, 500),
      github: asString(person.github, 500),
      birthDate: normalizeIsoDate(person.birthDate),
      summary: asText(person.summary),
      photo: asPhoto(person.photo),
    },
    experience: normalizeList(root.experience, normalizeExperience),
    education: normalizeList(root.education, normalizeEducation),
    skills: normalizeList(root.skills, normalizeSkillGroup, MAX_SKILL_GROUPS),
    languages: normalizeList(root.languages, normalizeLanguage),
    projects: normalizeList(root.projects, normalizeProject),
    certificates: normalizeList(root.certificates, normalizeCertificate),
    interests: asText(root.interests),
  };
}

export function parseCvJson(text: string): CvDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new CvImportError('Die Datei ist kein gültiges JSON.');
  }
  return normalizeCv(parsed);
}

export function serializeCv(document: CvDocument): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}

export function loadCv(storage: Storage): CvDocument | null {
  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return normalizeCv(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function saveCv(storage: Storage, document: CvDocument): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(document));
}
