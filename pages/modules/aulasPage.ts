import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { NavigationPage } from '../components/NavigationPage';

export class AulasPage extends BasePage {
  readonly nav: NavigationPage;
  readonly backButton: Locator;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly newClassroomButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationPage(page);
    this.backButton = page.getByRole('button', { name: 'Volver' });
    this.heading = page.getByRole('heading', { name: 'Aulas', level: 1 });
    this.subtitle = page.getByText('Gestión de aulas de la institución');
    this.newClassroomButton = page.getByRole('button', { name: 'Nueva aula' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/admin/aulas');
  }

  classroomHeading(name: string): Locator {
    return this.page.getByRole('heading', { name, level: 3 });
  }

  editClassroomButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Editar aula ${name}` });
  }

  deleteClassroomButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Eliminar aula ${name}` });
  }
}
