import { test, expect, type Page } from '@playwright/test';

function uniqueEmail(prefix = 'e2e.candidate') {
  return `${prefix}.${Date.now()}@example.com`;
}

async function goToCandidateRegister(page:Page) {
  await page.goto('/login?role=candidate');

  const createOne = page.getByText(/create one/i).first();
  await expect(createOne).toBeVisible({ timeout: 8000 });
  await createOne.click();

  await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible({ timeout: 8000 });
}

test.describe('Auth - Candidate Register', () => {
  test('TC-REG-001 - Candidate can create account (self-register)', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'Password123!';

    await goToCandidateRegister(page);

    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder(/at least 8 characters/i).fill(password);
    await page.getByPlaceholder(/repeat password/i).fill(password);

    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).not.toHaveURL(/register/i);
  });

  test('TC-REG-002 - Candidate register validation: passwords mismatch', async ({ page }) => {
    const email = uniqueEmail('e2e.mismatch');

    await goToCandidateRegister(page);

    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder(/at least 8 characters/i).fill('Password123!');
    await page.getByPlaceholder(/repeat password/i).fill('Password123!!');

    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText(/^Passwords do not match\.$/)).toBeVisible();
  });
});