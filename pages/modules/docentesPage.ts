import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { NavigationPage } from '../components/NavigationPage';

export class DocentesPage extends BasePage {
  readonly nav: NavigationPage;
  readonly backButton: Locator;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly newTeacherButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationPage(page);
    this.backButton = page.getByRole('button', { name: 'Volver' });
    this.heading = page.getByRole('heading', { name: 'Docentes', level: 1 });
    this.subtitle = page.getByText(/^\d+ docentes en la institución$/);
    this.newTeacherButton = page.getByRole('button', { name: 'Nuevo docente' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/admin/docentes');
  }

  teacherHeading(name: string): Locator {
    return this.page.getByRole('heading', { name, level: 3 });
  }

  unenrollTeacherButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Dar de baja a ${name}` });
  }
}
