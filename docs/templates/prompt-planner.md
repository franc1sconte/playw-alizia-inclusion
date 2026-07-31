Actúa como el Planificador de la habilidad de generación de pruebas de playwright-cli.

Explora [url-var] usando playwright-cli.

Cubre el flujo de [var] con estos escenarios:

* standard_user (inicio de sesión exitoso → página de inventario)
* locked_out_user (debe mostrar un error)
* Envío con el nombre de usuario vacío
* Envío con la contraseña vacía
* Credenciales inválidas (usuario: foo, contraseña: bar)


Reglas:

* Exploración de solo lectura — NO envíes formularios con datos reales
  más allá de lo necesario para observar el flujo
* NO escribas ningún código de prueba
* Guarda el plan como un archivo Markdown numerado en specs/[var].md
* Usa numeración de escenarios de dos partes (1.1, 1.2, ...)
* Cada escenario debe tener: precondiciones, pasos, aserciones esperadas

Enfoque:

1. Usa playwright-cli open con --headed para que pueda ver el navegador
2. Toma snapshots para identificar los elementos
3. Recorre cada escenario, anotando lo que sucede
4. Consolida todo en el archivo del plan
