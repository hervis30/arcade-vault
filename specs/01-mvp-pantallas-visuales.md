# 01 · MVP — Pantallas visuales de Arcade Vault

**Estado:** Approved
**Depende de:** —
**Fecha:** 2026-08-08

**Objetivo:** Portar las 5 pantallas del prototipo estático (`references/templates/`) a rutas reales de Next.js App Router, con la misma UI, animaciones y comportamiento de datos simulados (localStorage + mocks), sin implementar lógica de juego real.

## Alcance

**Dentro:**
- 5 rutas reales: biblioteca (`/`), ficha de juego (`/juego/[id]`), reproductor (`/juego/[id]/jugar`), autenticación (`/auth`) y salón de la fama (`/salon-de-la-fama`).
- Nav (con menú móvil hamburguesa) y footer, compartidos vía `app/layout.tsx`.
- Datos mock estáticos (`GAMES`, `CATS`, `PLAYERS`, `seededScores`) portados a TypeScript tipado.
- Sesión de usuario simulada con `localStorage` (clave `av_user`): login, "jugar como invitado", cerrar sesión.
- Guardado de puntuaciones simulado con `localStorage` (clave `av_scores`) al terminar una partida en el reproductor.
- El reproductor (`/juego/[id]/jugar`) se porta tal cual el template: HUD con puntuación auto-incremental falsa (`setInterval`), nave/enemigos animados por CSS, pausa, y modal de "fin del juego" con guardado de puntuación. Es un placeholder 100% visual — no hay lógica de juego real, colisiones, ni inputs de control.
- Estilos: reutilizar `app/globals.css`, que ya es un port casi 1:1 de `references/templates/styles.css` (variables de fuente ya ajustadas a `next/font`).
- Responsive: mantener los mismos breakpoints y comportamiento móvil del template (nav hamburguesa, grillas que colapsan).

**Fuera de alcance:**
- Cualquier lógica de juego jugable real (colisiones, física, controles, puntuación basada en eventos del jugador). Los 8 juegos del catálogo (`bloque-buster`, `caida`, `serpentina`, `gloton`, `invasores`, `rocas`, `ranaria`, `duelo-pixel`) quedan como fichas navegables, no como juegos funcionales.
- Backend real, base de datos, o API. Toda persistencia es `localStorage` del navegador.
- Autenticación real (OAuth de Google/GitHub son botones decorativos sin funcionalidad, igual que en el template).
- Sistema de créditos funcional — el contador "CRÉDITOS · 03" en el nav es texto estático decorativo.
- Tests automatizados (no hay test runner configurado en el repo).

## Modelo de datos

Archivo `app/lib/data.ts`, port tipado de `references/templates/data.jsx`:

```ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string; // clase CSS (cover-bricks, cover-tetro, ...) ya definida en globals.css
  color: GameColor;
  best: number;
  plays: string;
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;
}

export const GAMES: Game[];
export const CATS: readonly ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];
export const PLAYERS: string[];
export function seededScores(seed: number, count?: number): ScoreRow[];
```

Estado de sesión y puntuaciones (no son "datos" del catálogo, sino estado de cliente vía `localStorage`), gestionado por un hook `app/lib/useAuth.ts`:

```ts
export interface AuthUser {
  name: string;
}

export function useAuth(): {
  user: AuthUser | null;
  login: (user: AuthUser | null) => void; // null = invitado
  signOut: () => void;
};

export function saveScore(entry: { game: string; score: number; name: string }): void;
```

`useAuth` lee/escribe la clave `av_user` de `localStorage` (mismo formato que el template). `saveScore` escribe en la clave `av_scores` como un array append-only, igual que `handleSaveScore` en `app.jsx`. Cada componente cliente que necesite el usuario actual (Nav, reproductor, salón de la fama) llama a `useAuth()` de forma independiente, ya que no hay Context global — es la forma más simple de portar el estado dado que ahora cada pantalla es una ruta real en vez de un único componente `App`.

## Plan de implementación

1. **Datos y estado base.** Crear `app/lib/data.ts` (port de `data.jsx` con tipos) y `app/lib/useAuth.ts` (hook de sesión + `saveScore`). El proyecto sigue compilando y `npm run dev` sigue sirviendo la home actual sin cambios visibles todavía.
2. **Nav y layout compartido.** Crear `app/components/Nav.tsx` (client component, port de `nav.jsx` usando `next/link` y `usePathname` en vez de la prop `route`/`navigate`) y montarlo en `app/layout.tsx` junto con el footer existente. Verificar que el menú hamburguesa y el estado activo de los links funcionan en cualquier ruta.
3. **Biblioteca (`/`).** Crear `app/components/GameCard.tsx` (port de `GameCard` en `biblioteca.jsx`) y reemplazar el contenido de `app/page.tsx` por el port completo de `Library` (hero, buscador, chips de categoría, grilla de tarjetas con tilt 3D). Los clics en una tarjeta navegan a `/juego/[id]`.
4. **Ficha de juego (`/juego/[id]`).** Crear `app/juego/[id]/page.tsx`, port de `detalle.jsx` (`GameDetail`): portada, tags, descripción, stats, leaderboard con `seededScores`, botones "Jugar ahora" → `/juego/[id]/jugar` y "Volver al vault" → `/`. Manejar `id` inexistente con `notFound()`.
5. **Reproductor (`/juego/[id]/jugar`).** Crear `app/juego/[id]/jugar/page.tsx`, port de `reproductor.jsx` (`GamePlayer`) como client component: HUD, CRT con animación CSS, pausa, modal de fin de juego que llama a `saveScore` y navega con los mismos botones que el template ("Salir" → `/juego/[id]`, "Volver al vault" → `/`).
6. **Autenticación (`/auth`).** Crear `app/auth/page.tsx`, port de `auth.jsx` (`Auth`): tabs iniciar sesión/crear cuenta, formulario, botón de invitado y botones sociales decorativos. Al enviar, llama a `useAuth().login(...)` y navega a `/`.
7. **Salón de la fama (`/salon-de-la-fama`).** Crear `app/salon-de-la-fama/page.tsx`, port de `salon.jsx` (`HallOfFame`): tabs por juego, podio, tabla de posiciones, fila "tu mejor marca" si hay usuario. Botón "Volver a la biblioteca" → `/`.
8. **Repaso visual final.** Recorrer las 5 rutas en `npm run dev` comparando contra `references/templates/Arcade Vault.html` abierto en paralelo, en desktop y en un viewport móvil (< 840px), y correr `npm run build` para confirmar que no hay errores de tipos ni de build.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` no reporta errores nuevos.
- [ ] `/` muestra la biblioteca con hero, buscador funcional (filtra por texto), chips de categoría funcionales (filtran por categoría) y grilla de tarjetas de los 8 juegos de `GAMES`.
- [ ] Click en una tarjeta o en su botón "Jugar" navega a `/juego/<id>` con el `id` correcto.
- [ ] `/juego/[id]` muestra portada, descripción, stats y leaderboard del juego; un `id` que no existe en `GAMES` responde 404.
- [ ] Botón "Jugar ahora" en la ficha navega a `/juego/[id]/jugar`.
- [ ] `/juego/[id]/jugar` muestra el HUD con puntuación que sube sola, permite pausar/reanudar, y al pulsar "Fin" abre el modal de fin de juego.
- [ ] Guardar la puntuación en el modal la persiste en `localStorage` (clave `av_scores`) y muestra el mensaje de confirmación.
- [ ] `/auth` permite alternar entre "iniciar sesión" y "crear cuenta", enviar el formulario inicia sesión (guarda `av_user` en `localStorage`) y redirige a `/`; "jugar como invitado" limpia la sesión y también redirige a `/`.
- [ ] El Nav refleja el estado de sesión (muestra el nombre de usuario o el botón "Iniciar sesión") en cualquier ruta, y "cerrar sesión" limpia `av_user`.
- [ ] `/salon-de-la-fama` muestra tabs por juego, podio (top 3) y tabla de posiciones; si hay un usuario logueado, muestra la fila "tu mejor marca".
- [ ] El menú hamburguesa del Nav funciona en viewport < 840px en las 5 rutas.
- [ ] La sesión persiste tras recargar la página (F5) gracias a `localStorage`.

## Decisiones tomadas y descartadas

- **Rutas reales de Next.js en vez de hash-routing.** El template usa `location.hash` con un único componente `App`; se descarta para aprovechar el App Router de Next.js (URLs limpias, compartibles, `next/link`, `notFound()`). Implica reescribir la navegación basada en `navigate({name, id})` a `router.push`/`<Link>`.
- **Reproductor portado tal cual, con su animación falsa.** Se consideró dejarlo estático sin auto-score ni modal, pero se descartó: toda la lógica del HUD es CSS/`setInterval` decorativo, no hay simulación de juego real (sin colisiones, sin física, sin lógica de niveles), por lo que cae dentro de "solo la parte visual".
- **Estado de sesión con un hook `useAuth` en vez de React Context.** El template centraliza `user` en `App` y lo pasa por props; como ahora cada pantalla es una ruta independiente, se optó por un hook que lee/escribe `localStorage` directamente en cada componente cliente que lo necesita, evitando introducir un Context Provider para un MVP puramente visual.
- **Datos mock en `app/lib/data.ts`, tipados con TypeScript.** Se mantiene el mismo contenido y nombres (`GAMES`, `CATS`, `PLAYERS`, `seededScores`) que `data.jsx`, solo se les agregan tipos.
- **Slugs de ruta en español** (`/juego/[id]`, `/juego/[id]/jugar`, `/salon-de-la-fama`), consistentes con el copy en español de toda la app.
- **Nav y footer se mueven a `app/layout.tsx`** en vez de repetirse en cada página, ya que son elementos compartidos por las 5 pantallas (igual que en `app.jsx`, donde `Nav` envuelve el `screen` actual).
- **Créditos y footer quedan hardcodeados**, igual que en el template — no tienen lógica real detrás en este MVP.
