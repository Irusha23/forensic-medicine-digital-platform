import { test, expect } from '@playwright/test';

function generateFakeToken(roles: string[]) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ userId: 1, roles })).toString('base64');
  return `${header}.${payload}.fake_signature`;
}

test.describe('Admin Portal', () => {
  test('Admin can mock creation of a new staff account', async ({ page }) => {
    const adminToken = generateFakeToken(['Admin']);
    
    // Intercept initial GET /users
    await page.route('**/api/users', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { user_id: 1, username: 'admin1', first_name: 'Admin', last_name: 'One', email: 'admin@local', roles: ['Admin'], is_active: true }
          ])
        });
      } else if (route.request().method() === 'POST') {
        // Intercept POST /users (Add User)
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, user_id: 2 })
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/api/cases*', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/notifications/unread', route => route.fulfill({ status: 200, body: '[]' }));

    // Login as Admin
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, adminToken);

    await page.goto('/users');

    // Wait for the table to load
    await expect(page.getByText('admin1')).toBeVisible();

    // Open UserFormModal
    await page.getByRole('button', { name: '+ Add New Staff' }).click();

    // Fill out the form
    await page.getByLabel(/Username/i).fill('newdoc');
    await page.getByLabel(/Password/i).fill('password123');
    await page.getByLabel(/Email/i).fill('doc@local.com');
    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');

    // Assume there is a role checkbox or select. 
    // We will just submit if it's a simple form, or check 'Doctor' if available.
    const doctorCheckbox = page.getByRole('checkbox', { name: 'Doctor' });
    if (await doctorCheckbox.isVisible()) {
      await doctorCheckbox.check();
    }

    // Submit
    const createPromise = page.waitForResponse(res => res.url().includes('/api/users') && res.request().method() === 'POST');
    await page.getByRole('button', { name: 'Create User' }).click();
    await createPromise;

    // The modal should close and it should re-fetch users. 
    // We can assert the modal is gone.
    await expect(page.getByRole('button', { name: 'Create User' })).toHaveCount(0);
  });
});
