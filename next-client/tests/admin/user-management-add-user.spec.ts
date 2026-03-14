import { test, expect, type Page, type Locator } from '@playwright/test';

function uniqueEmail(prefix = 'e2e.user') {
  return `${prefix}.${Date.now()}@example.com`;
}

/**
 * ✅ 登录 Recruiter/Admin（你们现在是 recruiter/admin 同一个账号）
 */
async function loginRecruiterAdmin(page: Page) {
  await page.goto('/login?role=recruiter');
  await page.locator('#email').fill('allan@cataur.com');
  await page.locator('#password').fill('123');
  await page.getByRole('button', { name: /^Sign in$/ }).click();

  // 登录后可能到 /recruiter 或 /administer
  await expect(page).toHaveURL(/\/recruiter|\/administer/i);
}

/**
 * ✅ 打开 User Management 页面
 */
async function openUserManagement(page: Page) {
  // 左侧菜单通常是 link 或 button，直接点文字最稳
  await page.getByText(/user management/i).click();
  await expect(page.getByText(/user management/i)).toBeVisible({ timeout: 8000 });
}

/**
 * ✅ 打开 Add User 弹窗，并返回弹窗容器 Locator
 * 关键：不依赖 role=dialog，而是用“Add User 标题”定位弹窗范围
 */
async function openAddUserModal(page: Page): Promise<Locator> {
  // 1) 点击右上角按钮 Add User（这个就是按钮）
  await page.getByRole('button', { name: /^Add User$/i }).click();

  // 2) ✅ 只锁定弹窗标题（heading），避免和按钮撞名
  const title = page.getByRole('heading', { name: /^Add User$/i });
  await expect(title).toBeVisible({ timeout: 8000 });

  // 3) 用标题往上找弹窗容器
  const modal = title.locator('xpath=ancestor::*[self::div or self::section][2]');
  await expect(modal).toBeVisible({ timeout: 8000 });

  // 4) 确认弹窗里有输入框（证明 scope 对）
  await expect(modal.locator('input').first()).toBeVisible({ timeout: 8000 });

  return modal;
}

/**
 * ✅ 填 Add User 表单（按你截图的 placeholder）
 * - Account Name: "e.g. Jane Smith"
 * - Email: "user@example.com"
 * - Phone: "+1 416-555-0000"
 * - Password: type=password
 * - Role: 下拉（Radix/Select 都兼容）
 */
async function fillAddUserForm(modal: Locator, opts: {
  name: string;
  roleText: 'Recruiter' | 'Client';
  email: string;
  phone: string;
  password: string;
}) {
  // 1) Account Name
  await modal.locator('input[placeholder*="Jane"]').fill(opts.name);

  // 2) Role（下拉）
  // 可能是 <select> 或 Radix trigger button
  const roleSelect = modal.locator('select').first();
  if (await roleSelect.count()) {
    await roleSelect.selectOption({ label: opts.roleText });
  } else {
    // Radix 常见：一个按钮/输入触发器
    // 你截图里默认显示 Recruiter，所以我们找弹窗内“Role”下面那个触发器：
    const roleTrigger =
      modal.getByRole('combobox').first()
        .or(modal.locator('button').filter({ hasText: /recruiter|client/i }).first())
        .or(modal.locator('button').filter({ hasText: /role/i }).first());

    await roleTrigger.click();

    // 选项通常渲染在 body portal 外，所以用 page 范围找
    const page = modal.page();
    await page.getByText(new RegExp(`^${opts.roleText}$`, 'i')).click();
  }

  // 3) Email
  await modal.locator('input[placeholder*="user@"]').fill(opts.email);

  // 4) Phone
  await modal.locator('input[placeholder*="+1"]').fill(opts.phone);

  // 5) Password
  await modal.locator('input[type="password"]').fill(opts.password);

  // Status 默认 Active，不用动（如要测试 Disabled 再加）
}

/**
 * ✅ 点击 Confirm
 */
async function confirmAddUser(modal: Locator) {
  await modal.getByRole('button', { name: /confirm/i }).click();
}

test.describe('Admin - User Management (Add User)', () => {
  test('TC-UM-ADD-001 - Admin can add a Recruiter user', async ({ page }) => {
    const email = uniqueEmail('e2e.recruiter');
    const password = 'Password123!';

    await loginRecruiterAdmin(page);
    await openUserManagement(page);

    const modal = await openAddUserModal(page);

    await fillAddUserForm(modal, {
      name: 'E2E Recruiter',
      roleText: 'Recruiter',
      email,
      phone: '+1 403-555-0101',
      password,
    });

    await confirmAddUser(modal);

    // ✅ 断言：列表出现新邮箱
    await expect(page.getByText(email)).toBeVisible({ timeout: 10000 });
  });

  test('TC-UM-ADD-002 - Admin can add a Client user', async ({ page }) => {
    const email = uniqueEmail('e2e.client');
    const password = 'Password123!';

    await loginRecruiterAdmin(page);
    await openUserManagement(page);

    const modal = await openAddUserModal(page);

    await fillAddUserForm(modal, {
      name: 'E2E Client',
      roleText: 'Client',
      email,
      phone: '+1 403-555-0202',
      password,
    });

    await confirmAddUser(modal);

    await expect(page.getByText(email)).toBeVisible({ timeout: 10000 });
  });
});