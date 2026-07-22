import { test, expect } from '@playwright/test';

function generateFakeToken(roles: string[]) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ userId: 1, roles })).toString('base64');
  return `${header}.${payload}.fake_signature`;
}

test.describe('Notification Polling', () => {
  test('Notification badge updates when new notifications arrive', async ({ page }) => {
    const adminToken = generateFakeToken(['Admin']);
    
    // Install fake timers to control setInterval
    await page.clock.install();

    // 1. Initial mock: 0 notifications
    await page.route('**/api/notifications/unread', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.route('**/api/cases*', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/dashboard/metrics', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: { totalCases: 0, openCases: 0, closedCases: 0 }, statusDistribution: [], typeDistribution: [] }) }));

    // Login
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, adminToken);
    await page.goto('/');

    // Initially, no badge should be visible (badge class is bg-red-600)
    const badge = page.locator('span.bg-red-600');
    await expect(badge).toHaveCount(0);

    // 2. Overwrite mock to return 1 notification
    await page.route('**/api/notifications/unread', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { notification_id: 1, title: 'New lab result', message: 'Tox report uploaded', created_at: new Date().toISOString() }
        ])
      });
    });

    // 3. Fast-forward time by 31 seconds to trigger setInterval
    await page.clock.fastForward(31000);

    // 4. Assert badge updates
    await expect(badge).toHaveCount(1);
    await expect(badge).toHaveText('1');

    // Click the bell to open dropdown and see the message
    await page.getByRole('button').filter({ has: page.locator('svg') }).first().click();
    await expect(page.getByText('New lab result')).toBeVisible();
    await expect(page.getByText('Tox report uploaded')).toBeVisible();
  });
});
