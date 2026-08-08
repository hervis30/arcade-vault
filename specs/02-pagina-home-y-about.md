# 02 · Página Home y Acerca de

**Estado:** Approved
**Depende de:** SPEC 01
**Fecha:** 2026-08-08

**Objetivo:** Portar las pantallas `home.jsx` y `about.jsx` de `references/templates/home-about/` a rutas reales de Next.js, moviendo la landing (`Home`) a `/` y reubicando la Biblioteca actual en `/biblioteca`.

## Alcance

**Dentro:**
- Nueva ruta `/` con la landing page completa: hero con siluetas flotantes animadas, sección "¿Por qué Arcade Vault?" (4 feature cards), preview de 6 juegos (`GAMES.slice(0, 6)`), sección de stats, sección "Actividad en Vivo" (ticker de últimas puntuaciones + top jugadores del día), sección de precios (plan único + FAQ), y CTA final.
- La Biblioteca actual (grilla de juegos con buscador y chips de categoría, hoy en `app/page.tsx`) se mueve tal cual a `/biblioteca`, sin cambios de comportamiento.
- Nueva ruta `/acerca-de` con la pantalla About: hero de misión, 3 highlights, divisor decorativo animado, y formulario de contacto (nombre/email/mensaje) que simula envío con una animación de terminal de éxito — sin backend ni persistencia, igual que `about.jsx`.
- Animación "reveal on scroll" (`IntersectionObserver` + clase `.reveal`/`.reveal.in`) portada para las secciones de Home y About, tal como en el template.
- Actualizar `app/components/Nav.tsx` para reflejar la nueva estructura de navegación: "Inicio" (`/`), "Biblioteca" (`/biblioteca`), "Salón de la Fama" (`/salon-de-la-fama`), "Acerca de" (`/acerca-de`), en el nav de escritorio y en el panel móvil.
- Portar a `app/globals.css` los bloques de CSS del template correspondientes a estas pantallas: `HOME PAGE`, `ABOUT PAGE`, `ACTIVITY` (ticker + top jugadores, reutilizado por Home) y `PRICING`, más las reglas `.reveal`/`.reveal.in`.
- Los datos de la sección "Actividad en Vivo" (últimas puntuaciones y top jugadores del día) quedan hardcodeados como arrays estáticos dentro del componente Home, igual que en `home.jsx` — no se conectan a `seededScores` ni a `localStorage`.

**Fuera de alcance:**
- Cualquier lógica real de envío de formulario (email, API, guardado en `localStorage`). El formulario de contacto es 100% decorativo, igual que en `about.jsx`: valida que los 3 campos no estén vacíos (si no, sacude el formulario) y al enviar muestra el bloque `terminal-success` simulado.
- Cambios al catálogo de juegos, al reproductor, a autenticación o al salón de la fama — esas pantallas no se tocan en esta spec.
- Sistema de créditos, ranking en vivo real, o cualquier dato dinámico proveniente de una base de datos — siguen siendo mocks, como en el resto del MVP (SPEC 01).
- El resto de bloques de `references/templates/home-about/styles.css` no usados por Home/About (p. ej. las reglas `.gp*` de gamepad decorativo) no se portan porque ninguna de las dos pantallas los referencia.

## Modelo de datos

No se introduce ningún tipo ni estructura nueva en `app/lib/data.ts`. La landing reutiliza `GAMES` (ya existente) para el preview de juegos. Los arrays de "últimas puntuaciones" y "top jugadores del día" de la sección Actividad en Vivo son constantes locales dentro del componente `Home` (mismo contenido que en `home.jsx`: jugador, juego, puntaje, tiempo relativo / ranking), sin tipo exportado ni reutilización fuera de esa pantalla.

## Plan de implementación

1. **Mover Biblioteca a `/biblioteca`.** Crear `app/biblioteca/page.tsx` con el contenido actual de `app/page.tsx` (hero, buscador, chips, `GameCard` grid) sin cambios de comportamiento. El proyecto sigue compilando y `/biblioteca` muestra lo que hoy muestra `/`.
2. **CSS de Home y About.** Añadir al final de `app/globals.css` los bloques `HOME PAGE`, `ABOUT PAGE`, `ACTIVITY`, `PRICING` y las reglas `.reveal`/`.reveal.in` copiados de `references/templates/home-about/styles.css`. No se cambia nada visible todavía porque ninguna ruta los usa aún.
3. **Landing en `/`.** Reescribir `app/page.tsx` como client component con el port de `Home` (`home.jsx`): `FloatingSilhouettes`, `FeatureIcon`, `MiniCard` como funciones/componentes internos del mismo archivo, hook de reveal-on-scroll con `IntersectionObserver`, y todos los `onClick`/CTA convertidos a `Link`/`router.push` (`/biblioteca`, `/auth`, `/juego/[id]`, `/salon-de-la-fama`).
4. **About en `/acerca-de`.** Crear `app/acerca-de/page.tsx`, port de `About` (`about.jsx`): hero de misión, highlights, divisor animado, formulario de contacto con validación de campos vacíos (shake) y estado `sent` que renderiza el bloque `terminal-success`.
5. **Actualizar Nav.** En `app/components/Nav.tsx`, agregar el link "Inicio" (`/`) y "Acerca de" (`/acerca-de`) tanto en el nav de escritorio como en el panel móvil; ajustar `isActive` para que "Biblioteca" solo se marque activo en `/biblioteca` y `/juego/*` (ya no en `/`), y "Inicio" se marque activo solo en `/`.
6. **Repaso visual final.** Recorrer `/`, `/biblioteca` y `/acerca-de` en `npm run dev` comparando contra `home.jsx`/`about.jsx` en desktop y en un viewport móvil (< 840px, breakpoints propios de cada sección: `980px`/`900px`/`720px`/`520px` según el bloque de CSS portado), y correr `npm run build` para confirmar que no hay errores de tipos ni de build.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` no reporta errores nuevos.
- [ ] `/` muestra la landing: hero con título en 3 líneas y CTAs ("Explorar juegos" → `/biblioteca`, "Crear cuenta" → `/auth`), sección de 4 feature cards, preview de 6 juegos cuyo click navega a `/juego/<id>`, sección de stats, sección de actividad en vivo (ticker + top jugadores), sección de precios, y CTA final que navega a `/biblioteca`.
- [ ] Las secciones marcadas `reveal` en Home y About aparecen con la animación de aparición al hacer scroll (clase `.in` agregada vía `IntersectionObserver`).
- [ ] `/biblioteca` muestra exactamente el mismo contenido y comportamiento (buscador + chips + grid) que antes tenía `/`.
- [ ] `/acerca-de` muestra el hero de misión, los 3 highlights, y el formulario de contacto: enviar con campos vacíos sacude el formulario sin enviar; enviar con los 3 campos completos muestra el bloque `terminal-success` con el nombre ingresado, y el botón "Enviar otro mensaje" resetea el formulario.
- [ ] El Nav muestra los 4 links (Inicio, Biblioteca, Salón de la Fama, Acerca de) en escritorio y en el panel móvil, en las rutas `/`, `/biblioteca`, `/juego/[id]`, `/juego/[id]/jugar`, `/salon-de-la-fama`, `/acerca-de` y `/auth`.
- [ ] El link activo en el Nav corresponde a la ruta actual: "Inicio" solo en `/`, "Biblioteca" en `/biblioteca` y `/juego/*`, "Acerca de" solo en `/acerca-de`.
- [ ] El menú hamburguesa del Nav sigue funcionando en viewport < 840px en todas las rutas, incluidas `/` y `/acerca-de`.

## Decisiones tomadas y descartadas

- **Home reemplaza `/`, Biblioteca se muda a `/biblioteca`.** Se descartó dejar la Biblioteca en `/` y meter Home en otra ruta porque el template original (`nav.jsx`) trata "Inicio" y "Biblioteca" como secciones separadas, y el Nav ya tiene la estructura de links preparada para eso.
- **Formulario de contacto 100% decorativo, sin `localStorage`.** Igual que `about.jsx`: solo valida campos vacíos y anima un bloque de éxito falso. Se descartó persistir en `localStorage` porque el template no lo hace, no hay forma de leer esos mensajes después, y contradice el patrón "solo la parte visual" del MVP (SPEC 01).
- **Datos de "Actividad en Vivo" hardcodeados en el componente Home, no generados desde `seededScores`/`PLAYERS`.** Se mantiene el mismo contenido estático que trae `home.jsx` para no introducir acoplamiento nuevo entre Home y los mocks del catálogo; es consistente con que otros elementos decorativos del sitio (créditos del nav, plan de precios) también están hardcodeados.
- **Home y About en una sola spec.** Ambas pantallas se proveyeron juntas en `references/templates/home-about/` y comparten Nav, estilos y el patrón de animación `reveal`, por lo que no se separaron en dos specs.
- **Subcomponentes de Home (`FloatingSilhouettes`, `FeatureIcon`, `MiniCard`) viven dentro de `app/page.tsx`**, no en archivos separados en `app/components/`, siguiendo el mismo patrón de `home.jsx` (un solo archivo con funciones internas) y el de la Biblioteca actual (`app/page.tsx` ya es autocontenido).
- **CSS de gamepad (`.gp*`) del template no se porta.** No lo usa ni `home.jsx` ni `about.jsx`; portarlo sería CSS muerto en esta spec.
