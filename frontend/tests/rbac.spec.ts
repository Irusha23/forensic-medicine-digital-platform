import { test, expect } from '@playwright/test';

function generateFakeToken(roles: string[]) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ userId: 1, roles })).toString('base64');
  return `${header}.${payload}.fake_signature`;
}

test.describe('Role-Based UI Rendering', () => {
  test('Clerk role cannot see Users link or Issue Official Report button', async ({ page }) => {
    const clerkToken = generateFakeToken(['Clerk']);
    
    await page.route('**/api/cases*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { case_id: 1, case_number: 'C-001', caseType: 'clinical', status: { name: 'Open' } }
        ])
      });
    });
    
    await page.route('**/api/notifications/unread', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/dashboard/metrics', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: { totalCases: 0, openCases: 0, closedCases: 0 }, statusDistribution: [], typeDistribution: [] }) }));

    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, clerkToken);

    await page.goto('/');

    const usersLink = page.getByRole('link', { name: 'Users' });
    await expect(usersLink).toHaveCount(0);

    await page.route('**/api/cases/1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          case: { case_id: 1, case_number: 'C-001', caseType: 'clinical', status: { name: 'Open' } },
          subjects: [],
          authorizations: [],
          court_events: [],
          investigations: []
        })
      });
    });

    await page.route('**/api/cases/1/media', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/cases/1/documents', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/cases/1/audit', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/statuses', route => route.fulfill({ status: 200, body: '[]' }));

    await page.goto('/cases/1');

    const issueReportBtn = page.getByRole('button', { name: 'Issue Official Report' });
    await expect(issueReportBtn).toHaveCount(0);
  });
});
