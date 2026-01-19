import { test, expect } from '@playwright/test';

const USER_A_EMAIL = `user-a-${Date.now()}@example.com`;
const USER_B_EMAIL = `user-b-${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123!';

test.describe('Security & Isolation', () => {
    test.describe.configure({ mode: 'serial' });
    let userAChildId: string;

    test.beforeAll(async ({ browser }) => {
        // Setup: Create User A and a child profile
        const page = await browser.newPage();

        // Register User A
        await page.goto('/register');
        await page.fill('#email', USER_A_EMAIL);
        await page.fill('#password', TEST_PASSWORD);
        await page.fill('#confirmPassword', TEST_PASSWORD);
        await page.click('button:has-text("Sign Up")');

        // Check for error on page
        const error = page.locator('.text-destructive');
        if (await error.isVisible()) {
            console.error('Registration failed for User A:', await error.innerText());
        }

        // Wait for redirect to login after successful signup
        await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

        // Login User A
        await page.fill('#email', USER_A_EMAIL);
        await page.fill('#password', TEST_PASSWORD);
        await page.click('button:has-text("Sign In")');
        await expect(page).toHaveURL('/', { timeout: 10000 });

        // Add a child for User A
        await page.goto('/children/new');
        const childName = 'Secret Child A';
        await page.fill('#name', childName);
        await page.fill('#dob', '2020-01-01');
        await page.click('button:has-text("Add Child")');
        await expect(page).toHaveURL('/children', { timeout: 10000 });

        // Get the Child ID from the list
        const childCard = page.locator('div.grid > div').filter({ hasText: childName });
        await childCard.getByRole('button', { name: 'View Details' }).click();

        // Wait for navigation and extract ID
        await expect(page).toHaveURL(/\/children\/[0-9a-f-]+/, { timeout: 10000 });
        const url = page.url();
        userAChildId = url.split('/').pop() || '';
        console.log(`Created User A child with ID: ${userAChildId}`);

        await page.close();
    });

    test('should redirect unauthenticated users to login for all protected routes', async ({ page }) => {
        const protectedRoutes = ['/children', '/children/new', '/doctors'];

        for (const route of protectedRoutes) {
            console.log(`Testing redirect for ${route}`);
            await page.goto(route);
            // Wait for client-side redirect
            await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
        }
    });

    test('should prevent User B from seeing User A\'s child data', async ({ page }) => {
        // Register and Login User B
        await page.goto('/register');
        await page.fill('#email', USER_B_EMAIL);
        await page.fill('#password', TEST_PASSWORD);
        await page.fill('#confirmPassword', TEST_PASSWORD);
        await page.click('button:has-text("Sign Up")');
        // Wait for redirect to login after successful signup
        await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

        await page.goto('/login');
        await page.fill('#email', USER_B_EMAIL);
        await page.fill('#password', TEST_PASSWORD);
        await page.click('button:has-text("Sign In")');
        await expect(page).toHaveURL('/');

        // 1. Verify User B doesn't see User A's child in the list
        await page.goto('/children');
        await expect(page.locator('text=Secret Child A')).not.toBeVisible();
        await expect(page.locator('text=No children added yet')).toBeVisible();

        // 2. Verify User B cannot access User A's child profile via direct link (RLS Check)
        await page.goto(`/children/${userAChildId}`);

        // The UI should show "Child not found" because Supabase returns no data (RLS)
        await expect(page.locator('text=Child not found')).toBeVisible();
        await expect(page.locator('text=Secret Child A')).not.toBeVisible();
    });
});
