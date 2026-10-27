export const CV_SCHEMA_VERSION = 1;

export interface CvPerson {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  birthDate: string;
  summary: string;
  photo: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  highlights: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  description: string;
}

export interface SkillGroup {
  id: string;
  name: string;
  items: string[];
}

export interface LanguageEntry {
  id: string;
  name: string;
  level: string;
  note: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  url: string;
  description: string;
  highlights: string[];
}

export interface CertificateEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface CvDocument {
  schemaVersion: typeof CV_SCHEMA_VERSION;
  person: CvPerson;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillGroup[];
  languages: LanguageEntry[];
  projects: ProjectEntry[];
  certificates: CertificateEntry[];
  interests: string;
}

export function createId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}-${uuid}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function createPerson(): CvPerson {
  return {
    name: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    birthDate: '',
    summary: '',
    photo: '',
  };
}

export function createExperience(): ExperienceEntry {
  return {
    id: createId('experience'),
    role: '',
    company: '',
    location: '',
    start: '',
    end: '',
    current: false,
    highlights: [],
  };
}

export function createEducation(): EducationEntry {
  return {
    id: createId('education'),
    degree: '',
    institution: '',
    location: '',
    start: '',
    end: '',
    current: false,
    description: '',
  };
}

export function createSkillGroup(): SkillGroup {
  return { id: createId('skills'), name: '', items: [] };
}

export function createLanguage(): LanguageEntry {
  return { id: createId('language'), name: '', level: '', note: '' };
}

export function createProject(): ProjectEntry {
  return {
    id: createId('project'),
    name: '',
    url: '',
    description: '',
    highlights: [],
  };
}

export function createCertificate(): CertificateEntry {
  return {
    id: createId('certificate'),
    name: '',
    issuer: '',
    date: '',
    url: '',
  };
}

export function createEmptyCv(): CvDocument {
  return {
    schemaVersion: CV_SCHEMA_VERSION,
    person: createPerson(),
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certificates: [],
    interests: '',
  };
}

export function createSampleCv(): CvDocument {
  const cv = createEmptyCv();
  cv.person = {
    name: 'Alex Muster',
    headline: 'Frontend-Entwicklerin',
    email: 'alex.muster@example.com',
    phone: '+49 30 1234567',
    location: 'Berlin',
    website: 'alex-muster.dev',
    linkedin: 'linkedin.com/in/alex-muster',
    github: 'github.com/alex-muster',
    birthDate: '1994-05-12',
    summary:
      'Frontend-Entwicklerin mit Fokus auf zugängliche, schnelle Webanwendungen. Ich übersetze komplexe Anforderungen in klare Oberflächen und arbeite gern an der Schnittstelle von Design und Technik.',
    photo: '',
  };
  cv.experience = [
    {
      id: createId('experience'),
      role: 'Senior Frontend-Entwicklerin',
      company: 'Nordlicht Digital GmbH',
      location: 'Berlin',
      start: '2022-03',
      end: '',
      current: true,
      highlights: [
        'Entwicklung eines Design-Systems mit React und TypeScript für sechs Produktteams',
        'Verbesserung der Core Web Vitals und Reduktion der Ladezeit um 38 %',
        'Mentoring von zwei Junior-Entwicklerinnen',
      ],
    },
    {
      id: createId('experience'),
      role: 'Frontend-Entwicklerin',
      company: 'Werkstatt Software AG',
      location: 'Leipzig',
      start: '2019-08',
      end: '2022-02',
      current: false,
      highlights: [
        'Umsetzung barrierefreier Formularstrecken nach WCAG 2.1 AA',
        'Einführung von automatisierten Browser-Tests mit Playwright',
      ],
    },
  ];
  cv.education = [
    {
      id: createId('education'),
      degree: 'B.Sc. Medieninformatik',
      institution: 'Hochschule für Technik und Wirtschaft',
      location: 'Leipzig',
      start: '2015-10',
      end: '2019-07',
      current: false,
      description:
        'Schwerpunkt Webentwicklung und Mensch-Computer-Interaktion.',
    },
  ];
  cv.skills = [
    {
      id: createId('skills'),
      name: 'Frontend',
      items: ['TypeScript', 'React', 'Astro', 'CSS', 'Accessibility'],
    },
    {
      id: createId('skills'),
      name: 'Werkzeuge',
      items: ['Git', 'Playwright', 'Biome', 'Figma'],
    },
  ];
  cv.languages = [
    {
      id: createId('language'),
      name: 'Deutsch',
      level: 'Muttersprache',
      note: '',
    },
    {
      id: createId('language'),
      name: 'Englisch',
      level: 'C1',
      note: 'Verhandlungssicher',
    },
  ];
  cv.projects = [
    {
      id: createId('project'),
      name: 'beaver-tools',
      url: 'github.com/PragmaticBeaver/beaver-tools',
      description:
        'Sammlung kleiner, lokal laufender Werkzeuge für den Alltag.',
      highlights: ['Statische Astro-Seite mit React-Inseln'],
    },
  ];
  cv.certificates = [
    {
      id: createId('certificate'),
      name: 'Professional Scrum Master I',
      issuer: 'Scrum.org',
      date: '2023-06',
      url: '',
    },
  ];
  cv.interests = 'Klettern, Typografie, Open Source';
  return cv;
}
