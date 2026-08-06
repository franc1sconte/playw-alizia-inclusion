import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { NavigationPage } from '../components/NavigationPage';

export class DocentesPage extends BasePage {
  readonly nav: NavigationPage;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly newTeacherButton: Locator;
  readonly unenrollTeacherButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationPage(page);
    this.heading = page.getByRole('heading', { name: 'Docentes', level: 1 });
    this.subtitle = page.getByText(/^\d+ docentes en la institución$/);
    this.newTeacherButton = page.getByRole('button', { name: 'Crear nuevo docente' });
    this.unenrollTeacherButton = page.getByRole('menuitem', { name: 'Dar de baja' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/admin/docentes');
  }

  teacherHeading(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  async openTeacherOptions(name: string): Promise<void> {
    await this.page.getByRole('button', { name: `Más opciones para ${name}` }).click();
  }
}
