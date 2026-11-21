import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { buildSnapshots, parseFormula } from '../src/engine/cubeMoves';
import { getCubeNet } from '../src/engine/cubeState';

async function readNet(page: Page) {
  const labels = await page.locator('.net-sticker').evaluateAll((stickers) => stickers.map((sticker) => sticker.getAttribute('aria-label')!));
  return labels;
}

function expectedNet(formula: string, cursor: number) {
  const net = getCubeNet(buildSnapshots(parseFormula(formula))[cursor]);
  return (['U', 'L', 'F', 'R', 'B', 'D'] as const).flatMap((face) => net[face].map((color, index) => `${face}${index + 1} ${color}`));
}

async function downloadPng(page: Page, size: string, transparent: boolean, formula: boolean) {
  await page.getByRole('button', { name: 'Export Image' }).click();
  await page.getByLabel('Resolution').selectOption(size);
  await page.getByLabel('Transparent background').setChecked(transparent);
  await page.getByLabel('Include scramble formula').setChecked(formula);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download PNG' }).click(),
  ]);
  return readFile(await download.path());
}

test('generates, animates, inspects, and restores a scramble', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await expect(page.getByText('WebGL ready')).toBeVisible();
  await page.screenshot({ path: 'test-results/cubex-desktop.png', animations: 'disabled', fullPage: true });
  await page.getByRole('button', { name: '22', exact: true }).click();
  await page.getByRole('button', { name: 'Generate Scramble' }).click();
  const moves = page.getByRole('group', { name: 'Scramble moves' }).getByRole('button');
  await expect(moves).toHaveCount(22);
  const formula = (await moves.allTextContents()).join(' ');
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(formula);
  const [txt] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'TXT' }).click()]);
  expect((await readFile(await txt.path(), 'utf8')).trim()).toBe(formula);
  await page.getByRole('button', { name: '2D Net' }).click();
  const finalNet = expectedNet(formula, 22);
  expect(await readNet(page)).toEqual(finalNet);
  await page.getByRole('button', { name: 'Reset Cube' }).click();
  expect(await readNet(page)).toEqual(expectedNet(formula, 0));
  await page.getByRole('button', { name: 'Next move' }).click();
  expect(await readNet(page)).toEqual(expectedNet(formula, 1));
  await page.getByRole('button', { name: 'Previous move' }).click();
  expect(await readNet(page)).toEqual(expectedNet(formula, 0));
  const slider = page.getByRole('slider', { name: 'Playback position' });
  await slider.fill('12');
  expect(await readNet(page)).toEqual(expectedNet(formula, 12));
  await page.getByRole('button', { name: '3D View' }).click();
  await page.getByRole('button', { name: '0.5×', exact: true }).click();
  await page.getByRole('button', { name: 'Restart playback' }).click();
  await expect(page.locator('.move-grid [aria-current="step"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const frozenMove = await slider.inputValue();
  await expect(slider).toHaveValue(frozenMove);
  await page.getByRole('button', { name: '4×', exact: true }).click();
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(slider).toHaveValue('22', { timeout: 20_000 });
  await expect(page.getByText('Scrambled', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '2D Net' }).click();
  expect(await readNet(page)).toEqual(finalNet);
  await page.reload();
  await page.locator('.history-list button').first().click();
  await expect(moves).toHaveCount(22);
  expect((await moves.allTextContents()).join(' ')).toBe(formula);
  await page.getByRole('button', { name: '2D Net' }).click();
  expect(await readNet(page)).toEqual(finalNet);
  await page.getByRole('button', { name: 'Clear history' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clear history' }).click();
  await expect(page.getByText('No scrambles yet')).toBeVisible();
  expect(errors).toEqual([]);
});

test('exports the visible 3D pose at each resolution', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('WebGL ready')).toBeVisible();
  await page.getByRole('button', { name: 'Generate Scramble' }).click();
  const screenshot = await page.locator('.cube-canvas canvas').screenshot({ animations: 'disabled' });
  const png = await downloadPng(page, 'square', true, false);
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.readUInt32BE(20)).toBe(1080);
  const comparison = await page.evaluate(async ({ screenshot, png }) => {
    async function decode(base64: string) {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(bitmap, 0, 0);
      return { width: canvas.width, height: canvas.height, data: ctx.getImageData(0, 0, canvas.width, canvas.height).data };
    }
    const live = await decode(screenshot);
    const edited = await decode(png);
    let samples = 0;
    let matches = 0;
    for (let y = 150; y < 930; y += 11) {
      for (let x = 150; x < 930; x += 11) {
        const index = 4 * (y * edited.width + x);
        const color = edited.data.slice(index, index + 4);
        if (color[3] < 254 || Math.max(...color.slice(0, 3)) - Math.min(...color.slice(0, 3)) < 75) continue;
        const liveX = Math.round(live.width / 2 + (x - 540) * live.height / 1080);
        const liveY = Math.round(y * live.height / 1080);
        const liveIndex = 4 * (liveY * live.width + liveX);
        samples++;
        if (color.slice(0, 3).every((channel, i) => Math.abs(channel - live.data[liveIndex + i]) < 25)) matches++;
      }
    }
    return { samples, matches, cornerAlpha: edited.data[3] };
  }, { screenshot: screenshot.toString('base64'), png: png.toString('base64') });
  expect(comparison.cornerAlpha).toBe(0);
  expect(comparison.samples).toBeGreaterThan(350);
  expect(comparison.matches / comparison.samples).toBeGreaterThan(0.9);

  const canvas = await page.locator('.cube-canvas canvas').boundingBox();
  expect(canvas).toBeTruthy();
  await page.mouse.move(canvas!.x + canvas!.width / 2, canvas!.y + canvas!.height / 2);
  await page.mouse.down();
  await page.mouse.move(canvas!.x + canvas!.width / 2 + 84, canvas!.y + canvas!.height / 2 + 18, { steps: 8 });
  await page.mouse.up();
  const fromAnotherAngle = await downloadPng(page, 'square', true, false);
  expect(fromAnotherAngle.equals(png)).toBe(false);
  await page.getByRole('button', { name: 'Isometric' }).click();
  await expect(page.getByRole('button', { name: 'Isometric' })).toHaveAttribute('aria-pressed', 'true');
  const fullHd = await downloadPng(page, 'fullHd', false, true);
  expect([fullHd.readUInt32BE(16), fullHd.readUInt32BE(20)]).toEqual([1920, 1080]);
  const ultraHd = await downloadPng(page, 'ultraHd', true, false);
  expect([ultraHd.readUInt32BE(16), ultraHd.readUInt32BE(20)]).toEqual([3840, 2160]);
});

test('fits a touch-size viewport and exposes the complete cube net', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Export Image' })).toBeEnabled();
  await page.screenshot({ path: 'test-results/cubex-mobile.png', animations: 'disabled', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole('button', { name: '2D Net' }).tap();
  await expect(page.locator('.net-sticker')).toHaveCount(54);
  await page.close();
});
