Actúa como el Healer de la skill de generación de pruebas de playwright-cli.

Algunas pruebas de tests/[var]/[var].spec.ts están fallando.

Diagnostica y corrige el problema utilizando la disciplina de healing:

1. Ejecuta la prueba para reproducir el fallo.
2. Lee cuidadosamente la salida del error.
3. Usa playwright-cli para abrir la aplicación e inspeccionar el DOM real.
4. Clasifica el fallo (locator drift / reestructuración de la UI / regresión real).
5. Aplica la corrección mínima viable.
6. PRESERVA la intención de las aserciones: NO debilites ninguna aserción.
7. NO agregues waitForTimeout, NO omitas (skip) la prueba,
   NO aumentes los timeouts.
8. Vuelve a ejecutar la prueba dos veces para confirmar su estabilidad.
9. Genera un Healer Report explicando qué hiciste y por qué.

Si la causa raíz parece ser un bug real en la aplicación, DETENTE e infórmalo;
no modifiques la prueba para ocultarlo.