# TurnoFácil

Aplicación web de una sola página para organizar los turnos de atención de
pequeños negocios. Es un proyecto académico del curso de Inteligencia Artificial
de la Universidad Peruana de Ciencias Aplicadas (UPC).

## Contexto y problemática

En negocios que atienden por orden de llegada, llevar los turnos manualmente
puede dificultar conocer quién sigue, identificar el estado de cada atención y
conservar un historial. TurnoFácil propone una interfaz sencilla para registrar
y consultar los turnos desde el navegador.

## Usuario objetivo

Personal de pequeños negocios que necesita organizar la atención presencial de
sus clientes mediante turnos correlativos.

## Objetivo general

Desarrollar una aplicación web simple, en español y sin backend, que permita
gestionar el ciclo de vida de los turnos y conservar sus datos en el navegador.

## Solución propuesta

TurnoFácil presenta un panel único para registrar clientes, consultar la cola
pendiente, iniciar la atención, actualizar los estados, buscar en el historial y
ver indicadores. La aplicación usa `localStorage` del navegador; no sincroniza
información con un servidor.

## Funcionalidades implementadas

1. **Registro:** admite el nombre del cliente, recorta espacios sobrantes,
   rechaza nombres vacíos, asigna el número siguiente, registra fecha y hora,
   inicia el turno como pendiente y limpia el formulario después del registro.
   Incluye protección contra envíos repetidos rápidos en la misma página.
2. **Cola pendiente:** muestra número y nombre por orden de llegada, actualiza
   la lista después de los cambios y presenta un estado vacío cuando no hay
   turnos pendientes.
3. **Inicio de atención:** permite iniciar el turno pendiente más antiguo y lo
   muestra en el panel actual. Impide iniciar otro mientras uno esté en
   atención e informa cuando no hay turnos pendientes.
4. **Completar y cancelar:** permite completar el turno en atención y cancelar
   turnos pendientes. Los turnos completados y cancelados permanecen en el
   historial como estados finales.
5. **Búsqueda y filtros:** busca por nombre o número y combina la búsqueda con
   filtros por estado: Pendiente, En atención, Completado y Cancelado. “Todos
   los estados” muestra el historial sin restringirlo. Presionar Enter en el
   formulario de filtros no provoca su envío nativo ni una recarga.
6. **Persistencia e indicadores:** recupera turnos desde `localStorage` al
   cargar la aplicación y guarda los cambios, incluidos los estados y el
   siguiente número. Actualiza los contadores de pendientes, en atención,
   completados y cancelados.

## Reglas de negocio

- Los turnos reciben números correlativos que se conservan al recargar.
- No se registran nombres vacíos después de quitar espacios sobrantes.
- Se inicia primero el turno pendiente más antiguo.
- Solo puede haber un turno en atención a la vez.
- Solo se completa un turno que está en atención.
- Solo se cancelan turnos pendientes.
- Completado y Cancelado son estados finales.
- El historial conserva los registros de turnos.
- Los datos se guardan localmente en el navegador y no se reinician al cambiar
  de día.

## Tecnologías

- HTML5 semántico
- CSS3 responsive
- JavaScript puro
- `localStorage`

No se utilizan frameworks, dependencias externas, CDN, backend ni bases de
datos externas.

## Arquitectura y estructura

Aplicación de una sola página con responsabilidades separadas: el HTML define
la estructura y los controles, CSS presenta la interfaz responsive y JavaScript
gestiona el estado, las interacciones, el renderizado y la persistencia.

```text
.
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── evidencias/
│   └── 01-analisis-copilot.png
├── .github/
│   └── copilot-instructions.md
└── README.md
```

Las hojas de estilo y el script se cargan mediante rutas relativas desde
`index.html`, compatibles con la publicación en GitHub Pages bajo una ruta de
proyecto.

## Ejecución local

No es necesario instalar dependencias. Desde la raíz del proyecto se puede
iniciar un servidor estático con Python, si está disponible:

```bash
python -m http.server 8000
```

Luego, abrir `http://localhost:8000` en el navegador. La persistencia se asocia
al origen del sitio: los datos locales no se comparten entre `localhost`, el
dominio de GitHub Pages ni otros navegadores.

## Uso

1. Escribir el nombre del cliente y seleccionar **Registrar turno**.
2. Consultar la cola y seleccionar **Iniciar siguiente turno** cuando
   corresponda.
3. En el panel de atención actual, seleccionar **Completar turno** al terminar.
4. Para retirar un turno que aún está pendiente, seleccionar **Cancelar** en
   su fila.
5. Usar el campo de búsqueda y el selector de estado para consultar el
   historial. Los filtros se aplican mientras se escribe o se cambia el estado;
   Enter no recarga la página.

## Criterios de aceptación

- Un nombre solo con espacios no genera un registro y el nombre registrado no
  conserva espacios al inicio o al final.
- Cada registro tiene número correlativo, fecha y hora, y estado inicial
  Pendiente.
- Los pendientes aparecen por orden y solo se inicia el más antiguo.
- No se inicia otro turno mientras exista uno En atención.
- Completar y cancelar solo afectan los estados permitidos; el historial
  conserva los turnos finalizados.
- Los filtros admiten los cuatro estados y “Todos”; búsqueda y filtro pueden
  combinarse y se informa cuando no hay coincidencias.
- Después de recargar, los datos y el siguiente número se recuperan desde el
  almacenamiento del mismo navegador y origen.
- Los cuatro indicadores reflejan la cantidad de turnos de cada estado.

## Verificaciones realizadas

Las verificaciones descritas aquí son las que quedaron documentadas durante el
desarrollo. Las pruebas simuladas usaron un DOM y almacenamiento en memoria; no
constituyen una prueba manual en un navegador real.

- **Sintaxis:** se ejecutó `node --check js/app.js`.
- **Estructura:** se comprobaron las opciones y etiquetas de los filtros, los
  identificadores HTML únicos y las rutas relativas de CSS y JavaScript.
- **Escenarios simulados:** se probaron los cuatro filtros de estado y “Todos”,
  búsqueda por nombre y número, combinación de búsqueda y estado, estado sin
  coincidencias, prevención del envío del formulario de filtros y conservación
  de la consulta al enviar.
- **Flujos simulados:** se probaron registro con datos previos y número
  correlativo, protección ante envío repetido, iniciar y completar turnos,
  cancelar pendientes, conservación de los registros cargados y actualización
  de indicadores.
- **Prueba manual pendiente:** no quedó documentada una sesión de verificación
  visual o funcional en un navegador real. Conviene comprobar allí Enter con
  teclado físico y móvil, accesibilidad, despliegue en GitHub Pages y
  persistencia en el origen publicado.

## Uso de GitHub Copilot y decisiones

GitHub Copilot se utilizó como asistente durante el análisis de requisitos, la
generación de la estructura HTML/CSS/JavaScript, la revisión técnica, la
corrección de hallazgos aprobados y la elaboración de esta documentación. El
código y las decisiones se revisaron con las instrucciones del proyecto; el
uso de Copilot no sustituye la validación del equipo.

En la auditoría se reportaron cinco hallazgos. Se aprobaron y corrigieron estos
dos:

- Se alinearon los valores del selector HTML con los estados internos de
  JavaScript, manteniendo las etiquetas visibles en español.
- Se interceptó el envío del formulario de filtros para evitar la recarga al
  presionar Enter y conservar la búsqueda dinámica.

Los otros tres hallazgos se dejaron como riesgos conocidos, sin aplicar sus
correcciones: posible colisión o sobrescritura al operar simultáneamente en
varias pestañas; comportamiento de reemplazo por una lista limpia después de
cargar datos corruptos; y cambios que permanecen solo en memoria cuando falla
la escritura en `localStorage`. No se realizó sincronización entre pestañas ni
un mecanismo de recuperación de datos corruptos como parte de esta entrega.

## Limitaciones conocidas

- `localStorage` es propio del navegador y origen; no sincroniza entre
  dispositivos ni entre navegadores.
- El estado se carga al iniciar la página. La aplicación no coordina
  operaciones simultáneas en varias pestañas; en ese escenario podrían
  producirse números duplicados o sobrescrituras.
- Si el contenido persistido es inválido, no se carga y la aplicación muestra
  un aviso. Una escritura posterior puede reemplazar ese contenido por el
  estado nuevo en memoria; no existe una herramienta de recuperación del dato
  corrupto.
- Si leer o escribir `localStorage` falla, la aplicación informa el problema.
  Los cambios que solo se mantienen en memoria pueden perderse al recargar.

## Evidencias

Captura disponible en el repositorio:

- [Análisis realizado con Copilot](evidencias/01-analisis-copilot.png)

## Enlaces

- **Repositorio en GitHub:** PENDIENTE
- **Aplicación pública en GitHub Pages:** PENDIENTE
