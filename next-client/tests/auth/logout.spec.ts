import { test, expect, type Page } from '@playwright/test';

type Role = 'recruiter' | 'client' | 'candidate';

const accounts: Record<Role, { email: string; password: string; homeUrl: RegExp; protectedPath: string }> = {
  // ✅ 依据你日志：登录后到了 /recruiter
  recruiter: {
    email: 'allan@cataur.com',
    password: '123',
    homeUrl: /\/recruiter\/?$/,
    protectedPath: '/recruiter',
  },

  client: {
    email: 'client@example.com',
    password: '123',
    homeUrl: /\/client\/?$/,
    protectedPath: '/client',
  },

  candidate: {
    email: 'allan@cataur.com',
    password: '123',
    homeUrl: /\/candidate\/?$/,
    protectedPath: '/candidate',
  },
};

async function loginAs(page: Page, role: Role) {
  await page.goto(`/login?role=${role}`);
  await page.locator('#email').fill(accounts[role].email);
  await page.locator('#password').fill(accounts[role].password);
  await page.getByRole('button', { name: /^Sign in$/ }).click();
  await expect(page).toHaveURL(accounts[role].homeUrl);
}

/**
 * ✅ 打开用户菜单：优先点击右上角头像字母（AR/CC/A），不行再退回到右上角可见按钮最后一个
 */
async function openUserMenu(page: Page) {
  // 1) 常见 avatar 文本：AR / CC / A
  const avatarByText = page.locator('button:visible').filter({ hasText: /^[A-Z]{1,3}$/ }).last();
  if (await avatarByText.count()) {
    await avatarByText.click();
  } else {
    // 2) 退回方案：header 里最后一个可见按钮（通常就是头像）
    const btns = page.locator('header button:visible');
    const n = await btns.count();
    await btns.nth(n - 1).click();
  }
}

async function logout(page: Page) {
  await openUserMenu(page);

  // ✅ 兼容三种文案：Log out / Logout / Sign Out
  const logoutItem = page.getByText(/log\s*out|logout|sign\s*out/i).first();

  // 如果菜单没打开，这里会找不到——所以先确保可见
  await expect(logoutItem).toBeVisible({ timeout: 8000 });
  await logoutItem.click();

  await expect(page).toHaveURL(/\/login/);
}

test.describe('Auth - Logout (3 roles)', () => {
  test('TC-LOGOUT-RECRUITER - Recruiter can logout and is blocked', async ({ page }) => {
    await loginAs(page, 'recruiter');
    await logout(page);

    await page.goto(accounts.recruiter.protectedPath);
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-LOGOUT-CLIENT - Client can logout and is blocked', async ({ page }) => {
    await loginAs(page, 'client');
    await logout(page);

    await page.goto(accounts.client.protectedPath);
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-LOGOUT-CANDIDATE - Candidate can logout and is blocked', async ({ page }) => {
    await loginAs(page, 'candidate');
    await logout(page);

    await page.goto(accounts.candidate.protectedPath);
    await expect(page).toHaveURL(/\/login/);
  });
});