Actúa como el Generator de la habilidad de generación de pruebas de playwright-cli.

Usa solo los escenarios 1.4 1.5 1.6 1.7 1.8 de specs/alizia-inclusion-login.md

Convenciones del framework (ESTRICTAS):

* Importa test y expect desde playw-alizia-inclusion/fixtures/base.ts,
  NO directamente desde @playwright/test
* Los objetos de página se encuentran en playw-alizia-inclusion/pages/ y extienden BasePage
* Carga las credenciales desde tests/data/users.json
* Prioridad de localizadores: getByRole → getByLabel → getByTestId.
  SIN CSS, SIN XPath, SIN waitForTimeout.
* Etiqueta la prueba con @smoke o @critical segun tu criterio

Flujo de trabajo:

1. Usa playwright-cli para verificar los localizadores en la aplicación en vivo
2. Pregunta antes de crear cualquier nuevo archivo de objeto de página
3. Crea pages según sea necesario. Usa de referencia para el naming el endpint de url. Por ej /asistente -> page asistentePage.ts
4. Guardalo en tests/login/alizia-inclusion-login.ts
5. Ejecuta la prueba con: npx playwright test tests/login/alizia-inclusion-login.ts
6. Corrige y vuelve a ejecutar hasta que pase
7. Informa los archivos finales y la salida de ejecución exitosa
8. Si un flujo falla, ten en cuenta que puede que sea un error. No hagas "workarounds" para dejarlo estable, si es que debe fallar organicamente.
