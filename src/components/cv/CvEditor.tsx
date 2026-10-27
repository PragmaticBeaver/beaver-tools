import { useEffect, useRef, useState } from 'react';
import { cvFileName, joinLines } from '../../lib/cv/format';
import {
  type CvDocument,
  createCertificate,
  createEducation,
  createEmptyCv,
  createExperience,
  createLanguage,
  createProject,
  createSampleCv,
  createSkillGroup,
} from '../../lib/cv/model';
import { resizePhoto } from '../../lib/cv/photo';
import {
  parseCvJson,
  STORAGE_KEY,
  saveCv,
  serializeCv,
} from '../../lib/cv/storage';
import CvPreview from './CvPreview';
import { Collection, Field, Period } from './Fields';

// Preserve unfinished lines while typing, within the persisted schema's limits.
function editLines(value: string, count: number, length: number): string[] {
  return value
    .split('\n')
    .slice(0, count)
    .map((line) => line.slice(0, length));
}

export default function CvEditor() {
  const [initial] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return { cv: stored ? parseCvJson(stored) : createEmptyCv(), error: '' };
    } catch {
      return {
        cv: createEmptyCv(),
        error:
          'Gespeicherte Daten konnten nicht geladen werden. Exportiere vorhandene Sicherungen. Neue Änderungen werden erst nach deiner Bestätigung gespeichert.',
      };
    }
  });
  const [cv, setCv] = useState(initial.cv);
  const [storageError, setStorageError] = useState(initial.error);
  const [canSave, setCanSave] = useState(!initial.error);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoRevision = useRef(0);
  const importRevision = useRef(0);
  useEffect(() => {
    if (!canSave) return;
    try {
      saveCv(localStorage, cv);
      setStorageError('');
    } catch {
      setStorageError(
        'Speichern im Browser nicht möglich. Deine Änderungen sind nur in diesem Tab verfügbar. Bitte als JSON exportieren.',
      );
    }
  }, [cv, canSave]);
  function update<K extends keyof CvDocument>(key: K, value: CvDocument[K]) {
    setCv((current) => ({ ...current, [key]: value }));
  }
  function person(key: keyof CvDocument['person'], value: string) {
    setCv((current) => ({
      ...current,
      person: { ...current.person, [key]: value },
    }));
  }
  function replace(next: CvDocument, question: string, success: string) {
    if (!window.confirm(question)) return;
    photoRevision.current++;
    importRevision.current++;
    setPhotoBusy(false);
    setCv(next);
    setCanSave(true);
    setMessage(success);
    setError('');
  }
  function exportJson() {
    const url = URL.createObjectURL(
      new Blob([serializeCv(cv)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cvFileName(cv.person.name)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      'JSON-Sicherung exportiert. Bewahre sie sicher auf; sie enthält persönliche Daten.',
    );
  }
  async function importJson(file: File) {
    const revision = ++importRevision.current;
    try {
      if (file.size > 2 * 1024 * 1024)
        throw new Error('Die JSON-Datei darf höchstens 2 MB groß sein.');
      const next = parseCvJson(await file.text());
      if (revision !== importRevision.current) return;
      replace(
        next,
        'JSON importieren und den aktuellen Lebenslauf vollständig ersetzen?',
        'Lebenslauf importiert.',
      );
    } catch (cause) {
      if (revision === importRevision.current)
        setError(
          cause instanceof Error ? cause.message : 'Import nicht möglich.',
        );
    }
  }
  async function uploadPhoto(file: File) {
    const revision = ++photoRevision.current;
    setPhotoBusy(true);
    setError('');
    try {
      const photo = await resizePhoto(file);
      if (revision === photoRevision.current) {
        person('photo', photo);
        setMessage('Foto lokal verarbeitet.');
      }
    } catch (cause) {
      if (revision === photoRevision.current)
        setError(cause instanceof Error ? cause.message : 'Foto nicht lesbar.');
    } finally {
      if (revision === photoRevision.current) setPhotoBusy(false);
    }
  }
  return (
    <div className="cv-workspace">
      <section className="cv-toolbar" aria-label="Lebenslauf Aktionen">
        <button
          className="button button--primary"
          type="button"
          onClick={() => window.print()}
        >
          Drucken / PDF speichern
        </button>
        <button className="button" type="button" onClick={exportJson}>
          JSON exportieren
        </button>
        <label className="file-control">
          JSON importieren
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) void importJson(file);
            }}
          />
        </label>
        <button
          className="button"
          type="button"
          onClick={() =>
            replace(
              createSampleCv(),
              'Beispiel laden und den aktuellen Lebenslauf vollständig ersetzen?',
              'Beispiel geladen.',
            )
          }
        >
          Beispiel laden
        </button>
        <button
          className="button button--danger"
          type="button"
          onClick={() =>
            replace(
              createEmptyCv(),
              'Lebenslauf wirklich zurücksetzen? Alle aktuellen Eingaben werden gelöscht.',
              'Lebenslauf zurückgesetzt.',
            )
          }
        >
          Zurücksetzen
        </button>
      </section>
      <div className="cv-notices">
        <p role="status">
          {photoBusy
            ? 'Foto wird lokal verarbeitet …'
            : message ||
              (canSave && !storageError
                ? 'Automatisch in diesem Browser gespeichert.'
                : '')}
        </p>
        {storageError && (
          <div role="alert">
            <p>{storageError}</p>
            {!canSave && (
              <button
                className="button"
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'Lokale Speicherung aktivieren und bisherige gespeicherte Daten überschreiben?',
                    )
                  )
                    setCanSave(true);
                }}
              >
                Lokale Speicherung aktivieren
              </button>
            )}
          </div>
        )}
        {error && <p role="alert">{error}</p>}
        <p>
          PDF: Im Druckdialog „Als PDF speichern“, A4 und Maßstab 100 % wählen.
          Browser-Kopf- und Fußzeilen deaktivieren. Die Vorschau zeigt keine
          Seitenumbrüche.
        </p>
      </div>
      <div className="cv-columns">
        <section className="cv-editor" aria-label="Lebenslauf bearbeiten">
          <h2 className="visually-hidden">Lebenslauf bearbeiten</h2>
          <details className="editor-section" open>
            <summary>Persönliche Angaben</summary>
            <div className="section-body">
              {(
                [
                  ['name', 'Vollständiger Name'],
                  ['headline', 'Berufsbezeichnung'],
                  ['email', 'E-Mail'],
                  ['phone', 'Telefon'],
                  ['location', 'Wohnort'],
                  ['website', 'Website'],
                  ['linkedin', 'LinkedIn'],
                  ['github', 'GitHub'],
                  ['birthDate', 'Geburtsdatum (optional)'],
                ] as const
              ).map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  value={cv.person[key]}
                  maxLength={
                    {
                      name: 120,
                      headline: 160,
                      email: 160,
                      phone: 60,
                      location: 160,
                      website: 500,
                      linkedin: 500,
                      github: 500,
                      birthDate: 10,
                    }[key]
                  }
                  type={
                    key === 'birthDate'
                      ? 'date'
                      : key === 'email'
                        ? 'email'
                        : key === 'phone'
                          ? 'tel'
                          : 'text'
                  }
                  onChange={(value) => person(key, value)}
                />
              ))}
              <Field
                label="Kurzprofil"
                multiline
                value={cv.person.summary}
                onChange={(value) => person('summary', value)}
              />
              <label className="file-control">
                Foto auswählen (optional, bis 8 MB)
                <input
                  type="file"
                  accept="image/*"
                  disabled={photoBusy}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) void uploadPhoto(file);
                  }}
                />
              </label>
              {cv.person.photo && (
                <button
                  className="button button--danger"
                  type="button"
                  onClick={() => {
                    if (window.confirm('Foto entfernen?')) {
                      photoRevision.current++;
                      setPhotoBusy(false);
                      person('photo', '');
                    }
                  }}
                >
                  Foto entfernen
                </button>
              )}
            </div>
          </details>
          <Collection
            title="Berufserfahrung"
            singular="Berufsstation"
            entries={cv.experience}
            create={createExperience}
            onChange={(value) => update('experience', value)}
          >
            {(entry, change) => (
              <>
                <Field
                  label="Position"
                  value={entry.role}
                  maxLength={200}
                  onChange={(role) => change({ role })}
                />
                <Field
                  label="Unternehmen"
                  value={entry.company}
                  maxLength={200}
                  onChange={(company) => change({ company })}
                />
                <Field
                  label="Ort"
                  value={entry.location}
                  maxLength={200}
                  onChange={(location) => change({ location })}
                />
                <Period {...entry} onChange={change} />
                <Field
                  label="Aufgaben und Erfolge (eine pro Zeile)"
                  multiline
                  value={joinLines(entry.highlights)}
                  onChange={(value) =>
                    change({ highlights: editLines(value, 40, 500) })
                  }
                />
              </>
            )}
          </Collection>
          <Collection
            title="Ausbildung"
            singular="Ausbildungsstation"
            entries={cv.education}
            create={createEducation}
            onChange={(value) => update('education', value)}
          >
            {(entry, change) => (
              <>
                <Field
                  label="Abschluss"
                  value={entry.degree}
                  maxLength={200}
                  onChange={(degree) => change({ degree })}
                />
                <Field
                  label="Institution"
                  value={entry.institution}
                  maxLength={200}
                  onChange={(institution) => change({ institution })}
                />
                <Field
                  label="Ort"
                  value={entry.location}
                  maxLength={200}
                  onChange={(location) => change({ location })}
                />
                <Period {...entry} onChange={change} />
                <Field
                  label="Beschreibung"
                  multiline
                  value={entry.description}
                  onChange={(description) => change({ description })}
                />
              </>
            )}
          </Collection>
          <Collection
            title="Kenntnisse"
            singular="Kenntnisgruppe"
            limit={20}
            entries={cv.skills}
            create={createSkillGroup}
            onChange={(value) => update('skills', value)}
          >
            {(entry, change) => (
              <>
                <Field
                  label="Gruppe"
                  value={entry.name}
                  maxLength={200}
                  onChange={(name) => change({ name })}
                />
                <Field
                  label="Kenntnisse (eine pro Zeile)"
                  multiline
                  value={joinLines(entry.items)}
                  onChange={(value) =>
                    change({ items: editLines(value, 30, 80) })
                  }
                />
              </>
            )}
          </Collection>
          <Collection
            title="Sprachen"
            singular="Sprache"
            entries={cv.languages}
            create={createLanguage}
            onChange={(value) => update('languages', value)}
          >
            {(entry, change) => (
              <>
                <Field
                  label="Sprache"
                  value={entry.name}
                  maxLength={200}
                  onChange={(name) => change({ name })}
                />
                <Field
                  label="Niveau (z. B. B2 oder Muttersprache)"
                  value={entry.level}
                  maxLength={80}
                  onChange={(level) => change({ level })}
                />
                <Field
                  label="Anmerkung"
                  value={entry.note}
                  maxLength={200}
                  onChange={(note) => change({ note })}
                />
              </>
            )}
          </Collection>
          <Collection
            title="Projekte"
            singular="Projekt"
            entries={cv.projects}
            create={createProject}
            onChange={(value) => update('projects', value)}
          >
            {(entry, change) => (
              <>
                <Field
                  label="Projektname"
                  value={entry.name}
                  maxLength={200}
                  onChange={(name) => change({ name })}
                />
                <Field
                  label="Projekt-URL"
                  value={entry.url}
                  maxLength={500}
                  onChange={(url) => change({ url })}
                />
                <Field
                  label="Beschreibung"
                  multiline
                  value={entry.description}
                  onChange={(description) => change({ description })}
                />
                <Field
                  label="Projekterfolge (einer pro Zeile)"
                  multiline
                  value={joinLines(entry.highlights)}
                  onChange={(value) =>
                    change({ highlights: editLines(value, 40, 500) })
                  }
                />
              </>
            )}
          </Collection>
          <Collection
            title="Zertifikate"
            singular="Zertifikat"
            entries={cv.certificates}
            create={createCertificate}
            onChange={(value) => update('certificates', value)}
          >
            {(entry, change) => (
              <>
                <Field
                  label="Zertifikatname"
                  value={entry.name}
                  maxLength={200}
                  onChange={(name) => change({ name })}
                />
                <Field
                  label="Aussteller"
                  value={entry.issuer}
                  maxLength={200}
                  onChange={(issuer) => change({ issuer })}
                />
                <Field
                  label="Datum (JJJJ oder JJJJ-MM)"
                  value={entry.date}
                  maxLength={7}
                  onChange={(date) => change({ date })}
                />
                <Field
                  label="Zertifikat-URL"
                  value={entry.url}
                  maxLength={500}
                  onChange={(url) => change({ url })}
                />
              </>
            )}
          </Collection>
          <details className="editor-section">
            <summary>Interessen</summary>
            <div className="section-body">
              <Field
                label="Interessen"
                multiline
                value={cv.interests}
                onChange={(value) => update('interests', value)}
              />
            </div>
          </details>
        </section>
        <CvPreview cv={cv} />
      </div>
    </div>
  );
}
