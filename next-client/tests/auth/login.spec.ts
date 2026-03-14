import { test, expect } from '@playwright/test';

test.describe('Auth - Login', () => {

  test('TC001 - Candidate login', async ({ page }) => {
    await page.goto('/login?role=candidate');

    await page.locator('#email').fill('you@example.com');
    await page.locator('#password').fill('123');

    await page.getByRole('button', { name: /^Sign in$/ }).click();

    // 允许 /candidate 或 /candidate/
    await expect(page).toHaveURL(/\/candidate\/?$/);

    const value = await page.evaluate(() => localStorage.getItem('candidateLoggedIn'));
    expect(value).toBe('1');
  });

  test('TC002 - Client login', async ({ page }) => {
    await page.goto('/login?role=client');

    await page.locator('#email').fill('client@test.com');
    await page.locator('#password').fill('123');

    await page.getByRole('button', { name: /^Sign in$/ }).click();

    await expect(page).toHaveURL(/\/client\/?$/);

    const value = await page.evaluate(() => localStorage.getItem('clientLoggedIn'));
    expect(value).toBe('1');
  });

  test('TC003 - Recruiter login', async ({ page }) => {
    await page.goto('/login?role=recruiter');

    await page.locator('#email').fill('recruiter@test.com');
    await page.locator('#password').fill('123');

    await page.getByRole('button', { name: /^Sign in$/ }).click();

    await expect(page).toHaveURL(/\/recruiter\/?$/);

    const value = await page.evaluate(() => localStorage.getItem('recruiterLoggedIn'));
    expect(value).toBe('1');
  });

  test('TC004 - Admin login', async ({ page }) => {
    await page.goto('/login?role=admin');

    await page.locator('#email').fill('admin@cataur.com');
    await page.locator('#password').fill('123');

    await page.getByRole('button', { name: /^Sign in$/ }).click();

    await expect(page).toHaveURL(/\/administer\/?$/);

    const value = await page.evaluate(() => localStorage.getItem('adminLoggedIn'));
    expect(value).toBe('1');
  });

});