import { test, expect } from '@playwright/test';

function generateFakeToken(roles: string[]) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ userId: 1, roles })).toString('base64');
  return `${header}.${payload}.fake_signature`;
}

test.describe('Case Management Flow', () => {
  test('Doctor can create a new case and fill subject form', async ({ page }) => {
    const doctorToken = generateFakeToken(['Doctor']);

    // Mock initial dashboard requests
    await page.route('**/api/cases', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/api/dashboard/metrics', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: { totalCases: 0, openCases: 0, closedCases: 0 }, statusDistribution: [], typeDistribution: [] }) }));
    await page.route('**/api/cases/statuses', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/notifications/unread', route => route.fulfill({ status: 200, body: '[]' }));

    // Login as Doctor
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, doctorToken);

    await page.goto('/');

    // Navigate to Create New Case
    await page.getByRole('link', { name: 'Create New Case' }).click();
    await expect(page).toHaveURL(/\/cases\/new/);

    // Mock Case Creation POST
    await page.route('**/api/cases', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ case_id: 1, case_number: 'C-002' })
        });
      } else {
        await route.continue();
      }
    });

    // We need to mock the Case Details page endpoints because navigate(`/cases/${res.data.case_id}`) will hit them
    await page.route('**/api/cases/1', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ case: { case_id: 1, case_number: 'C-002', status: { name: 'Open' } }, subjects: [], authorizations: [], court_events: [], investigations: [] }) }));
    await page.route('**/api/cases/1/subjects', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      } else if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      }
    });
    await page.route('**/api/cases/1/media', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/cases/1/documents', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/cases/1/audit', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/statuses', route => route.fulfill({ status: 200, body: '[]' }));

    // Fill Case details
    await page.getByLabel('Case Number').fill('C-002');
    
    // Submit
    const caseCreatePromise = page.waitForResponse(res => res.url().includes('/api/cases') && res.request().method() === 'POST');
    await page.getByRole('button', { name: 'Create Case' }).click();
    await caseCreatePromise;

    // Verify we land on case detail page
    await expect(page).toHaveURL(/\/cases\/1/);

    // Click SUBJECTS tab
    await page.getByRole('button', { name: 'SUBJECTS' }).click();

    // Fill Subject form
    await page.getByLabel('Subject Type').selectOption('Victim');
    await page.getByLabel('Full Name').fill('Jane Doe');
    await page.getByLabel('NIC').fill('123456789V');

    // Submit Subject form
    const subjectCreatePromise = page.waitForResponse(res => res.url().includes('/api/cases/1/subjects') && res.request().method() === 'POST');
    await page.getByRole('button', { name: 'Add Subject' }).click();
    const subjectRes = await subjectCreatePromise;
    
    // Assert payload sent
    const payload = subjectRes.request().postDataJSON();
    expect(payload.full_name).toBe('Jane Doe');
    expect(payload.nic).toBe('123456789V');
  });
});
