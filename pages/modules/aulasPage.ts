import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { NavigationPage } from '../components/NavigationPage';

export class AulasPage extends BasePage {
  readonly nav: NavigationPage;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly newClassroomButton: Locator;
  readonly editClassroomButton: Locator;
  readonly deleteClassroomButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationPage(page);
    this.heading = page.getByRole('heading', { name: 'Aulas', level: 1 });
    this.subtitle = page.getByText('Gestión de aulas de la institución');
    this.newClassroomButton = page.getByRole('button', { name: 'Crear nueva aula' });
    this.editClassroomButton = page.getByRole('menuitem', { name: 'Editar' });
    this.deleteClassroomButton = page.getByRole('menuitem', { name: 'Eliminar' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/admin/aulas');
  }

  classroomHeading(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  async openClassroomOptions(name: string): Promise<void> {
    await this.page.getByRole('button', { name: `Más opciones para ${name}` }).click();
  }
}
