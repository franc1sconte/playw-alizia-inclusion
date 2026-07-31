import { Page, Locator } from '@playwright/test';

export class NavigationPage {
  readonly page: Page;
  readonly nav: Locator;
  readonly links: Locator;
  readonly userMenuButton: Locator;
  readonly userMenu: Locator;
  readonly logoutMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.getByRole('navigation');
    this.links = this.nav.getByRole('link');
    this.userMenuButton = page.getByRole('button', { name: 'Menú de usuario' });
    this.userMenu = page.getByRole('menu', { name: 'Menú de usuario' });
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Cerrar sesión' });
  }

  userMenuText(text: string): Locator {
    return this.userMenu.getByText(text);
  }

  link(name: string): Locator {
    return this.nav.getByRole('link', { name });
  }

  async clickLink(name: string): Promise<void> {
    await this.link(name).click();
  }

  async getLinkNames(): Promise<string[]> {
    return this.links.allTextContents();
  }

  async openUserMenu(): Promise<void> {
    await this.userMenuButton.click();
  }

  async logout(): Promise<void> {
    await this.logoutMenuItem.click();
  }
}
