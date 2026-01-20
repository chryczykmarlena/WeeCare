import type { Page } from '@playwright/test';
import { URL } from 'url';

export class SupabaseMock {
    private users: Record<string, unknown>[] = [];
    private children: Record<string, unknown>[] = [];

    async setup(page: Page) {
        // Auth - Signup
        await page.route('**/auth/v1/signup', async (route) => {
            const postData = route.request().postDataJSON();
            const user = { id: `user-${Date.now()}-${Math.random()}`, email: postData.email };
            this.users.push(user);

            await route.fulfill({
                json: {
                    user,
                    session: {
                        access_token: `fake-jwt-${user.id}`,
                        refresh_token: 'fake-refresh',
                        user
                    }
                }
            });
        });

        // Auth - Login
        await page.route('**/auth/v1/token?grant_type=password', async (route) => {
            const postData = route.request().postDataJSON();
            if (postData.email === 'wrong@example.com') {
                await route.fulfill({
                    status: 400,
                    json: { error: 'invalid_grant', error_description: 'Invalid login credentials' }
                });
                return;
            }

            // Find or create user for this email
            let user = this.users.find(u => u.email === postData.email);
            if (!user) {
                user = { id: 'test-user-id', email: postData.email };
                this.users.push(user);
            }

            await route.fulfill({
                json: {
                    access_token: `fake-jwt-${user.id}`,
                    token_type: 'bearer',
                    expires_in: 3600,
                    refresh_token: 'fake-refresh',
                    user
                }
            });
        });

        // Auth - Logout
        await page.route('**/auth/v1/logout', async (route) => {
            await route.fulfill({ status: 204 });
        });

        // Auth - Get User
        await page.route('**/auth/v1/user', async (route) => {
            const headers = route.request().headers();
            const auth = headers['authorization'];
            if (!auth) return route.fulfill({ status: 401 });

            const token = auth.replace('Bearer ', '');
            let userId = 'test-user-id';
            if (token.startsWith('fake-jwt-')) {
                userId = token.replace('fake-jwt-', '');
            }

            const user = this.users.find(u => u.id === userId) || { id: userId, email: 'test@example.com' };
            await route.fulfill({ json: user });
        });

        // DB - Fallback for other tables
        await page.route('**/rest/v1/*', async (route) => {
            if (route.request().url().includes('/children')) {
                return route.fallback();
            }
            await route.fulfill({ json: [] });
        });

        // DB - Children
        await page.route('**/rest/v1/children*', async (route) => {
            const method = route.request().method();
            const url = new URL(route.request().url());
            const headers = route.request().headers();

            // Extract user ID from token for RLS
            const auth = headers['authorization'];
            const token = auth ? auth.replace('Bearer ', '') : '';
            let userId = 'test-user-id';
            if (token.startsWith('fake-jwt-')) {
                userId = token.replace('fake-jwt-', '');
            }

            if (method === 'GET') {
                // Filter items by user_id (RLS)
                let items = this.children.filter(c => c.user_id === userId);

                // Handle id filtering
                const idParam = url.searchParams.get('id');
                if (idParam) {
                    const idMatch = idParam.match(/eq\.(.+)/);
                    if (idMatch) {
                        items = items.filter(c => c.id === idMatch[1]);
                    }
                }

                // Check for single request
                const accept = headers['accept'];
                if (accept && accept.includes('application/vnd.pgrst.object+json')) {
                    if (items.length === 0) {
                        await route.fulfill({
                            status: 406,
                            json: { details: 'The result contains 0 rows', message: 'JSON object requested, multiple (or no) rows returned' }
                        });
                        return;
                    }
                    // Return first item
                    await route.fulfill({ json: items[0] });
                    return;
                }

                await route.fulfill({ json: items });
            } else if (method === 'POST') {
                const postData = route.request().postDataJSON();
                let items = Array.isArray(postData) ? postData : [postData];
                const responses = items.map((item: Record<string, unknown>) => {
                    const newChild = { ...item, id: `child-${Date.now()}-${Math.random()}` };
                    this.children.push(newChild);
                    return newChild;
                });
                await route.fulfill({ status: 201, json: responses });
            } else if (method === 'DELETE') {
                const idParam = url.searchParams.get('id');
                if (idParam) {
                    const idMatch = idParam.match(/eq\.(.+)/);
                    if (idMatch) {
                        // In real RLS, we'd check ownership here too
                        this.children = this.children.filter(c => c.id !== idMatch[1]);
                    }
                }
                await route.fulfill({ status: 204 });
            } else {
                await route.continue();
            }
        });
    }
}
