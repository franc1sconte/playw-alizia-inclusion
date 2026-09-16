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
  readonly historyToggleButton: Locator;
  readonly closeHistoryButton: Locator;
  readonly historyLastWeekHeading: Locator;
  readonly resourcePanelText: Locator;
  readonly closeResourcePanelButton: Locator;
  readonly renameMenuItem: Locator;
  readonly deleteMenuItem: Locator;

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
    // El botón del header nunca cambia su nombre accesible (siempre "Historial"): es un
    // toggle único, distinto del botón "Cerrar historial" (X) propio del panel.
    this.historyToggleButton = page.getByRole('banner').getByRole('button', { name: 'Historial', exact: true });
    this.closeHistoryButton = page.getByRole('button', { name: 'Cerrar historial' });
    this.historyLastWeekHeading = page.getByRole('heading', { name: 'Últimos 7 días' });
    // "Recurso pedagógico" es texto plano (no heading ARIA): se confirmó en la app real.
    this.resourcePanelText = page.getByText('Recurso pedagógico', { exact: true });
    this.closeResourcePanelButton = page.getByRole('button', { name: 'Cerrar', exact: true });
    this.renameMenuItem = page.getByRole('button', { name: 'Renombrar' });
    this.deleteMenuItem = page.getByRole('button', { name: 'Eliminar' });
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

  historyListItem(index: number): Locator {
    return this.page
      .getByRole('complementary')
      .getByRole('list')
      .first()
      .getByRole('listitem')
      .nth(index);
  }

  historyItemTitleButton(index: number): Locator {
    return this.historyListItem(index).getByRole('button').first();
  }

  historyItemMoreOptionsButton(index: number): Locator {
    return this.historyListItem(index).getByRole('button', { name: 'Más opciones' });
  }

  // El botón que dispara la generación del recurso agrupa título + categoría en dos
  // <p>, sin más marcado semántico: se lo distingue de los botones de acciones
  // (Me gusta, Copiar, etc., que no tienen párrafos hijos) filtrando por ese contenido.
  resourceCard(): Locator {
    return this.page
      .getByRole('main')
      .getByRole('button')
      .filter({ has: this.page.getByRole('paragraph') })
      .last();
  }

}
