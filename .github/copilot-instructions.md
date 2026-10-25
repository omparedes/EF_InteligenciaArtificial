# Instrucciones del proyecto TurnoFácil

## Contexto
Proyecto académico del curso Inteligencia Artificial
de la Universidad Peruana de Ciencias Aplicadas (UPC).

## Objetivo
Desarrollar una aplicación web para gestionar turnos
de atención en pequeños negocios.

## Tecnologías
- HTML5
- CSS3
- JavaScript
- localStorage

## Arquitectura
- Aplicación de una sola página.
- Sin frameworks.
- Sin backend.
- Sin base de datos externa.
- Compatible con GitHub Pages.
- Archivos HTML, CSS y JavaScript separados.

## Funcionalidades
1. Registrar turnos con nombre del cliente.
2. Mostrar turnos pendientes por orden de llegada.
3. Iniciar la atención del siguiente turno.
4. Completar o cancelar turnos.
5. Buscar y filtrar turnos.
6. Guardar y recuperar información con localStorage.

## Estados
- Pendiente
- En atención
- Completado
- Cancelado

## Reglas de negocio
- Los turnos tienen números correlativos.
- Los números no se reinician al recargar.
- No se permiten nombres vacíos.
- Se atiende primero al turno pendiente más antiguo.
- Solo puede existir un turno En atención.
- Solo se puede completar un turno En atención.
- Se pueden cancelar turnos Pendientes.
- Los turnos completados y cancelados son estados finales.
- El historial conserva los registros.
- Los datos se almacenan en el navegador.

## Calidad
- Código organizado y comprensible.
- Funciones con responsabilidades específicas.
- Validaciones de entrada.
- Manejo adecuado de errores.
- Diseño responsive.
- Interfaz completamente en español.
- No agregar funcionalidades fuera del alcance acordado.

## GitHub Copilot
- Explicar los cambios importantes.
- No eliminar funcionalidades existentes sin justificación.
- Permitir que el estudiante revise los cambios.
- Proponer pruebas para las funcionalidades.
- Documentar las decisiones técnicas.