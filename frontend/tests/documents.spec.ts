import { test, expect } from '@playwright/test';

function generateFakeToken(roles: string[]) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ userId: 1, roles })).toString('base64');
  return `${header}.${payload}.fake_signature`;
}

test.describe('Categorized Document Upload UI', () => {
  test('Clerk can upload categorized documents in Documents tab', async ({ page }) => {
    const clerkToken = generateFakeToken(['Clerk']);

    // Mock initial dashboard and API responses
    await page.route('**/api/cases', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route('**/api/dashboard/metrics', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ summary: { totalCases: 0 }, statusDistribution: [], typeDistribution: [] }) }));
    await page.route('**/api/notifications/unread', route => route.fulfill({ status: 200, body: '[]' }));

    // Mock Case Details
    await page.route('**/api/cases/1', route => route.fulfill({ 
      status: 200, 
      contentType: 'application/json', 
      body: JSON.stringify({ 
        case: { case_id: 1, case_number: 'C-DOC-TEST', status: { name: 'Open' }, case_type_lu: { label: 'Clinical' } }, 
        subjects: [], authorizations: [], court_events: [], investigations: [] 
      }) 
    }));
    await page.route('**/api/cases/1/subjects', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/cases/1/media', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/cases/1/audit', route => route.fulfill({ status: 200, body: '[]' }));
    await page.route('**/api/statuses', route => route.fulfill({ status: 200, body: '[]' }));
    
    // Mock Documents GET to return empty initially, then return the new file after upload
    let uploadCount = 0;
    await page.route('**/api/cases/1/media', async route => {
      if (route.request().method() === 'GET') {
        if (uploadCount === 0) {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        } else {
          await route.fulfill({ 
            status: 200, 
            contentType: 'application/json', 
            body: JSON.stringify([{ media_id: '999', file_path: 'uploads/mlr-report.pdf', category: 'MLR', description: 'Test MLR Description' }]) 
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
    await page.goto('/cases/1');

    // Click AUTHORIZATIONS & DOCUMENTS tab
    await page.getByRole('button', { name: 'AUTHORIZATIONS & DOCUMENTS' }).click();

    // The Categorized Document Upload UI is in the "Case Documents" section at the bottom
    await expect(page.getByRole('heading', { name: 'Case Documents' })).toBeVisible();

    // Verify Document Category select is available
    // There are multiple selects in the Authorizations tab, we target the one under Case Documents
    const documentSection = page.locator('form').filter({ hasText: 'Upload New Document' });
    const categorySelect = documentSection.locator('select');
    await expect(categorySelect).toBeVisible();
    await expect(categorySelect).toContainText('MLR'); // Note: MLR is the actual clinical category, not MLEF
    await expect(categorySelect).toContainText('Investigation Findings');

    // Fill form
    await documentSection.locator('input[type="text"]').fill('Test MLR Description');
    
    // Select category (Document Type)
    await categorySelect.selectOption('MLR');

    // Upload a mock file
    await documentSection.locator('input[type="file"]').setInputFiles({
      name: 'mlr-report.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content')
    });

    // Submit upload
    const uploadPromise = page.waitForResponse(res => res.url().includes('/api/cases/1/media') && res.request().method() === 'POST');
    await documentSection.getByRole('button', { name: 'Upload Document' }).click();
    await uploadPromise;

    // Wait for the document list to re-fetch and render
    await page.waitForResponse(res => res.url().includes('/api/cases/1/media') && res.request().method() === 'GET');

    // Assert that the file appears under the "MLR" heading
    const mlrHeading = page.getByRole('heading', { name: 'MLR' });
    await expect(mlrHeading).toBeVisible();
    
    // Assert the document is rendered correctly
    await expect(page.getByText('Test MLR Description')).toBeVisible();
    await expect(page.getByText('mlr-report.pdf')).toBeVisible();
  });
});
