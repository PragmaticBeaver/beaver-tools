import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('landing links to a local editor; edits persist and JSON round trips', async ({
  page,
}, testInfo) => {
  const origin = new URL(testInfo.project.use.baseURL as string).origin;
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (
      new URL(request.url()).origin !== origin &&
      !request.url().startsWith('data:') &&
      !request.url().startsWith('blob:')
    )
      externalRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Weniger Aufwand',
  );
  await page.getByRole('link', { name: /01.*Lebenslauf-Generator/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Lebenslauf-Generator', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Vollständiger Name').fill('Toni Beispiel');
  await page.getByLabel('Berufsbezeichnung').fill('Produktdesigner');
  await page
    .getByText('Berufserfahrung', { exact: false })
    .filter({ has: page.locator('span') })
    .click();
  await page.getByRole('button', { name: 'Berufsstation hinzufügen' }).click();
  await page.getByLabel('Position', { exact: true }).fill('Design Lead');
  await page.getByLabel('Unternehmen').fill('Beispielwerk');
  await page.getByLabel('Beginn (JJJJ oder JJJJ-MM)').fill('2022-03');
  await page.getByLabel('Bis heute').check();
  await page
    .getByLabel('Aufgaben und Erfolge (eine pro Zeile)')
    .fill('Zugängliche Oberflächen\nTeam begleitet');
  const preview = page.getByRole('article', { name: 'Lebenslauf Vorschau' });
  await expect(preview).toContainText('Toni Beispiel');
  await expect(preview).toContainText('03/2022 – heute');
  await expect(preview.getByRole('listitem')).toHaveCount(2);
  await page.reload();
  await expect(page.getByLabel('Vollständiger Name')).toHaveValue(
    'Toni Beispiel',
  );
  await expect(preview).toContainText('Design Lead');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'JSON exportieren' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('toni-beispiel.json');
  const path = await download.path();
  expect(path).not.toBeNull();
  const buffer = await readFile(path as string);
  expect(JSON.parse(buffer.toString()).person.name).toBe('Toni Beispiel');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Zurücksetzen', exact: true }).click();
  await expect(page.getByLabel('Vollständiger Name')).toHaveValue(
    'Toni Beispiel',
  );
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Zurücksetzen', exact: true }).click();
  await expect(page.getByLabel('Vollständiger Name')).toHaveValue('');
  await page.reload();
  await expect(page.getByLabel('Vollständiger Name')).toHaveValue('');
  page.once('dialog', (dialog) => dialog.accept());
  await page
    .getByLabel('JSON importieren')
    .setInputFiles({ name: 'cv.json', mimeType: 'application/json', buffer });
  await expect(page.getByLabel('Vollständiger Name')).toHaveValue(
    'Toni Beispiel',
  );
  await expect(preview).toContainText('Team begleitet');
  expect(externalRequests).toEqual([]);
});

test('invalid imports and cancelled replacement preserve the current CV', async ({
  page,
}) => {
  await page.goto('/lebenslauf');
  await page.getByLabel('Vollständiger Name').fill('Bleibt erhalten');
  await page.getByLabel('JSON importieren').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{broken'),
  });
  await expect(page.getByRole('alert')).toContainText('kein gültiges JSON');
  await expect(page.getByLabel('Vollständiger Name')).toHaveValue(
    'Bleibt erhalten',
  );
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByLabel('JSON importieren').setInputFiles({
    name: 'other.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({ schemaVersion: 1, person: { name: 'Anderer Name' } }),
    ),
  });
  await expect(page.getByLabel('Vollständiger Name')).toHaveValue(
    'Bleibt erhalten',
  );
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await expect(page.getByLabel('Vollständiger Name')).toHaveValue(
    'Bleibt erhalten',
  );
});

test('all sample sections, entry ordering, narrow layout and print visibility', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lebenslauf');
  const sample = page.getByRole('button', { name: 'Beispiel laden' });
  await sample.focus();
  await expect(sample).toBeFocused();
  page.once('dialog', (dialog) => dialog.accept());
  await page.keyboard.press('Enter');
  const preview = page.getByRole('article', { name: 'Lebenslauf Vorschau' });
  await expect(preview).toContainText('Alex Muster');
  for (const name of [
    'Berufserfahrung',
    'Ausbildung',
    'Kenntnisse',
    'Sprachen',
    'Projekte',
    'Zertifikate',
    'Interessen',
  ])
    await expect(
      preview.getByRole('heading', { name, exact: true }),
    ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.locator('summary').filter({ hasText: 'Berufserfahrung' }).click();
  await page
    .getByRole('button', { name: 'Berufsstation 2 nach oben', exact: true })
    .click();
  await expect(
    page.getByLabel('Position', { exact: true }).first(),
  ).toHaveValue('Frontend-Entwicklerin');
  await expect(preview.getByRole('heading', { level: 4 }).first()).toHaveText(
    'Frontend-Entwicklerin',
  );
  page.once('dialog', (dialog) => dialog.accept());
  await page
    .getByRole('button', { name: 'Entfernen', exact: true })
    .first()
    .click();
  await expect(page.getByLabel('Position', { exact: true })).toHaveCount(1);
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('banner')).toBeHidden();
  await expect(page.getByRole('contentinfo')).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Drucken / PDF speichern' }),
  ).toBeHidden();
  await expect(
    page.getByRole('region', { name: 'Lebenslauf bearbeiten' }),
  ).toBeHidden();
  await expect(preview).toBeVisible();
  await expect(preview).toHaveCSS('border-top-width', '0px');
});

test('storage failures remain visible and JSON export stays available', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
  });
  await page.goto('/lebenslauf');
  await page.getByLabel('Vollständiger Name').fill('Nur im Tab');
  await expect(page.getByRole('alert')).toContainText(
    'Speichern im Browser nicht möglich',
  );
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'JSON exportieren' }).click();
  expect((await download).suggestedFilename()).toBe('nur-im-tab.json');
});

test('corrupted saved data is not silently overwritten', async ({ page }) => {
  await page.goto('/lebenslauf');
  await page.getByLabel('Vollständiger Name').fill('Vorher');
  await page.evaluate(() =>
    localStorage.setItem('beaver-tools.cv.v1', '{broken'),
  );
  await page.reload();
  await expect(page.getByRole('alert')).toContainText(
    'konnten nicht geladen werden',
  );
  await page.getByLabel('Vollständiger Name').fill('Neuer Entwurf');
  await page.reload();
  await expect(page.getByRole('alert')).toContainText(
    'konnten nicht geladen werden',
  );
  page.once('dialog', (dialog) => dialog.accept());
  await page
    .getByRole('button', { name: 'Lokale Speicherung aktivieren' })
    .click();
  await page.getByLabel('Vollständiger Name').fill('Wieder gespeichert');
  await page.reload();
  await expect(page.getByLabel('Vollständiger Name')).toHaveValue(
    'Wieder gespeichert',
  );
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('every CV section can be added and edited', async ({ page }) => {
  await page.goto('/lebenslauf');
  const preview = page.getByRole('article', { name: 'Lebenslauf Vorschau' });
  await page.locator('summary').filter({ hasText: 'Ausbildung' }).click();
  await page
    .getByRole('button', { name: 'Ausbildungsstation hinzufügen' })
    .click();
  await page.getByLabel('Abschluss', { exact: true }).fill('B.Sc. Gestaltung');
  await page
    .getByLabel('Institution', { exact: true })
    .fill('Beispielhochschule');
  await page.locator('summary').filter({ hasText: 'Kenntnisse' }).click();
  await page.getByRole('button', { name: 'Kenntnisgruppe hinzufügen' }).click();
  await page.getByLabel('Gruppe', { exact: true }).fill('Design');
  await page
    .getByLabel('Kenntnisse (eine pro Zeile)')
    .fill('Typografie\nBarrierefreiheit');
  await page.locator('summary').filter({ hasText: 'Sprachen' }).click();
  await page.getByRole('button', { name: 'Sprache hinzufügen' }).click();
  await page.getByLabel('Sprache', { exact: true }).fill('Deutsch');
  await page.getByLabel('Niveau (z. B. B2 oder Muttersprache)').fill('C2');
  await page.locator('summary').filter({ hasText: 'Projekte' }).click();
  await page.getByRole('button', { name: 'Projekt hinzufügen' }).click();
  await page.getByLabel('Projektname').fill('Offene Werkstatt');
  await page.getByLabel('Projekt-URL').fill('javascript:alert(1)');
  await page.locator('summary').filter({ hasText: 'Zertifikate' }).click();
  await page.getByRole('button', { name: 'Zertifikat hinzufügen' }).click();
  await page.getByLabel('Zertifikatname').fill('Zugängliches Design');
  await page.getByLabel('Aussteller').fill('Beispielakademie');
  await page.locator('summary').filter({ hasText: 'Interessen' }).click();
  await page
    .getByLabel('Interessen', { exact: true })
    .fill('Klettern und Lesen');
  for (const text of [
    'B.Sc. Gestaltung',
    'Typografie, Barrierefreiheit',
    'Deutsch · C2',
    'Offene Werkstatt',
    'Zugängliches Design',
    'Klettern und Lesen',
  ])
    await expect(preview).toContainText(text);
  await expect(
    preview.getByRole('link', { name: 'javascript:alert(1)' }),
  ).toHaveCount(0);
  await page.reload();
  for (const text of [
    'B.Sc. Gestaltung',
    'Typografie, Barrierefreiheit',
    'Deutsch · C2',
    'Offene Werkstatt',
    'Zugängliches Design',
    'Klettern und Lesen',
  ])
    await expect(preview).toContainText(text);
});

test('photo is processed locally, previewed and removable', async ({
  page,
}) => {
  await page.goto('/lebenslauf');
  await page.getByLabel('Foto auswählen').setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await expect(
    page.getByRole('img', { name: 'Bewerbungsfoto', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('img', { name: 'Bewerbungsfoto', exact: true }),
  ).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Foto entfernen' }).click();
  await expect(
    page.getByRole('img', { name: 'Bewerbungsfoto', exact: true }),
  ).toHaveCount(0);
});
