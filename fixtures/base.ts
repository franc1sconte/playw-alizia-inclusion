import { test as base, expect, APIRequestContext } from '@playwright/test';
import users from '../data/users.json';

export const API_BASE = 'https://alizia-inclusion-production.up.railway.app/api/v1/';

export const test = base.extend<{ apiRequest: APIRequestContext }>({
  apiRequest: async ({ playwright }, use) => {
    const anonymous = await playwright.request.newContext({ baseURL: API_BASE });
    const loginResponse = await anonymous.post('auth/login', {
      data: { email: users.teacher2.username, password: users.teacher2.password },
    });
    const { description } = await loginResponse.json();
    await anonymous.dispose();

    const authenticated = await playwright.request.newContext({
      baseURL: API_BASE,
      extraHTTPHeaders: {
        Authorization: `Bearer ${description.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    await use(authenticated);
    await authenticated.dispose();
  },
});
export { expect };
