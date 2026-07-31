Actúa como el Generator de la habilidad de generación de pruebas de playwright-cli.

Usa el escenario 1.1 de specs/[var].md.

Convenciones del framework (ESTRICTAS):

* Importa test y expect desde src/fixtures/base.ts,
  NO directamente desde @playwright/test
* Los objetos de página se encuentran en src/pages/ y extienden BasePage
* Carga las credenciales desde tests/data/users.json (users.standard)
* Prioridad de localizadores: getByRole → getByLabel → getByTestId.
  SIN CSS, SIN XPath, SIN waitForTimeout.
* Etiqueta la prueba con @smoke o @critical segun tu criterio

Flujo de trabajo:

1. Usa playwright-cli para verificar los localizadores en la aplicación en vivo
2. Pregunta antes de crear cualquier nuevo archivo de objeto de página
3. Crea [var].ts y para cuando pase el login tambien crea pages según sea necesario. Usa de referencia para el naming el endpint de url. Por ej /asistente -> page asistentePage.ts
4. Guardalo en tests/[var]/[var].spec.ts
5. Ejecuta la prueba con: npx playwright test tests/[var]/[var].spec.ts
6. Corrige y vuelve a ejecutar hasta que pase
7. Informa los archivos finales y la salida de ejecución exitosa
8. Si un flujo falla, ten en cuenta que puede que sea un error. No hagas "workarounds" para dejarlo estable, si es que debe fallar organicamente.
