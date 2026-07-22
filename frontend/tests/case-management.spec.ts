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

  test('Clerk can upload categorized documents in Media Gallery', async ({ page }) => {
    const clerkToken = generateFakeToken(['Clerk']);

    // Mock initial dashboard and API responses
    await page.route('**/api/cases', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/api/dashboard/metrics', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: { totalCases: 0 }, statusDistribution: [], typeDistribution: [] }) }));
    await page.route('**/api/notifications/unread', route => route.fulfill({ status: 200, body: '[]' }));

    // Mock Case Details for a Clinical Case
    await page.route('**/api/cases/2', route => route.fulfill({ 
      status: 200, 
      contentType: 'application/json', 
      body: JSON.stringify({ 
        case: { case_id: 2, case_number: 'C-003', status: { name: 'Open' }, case_type_lu: { label: 'Clinical' } }, 
        subjects: [], authorizations: [], court_events: [], investigations: [] 
      }) 
    }));
    await page.route('**/api/cases/2/subjects', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/cases/2/documents', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/cases/2/audit', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/statuses', route => route.fulfill({ status: 200, body: '[]' }));
    
    // Mock Media GET to return empty initially, then return the new file after upload
    let uploadCount = 0;
    await page.route('**/api/cases/2/media', async route => {
      if (route.request().method() === 'GET') {
        if (uploadCount === 0) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        } else {
          await route.fulfill({ 
            status: 200, 
            contentType: 'application/json', 
            body: JSON.stringify([{ media_id: '99', file_path: 'uploads/fake-report.pdf', category: 'MLEF', description: 'Test description' }]) 
          });
        }
      } else if (route.request().method() === 'POST') {
        uploadCount++;
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      }
    });

    // Login as Clerk
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, clerkToken);

    // Navigate directly to the case
    await page.goto('/cases/2');

    // Click MEDIA tab
    await page.getByRole('button', { name: 'MEDIA' }).click();

    // Verify Clinical categories are available
    const categorySelect = page.getByTestId('document-category-select');
    await expect(categorySelect).toBeVisible();
    await expect(categorySelect).toContainText('MLEF');
    await expect(categorySelect).toContainText('Photographs');

    // Select category and description
    await categorySelect.selectOption('MLEF');
    await page.getByTestId('document-description-input').fill('Test description');

    // Upload a mock file
    await page.getByTestId('document-file-input').setInputFiles({
      name: 'fake-report.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content')
    });

    // Submit upload
    const uploadPromise = page.waitForResponse(res => res.url().includes('/api/cases/2/media') && res.request().method() === 'POST');
    await page.getByTestId('upload-document-button').click();
    await uploadPromise;

    // Wait for the media list to re-fetch and render
    await page.waitForResponse(res => res.url().includes('/api/cases/2/media') && res.request().method() === 'GET');

    // Assert that the file appears in the MLEF section
    const mlefSection = page.getByTestId('category-section-MLEF');
    await expect(mlefSection).toBeVisible();
    await expect(mlefSection.getByTestId('filename-99')).toHaveText('fake-report.pdf');
    await expect(mlefSection).toContainText('Test description');
  });
});
