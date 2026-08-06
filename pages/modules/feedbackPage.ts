import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { NavigationPage } from '../components/NavigationPage';

export class FeedbackPage extends BasePage {
  readonly nav: NavigationPage;
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly ratingFilterGroup: Locator;
  readonly recordsCount: Locator;
  readonly viewFullResponseButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationPage(page);
    this.heading = page.getByRole('heading', { name: 'Feedback', level: 1 });
    this.subtitle = page.getByText('Pulgar arriba/abajo de las docentes sobre las respuestas de Alizia, con la pregunta que las originó');
    this.ratingFilterGroup = page.getByRole('group', { name: 'Filtrar por rating' });
    this.recordsCount = page.getByText(/^\d+ registros( · \d+ con comentario)?$/);
    this.viewFullResponseButtons = page.getByRole('button', { name: 'Ver respuesta completa' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/admin/feedback');
  }

  ratingFilterButton(name: string): Locator {
    return this.ratingFilterGroup.getByRole('button', { name, exact: true });
  }
}
