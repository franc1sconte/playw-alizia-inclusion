Actúa como el Generator de la habilidad de generación de pruebas de playwright-cli.

Usa los escenarios de specs/fast-chips-assist.md

Convenciones del framework (ESTRICTAS):

* Importa test y expect desde src/fixtures/base.ts,
  NO directamente desde @playwright/test
* Los objetos de página se encuentran en src/pages/ y extienden BasePage
* Carga las credenciales desde tests/data/users.json
* Prioridad de localizadores: getByRole → getByLabel → getByTestId.
  SIN CSS, SIN XPath, SIN waitForTimeout.
* Etiqueta la prueba con @smoke o @critical segun tu criterio

Flujo de trabajo:

1. Usa playwright-cli para verificar los localizadores en la aplicación en vivo
2. Pregunta antes de crear cualquier nuevo archivo de objeto de página
4. Guardalo en tests/assist/chat-assist.spec.ts
5. Ejecuta la prueba con: npx playwright test tests/assist/chat-assist.spec.ts
6. Corrige y vuelve a ejecutar hasta que pase
7. Informa los archivos finales y la salida de ejecución exitosa
8. Si un flujo falla, ten en cuenta que puede que sea un error. No hagas "workarounds" para dejarlo estable, si es que debe fallar organicamente.
