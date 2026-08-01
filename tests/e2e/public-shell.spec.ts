import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('a entrada do produto é funcional em todos os viewports', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(pageErrors).toEqual([]);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('.brand')).toContainText('condologpro');
  await expect(
    page.getByText(/Entre para continuar|Ambiente sem Supabase configurado/)
  ).toBeVisible();
});

test('a entrada não tem violações automáticas críticas', async ({ page }) => {
  await page.goto('/');
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((violation) => violation.impact === 'critical')).toEqual([]);
});
