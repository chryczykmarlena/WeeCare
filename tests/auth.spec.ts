import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should allow a user to navigate to register page from login', async ({ page }) => {
        await page.goto('/login');
        await page.click('text=Sign up');
        await expect(page).toHaveURL('/register');
        await expect(page.locator('[data-slot="card-title"]')).toContainText('Create Your Account');
    });

    test('should show error on login failure', async ({ page }) => {
        await page.goto('/login');
        await page.fill('#email', 'wrong@example.com');
        await page.fill('#password', 'wrongpassword');
        await page.click('button:has-text("Sign In")');

        // Wait for error message (Supabase error)
        await expect(page.locator('.text-destructive')).toBeVisible();
    });
});
