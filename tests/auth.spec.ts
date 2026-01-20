import { test, expect } from '@playwright/test';
import { SupabaseMock } from './mocks/supabase';

const TEST_EMAIL = 'test-user@example.com';
const TEST_PASSWORD = 'Password123!';

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        const supabaseMock = new SupabaseMock();
        await supabaseMock.setup(page);
    });
    test('should allow a user to navigate to register page from login', async ({ page }) => {
        await page.goto('/login');
        await page.click('text=Sign up');
        await expect(page).toHaveURL('/register');
        await expect(page.locator('[data-slot="card-title"]')).toContainText('Create Your Account');
    });

    test('should allow a user to register', async ({ page }) => {
        // Use a unique email to ensure registration flow works
        const email = `test-${Date.now()}@example.com`;
        await page.goto('/register');
        await page.fill('#email', email);
        await page.fill('#password', TEST_PASSWORD);
        await page.fill('#confirmPassword', TEST_PASSWORD);
        await page.click('button:has-text("Sign Up")');

        await expect(page.locator('text=Success!')).toBeVisible();
        await expect(page).toHaveURL('/login', { timeout: 10000 });
    });

    test('should show error on login failure', async ({ page }) => {
        await page.goto('/login');
        await page.fill('#email', 'wrong@example.com');
        await page.fill('#password', 'wrongpassword');
        await page.click('button:has-text("Sign In")');

        await expect(page.locator('.text-destructive')).toBeVisible();
    });

    test('should allow a user to sign in and sign out', async ({ page }) => {
        await page.goto('/login');
        await page.fill('#email', TEST_EMAIL);
        await page.fill('#password', TEST_PASSWORD);
        await page.click('button:has-text("Sign In")');

        // Check for redirect or error
        try {
            await expect(page).toHaveURL('/', { timeout: 5000 });
            console.log('Login successful for', TEST_EMAIL);
        } catch {
            console.log('Login failed for', TEST_EMAIL, '- attempting registration');
            await page.goto('/register');
            await page.fill('#email', TEST_EMAIL);
            await page.fill('#password', TEST_PASSWORD);
            await page.fill('#confirmPassword', TEST_PASSWORD);
            await page.click('button:has-text("Sign Up")');

            const error = page.locator('.text-destructive');
            if (await error.isVisible()) {
                console.log('Registration error:', await error.innerText());
            } else {
                await expect(page.locator('text=Success!')).toBeVisible();
                console.log('Registration successful for', TEST_EMAIL);
            }

            await page.goto('/login');
            await page.fill('#email', TEST_EMAIL);
            await page.fill('#password', TEST_PASSWORD);
            await page.click('button:has-text("Sign In")');
            await expect(page).toHaveURL('/', { timeout: 10000 });
        }

        await expect(page.locator('text=Logged in as:')).toBeVisible();

        await page.click('button:has-text("Sign Out")');
        await expect(page).toHaveURL('/login');
    });

});


