import { type ReactNode, useId } from 'react';

export function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = 'text',
  maxLength = 2000,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

export function Collection<T extends { id: string }>({
  title,
  singular,
  entries,
  create,
  onChange,
  children,
  limit = 40,
}: {
  title: string;
  singular: string;
  entries: T[];
  create: () => T;
  onChange: (entries: T[]) => void;
  children: (entry: T, update: (patch: Partial<T>) => void) => ReactNode;
  limit?: number;
}) {
  function move(index: number, direction: number) {
    const next = [...entries];
    const other = index + direction;
    const current = next[index];
    const target = next[other];
    if (!current || !target) return;
    [next[index], next[other]] = [target, current];
    onChange(next);
  }
  return (
    <details className="editor-section">
      <summary>
        {title} <span>({entries.length})</span>
      </summary>
      <div className="section-body">
        {entries.length === 0 && (
          <p>Noch keine Einträge. Füge einen Eintrag hinzu.</p>
        )}
        {entries.map((entry, index) => (
          <fieldset className="entry-editor" key={entry.id}>
            <legend>
              {singular} {index + 1}
            </legend>
            {children(entry, (patch) =>
              onChange(
                entries.map((item) =>
                  item.id === entry.id ? { ...item, ...patch } : item,
                ),
              ),
            )}
            <div className="entry-actions">
              <button
                className="button button--small"
                type="button"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                aria-label={`${singular} ${index + 1} nach oben`}
              >
                Nach oben
              </button>
              <button
                className="button button--small"
                type="button"
                disabled={index === entries.length - 1}
                onClick={() => move(index, 1)}
                aria-label={`${singular} ${index + 1} nach unten`}
              >
                Nach unten
              </button>
              <button
                className="button button--small button--danger"
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `${singular} ${index + 1} wirklich entfernen?`,
                    )
                  )
                    onChange(entries.filter((item) => item.id !== entry.id));
                }}
              >
                Entfernen
              </button>
            </div>
          </fieldset>
        ))}
        <button
          className="button"
          type="button"
          disabled={entries.length >= limit}
          onClick={() => onChange([...entries, create()])}
        >
          {singular} hinzufügen
        </button>
        {entries.length >= limit && <p>Maximal {limit} Einträge möglich.</p>}
      </div>
    </details>
  );
}

export function Period({
  start,
  end,
  current,
  onChange,
}: {
  start: string;
  end: string;
  current: boolean;
  onChange: (patch: {
    start?: string;
    end?: string;
    current?: boolean;
  }) => void;
}) {
  const id = useId();
  return (
    <>
      <div className="field-pair">
        <Field
          label="Beginn (JJJJ oder JJJJ-MM)"
          value={start}
          maxLength={7}
          onChange={(start) => onChange({ start })}
        />
        <Field
          label="Ende (JJJJ oder JJJJ-MM)"
          value={end}
          maxLength={7}
          onChange={(end) => onChange({ end })}
        />
      </div>
      <label className="checkbox" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={current}
          onChange={(event) => onChange({ current: event.target.checked })}
        />{' '}
        Bis heute
      </label>
    </>
  );
}
