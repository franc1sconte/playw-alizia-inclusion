import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { NavigationPage } from '../components/NavigationPage';

export class AsistentePage extends BasePage {
  readonly nav: NavigationPage;
  readonly greeting: Locator;
  readonly helpPrompt: Locator;
  readonly messageInput: Locator;
  readonly dictateButton: Locator;
  readonly sendButton: Locator;
  readonly historyHeading: Locator;
  readonly historySearchInput: Locator;
  readonly toolsAccessSection: Locator;
  readonly welcomeModal: Locator;
  readonly welcomeModalHeading: Locator;
  readonly welcomeModalContinueButton: Locator;
  readonly conversationHeading: Locator;
  readonly backButton: Locator;
  readonly viewPreviousConversationsButton: Locator;
  readonly likeButton: Locator;
  readonly dislikeButton: Locator;
  readonly copyButton: Locator;
  readonly favoriteButton: Locator;
  readonly questionPaginationLabel: Locator;
  readonly previousQuestionButton: Locator;
  readonly nextQuestionButton: Locator;
  readonly discardQuestionsButton: Locator;
  readonly skipQuestionButton: Locator;
  readonly answerSubmitButton: Locator;
  readonly freeformAssistantInput: Locator;
  readonly voiceRecordButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationPage(page);
    this.greeting = page.getByText(/^Hola .+,$/);
    this.helpPrompt = page.getByText('¿Cómo puedo ayudarte?');
    this.messageInput = page.getByRole('textbox', { name: 'Mensaje para el asistente' });
    this.dictateButton = page.getByRole('button', { name: 'Dictar mensaje' });
    this.sendButton = page.getByRole('button', { name: 'Enviar mensaje' });
    this.historyHeading = page.getByRole('heading', { name: 'Historial' });
    this.historySearchInput = page.getByRole('textbox', { name: 'Buscar conversación' });
    this.toolsAccessSection = page.getByText('Accesos a tus herramientas').filter({ visible: true });
    this.welcomeModal = page.getByRole('dialog');
    this.welcomeModalHeading = this.welcomeModal.getByRole('heading', { name: 'Alizia inclusión' });
    this.welcomeModalContinueButton = this.welcomeModal.getByRole('button', { name: 'Continuar' });
    this.conversationHeading = page.getByRole('heading', { name: 'Alizia asistente', level: 1 });
    this.backButton = page.getByRole('button', { name: 'Volver' });
    this.viewPreviousConversationsButton = page.getByRole('button', { name: 'Ver conversaciones anteriores' });
    this.likeButton = page.getByRole('button', { name: 'Me gusta', exact: true });
    this.dislikeButton = page.getByRole('button', { name: 'No me gusta' });
    this.copyButton = page.getByRole('button', { name: 'Copiar' });
    this.favoriteButton = page.getByRole('button', { name: 'Favorito' });
    this.questionPaginationLabel = page.getByText(/^\d+ de \d+$/);
    this.previousQuestionButton = page.getByRole('button', { name: 'Pregunta anterior' });
    this.nextQuestionButton = page.getByRole('button', { name: 'Pregunta siguiente' });
    this.discardQuestionsButton = page.getByRole('button', { name: 'Descartar preguntas' });
    this.skipQuestionButton = page.getByRole('button', { name: 'Omitir pregunta' });
    this.answerSubmitButton = page.getByRole('button', { name: 'Siguiente', exact: true });
    this.freeformAssistantInput = page.getByRole('textbox', { name: 'Preguntale al asistente...' });
    this.voiceRecordButton = page.getByRole('button', { name: 'Iniciar grabación de voz' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/asistente');
  }

  quickAccessButton(name: string): Locator {
    // El panel "Historial" está anidado dentro de <main> y puede tener un ítem con el
    // mismo texto que un chip; el contenido de la landing siempre precede a ese panel
    // en el árbol, por lo que .first() apunta de forma determinística al chip real.
    return this.page.getByRole('main').getByRole('button', { name, exact: true }).first();
  }

  toolsAccessCard(fullName: string): Locator {
    return this.page.getByRole('link', { name: fullName, exact: true });
  }

  chatText(text: string): Locator {
    return this.page.getByRole('main').getByText(text, { exact: true });
  }

  historyItem(name: string): Locator {
    return this.page.getByRole('complementary').getByRole('button', { name, exact: true });
  }
}
