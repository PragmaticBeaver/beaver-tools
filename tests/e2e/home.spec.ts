import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`landing is static and usable at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    const externalRequests: string[] = [];
    await context.route('**/*', (route) => {
      if (
        new URL(route.request().url()).origin !==
        new URL(baseURL as string).origin
      ) {
        externalRequests.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    try {
      await page.goto(baseURL as string);
      await expect(
        page.getByRole('heading', { level: 1, name: 'beaver-tools' }),
      ).toBeVisible();
      await expect(
        page.getByText('Noch sind keine Werkzeuge verfügbar.'),
      ).toBeVisible();
      await expect(page.getByRole('link', { name: /Lebenslauf/ })).toHaveCount(
        0,
      );
      await expect(page.getByRole('textbox')).toHaveCount(0);
      // `isolate` comes from Tailwind, not the site's legacy stylesheet.
      await expect(page.locator('.site-shell')).toHaveCSS(
        'isolation',
        'isolate',
      );
      await expect(page.getByRole('main')).toHaveCSS('max-width', '1120px');
      await expect(page.locator('script[src]')).toHaveCount(0);
      await page.keyboard.press('Tab');
      await expect(
        page.getByRole('link', { name: 'Zum Inhalt' }),
      ).toBeFocused();
      await page.getByRole('link', { name: 'Werkzeuge', exact: true }).click();
      await expect(page).toHaveURL(/#werkzeuge$/);
      const scrollWidth = await page
        .locator('html')
        .evaluate((element) => element.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);
      expect(externalRequests).toEqual([]);
    } finally {
      await context.close();
    }
  });
}

test('removed tool route is unavailable and the error page links home', async ({
  page,
}) => {
  const response = await page.goto('/lebenslauf');
  expect(response?.status()).toBe(404);
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'Zur Werkzeugbank' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'beaver-tools' }),
  ).toBeVisible();
});
