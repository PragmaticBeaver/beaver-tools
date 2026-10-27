import type { ReactNode } from 'react';
import {
  displayUrl,
  formatDate,
  formatMonth,
  formatRange,
  safeUrl,
} from '../../lib/cv/format';
import type { CvDocument } from '../../lib/cv/model';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cv-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
function Link({ value }: { value: string }) {
  const href = safeUrl(value);
  return href ? (
    <a href={href} rel="noreferrer">
      {displayUrl(value)}
    </a>
  ) : (
    <span>{value}</span>
  );
}
function Highlights({ items }: { items: string[] }) {
  return items.length ? (
    <ul>
      {[...new Set(items.filter(Boolean))].map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  ) : null;
}
export default function CvPreview({ cv }: { cv: CvDocument }) {
  const { person } = cv;
  return (
    <section className="preview-panel" aria-label="Live-Vorschau">
      <h2 className="preview-label">Live-Vorschau</h2>
      <article className="cv-paper" aria-label="Lebenslauf Vorschau">
        <header className="cv-header">
          {person.photo && (
            <img
              className="cv-photo"
              src={person.photo}
              alt={`Bewerbungsfoto${person.name ? ` von ${person.name}` : ''}`}
            />
          )}
          <h2>{person.name || 'Dein Name'}</h2>
          {person.headline && <p className="cv-headline">{person.headline}</p>}
          <div className="cv-contact">
            {(['location', 'email', 'phone'] as const)
              .filter((key) => person[key])
              .map((key) => (
                <p key={key}>{person[key]}</p>
              ))}
            {person.birthDate && (
              <p>Geboren am {formatDate(person.birthDate)}</p>
            )}
            {(['website', 'linkedin', 'github'] as const)
              .filter((key) => person[key])
              .map((key) => (
                <p key={key}>
                  <Link value={person[key]} />
                </p>
              ))}
          </div>
        </header>
        {person.summary && (
          <Section title="Profil">
            <p className="preserve-lines">{person.summary}</p>
          </Section>
        )}
        {cv.experience.length > 0 && (
          <Section title="Berufserfahrung">
            {cv.experience.map((entry) => (
              <div className="cv-entry" key={entry.id}>
                <p className="cv-date">
                  {formatRange(entry.start, entry.end, entry.current)}
                </p>
                <h4>{entry.role}</h4>
                <p>
                  {[entry.company, entry.location].filter(Boolean).join(' · ')}
                </p>
                <Highlights items={entry.highlights} />
              </div>
            ))}
          </Section>
        )}
        {cv.education.length > 0 && (
          <Section title="Ausbildung">
            {cv.education.map((entry) => (
              <div className="cv-entry" key={entry.id}>
                <p className="cv-date">
                  {formatRange(entry.start, entry.end, entry.current)}
                </p>
                <h4>{entry.degree}</h4>
                <p>
                  {[entry.institution, entry.location]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className="preserve-lines">{entry.description}</p>
              </div>
            ))}
          </Section>
        )}
        {cv.skills.length > 0 && (
          <Section title="Kenntnisse">
            {cv.skills.map((entry) => (
              <p className="cv-entry" key={entry.id}>
                <strong>
                  {entry.name}
                  {entry.name && ': '}
                </strong>
                {entry.items.join(', ')}
              </p>
            ))}
          </Section>
        )}
        {cv.languages.length > 0 && (
          <Section title="Sprachen">
            {cv.languages.map((entry) => (
              <p className="cv-entry" key={entry.id}>
                <strong>{entry.name}</strong>
                {entry.level && ` · ${entry.level}`}
                {entry.note && ` — ${entry.note}`}
              </p>
            ))}
          </Section>
        )}
        {cv.projects.length > 0 && (
          <Section title="Projekte">
            {cv.projects.map((entry) => (
              <div className="cv-entry" key={entry.id}>
                <h4>{entry.name}</h4>
                {entry.url && (
                  <p>
                    <Link value={entry.url} />
                  </p>
                )}
                <p className="preserve-lines">{entry.description}</p>
                <Highlights items={entry.highlights} />
              </div>
            ))}
          </Section>
        )}
        {cv.certificates.length > 0 && (
          <Section title="Zertifikate">
            {cv.certificates.map((entry) => (
              <div className="cv-entry" key={entry.id}>
                <p className="cv-date">{formatMonth(entry.date)}</p>
                <h4>{entry.name}</h4>
                <p>{entry.issuer}</p>
                {entry.url && (
                  <p>
                    <Link value={entry.url} />
                  </p>
                )}
              </div>
            ))}
          </Section>
        )}
        {cv.interests && (
          <Section title="Interessen">
            <p className="preserve-lines">{cv.interests}</p>
          </Section>
        )}
      </article>
    </section>
  );
}
