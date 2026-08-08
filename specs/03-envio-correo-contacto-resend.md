# 03 · Envío real de correo en el formulario de contacto (Resend)

**Estado:** Approved
**Depende de:** SPEC 02
**Fecha:** 2026-08-08

**Objetivo:** Conectar el formulario de contacto de `/acerca-de` (hoy 100% decorativo) a un envío real de correo electrónico vía Resend, hacia `passionsociety1@gmail.com`.

## Alcance

**Dentro:**
- Endpoint server-side `app/api/contacto/route.ts` (Route Handler, `POST`) que recibe `{ name, email, msg }`, valida que los 3 campos no estén vacíos, y llama a la API de Resend con la librería oficial `resend`.
- Variable de entorno `RESEND_API_KEY` en `.env.local` (no versionado, ya cubierto por `.gitignore`). Se crea el archivo con un valor placeholder — el usuario coloca la key real después.
- Correo enviado `from` la dirección de pruebas de Resend (`onboarding@resend.dev`) hacia `to: "passionsociety1@gmail.com"` (hardcodeado en el Route Handler), con `reply_to` seteado al email que escribió el usuario en el form.
- Asunto fijo `"Nuevo mensaje de contacto — Arcade Vault"` y cuerpo con nombre, email y mensaje del formulario.
- `app/acerca-de/page.tsx` actualizado: `onSubmit` pasa a ser `async`, hace `fetch("/api/contacto", { method: "POST", body: JSON.stringify(form) })`, y solo muestra `terminal-success` cuando la respuesta es `200 OK`. Mientras espera la respuesta, el botón de envío queda en estado "ENVIANDO…" (deshabilitado). Si la respuesta falla (red, error de Resend, `500`), se muestra un mensaje de error inline debajo del formulario ("No se pudo enviar. Intenta de nuevo.") sin perder lo escrito, permitiendo reintentar.
- La validación de campos vacíos (shake) se mantiene igual que hoy, ocurre antes de llamar al endpoint.
- Dependencia nueva `resend` agregada a `package.json`.

**Fuera de alcance:**
- Verificación de dominio propio en Resend — se usa el dominio de pruebas `onboarding@resend.dev`.
- Guardado de los mensajes de contacto en base de datos o `localStorage` — el mensaje solo se envía por correo, no se persiste en el proyecto.
- Rate limiting, captcha o cualquier protección anti-spam del endpoint.
- Notificaciones de confirmación al usuario que escribió el mensaje (no se le envía copia a su propio correo, solo se usa su email como `reply_to`).
- Cambios al resto del formulario visual (estilos, campos, textos) — solo cambia el comportamiento de envío.

## Modelo de datos

No se introduce ningún tipo ni estructura persistente. El único "dato nuevo" es el payload transitorio del `POST` a `/api/contacto`:

```ts
interface ContactPayload {
  name: string;
  email: string;
  msg: string;
}
```

No se guarda en ningún store; vive solo en memoria durante el request.

## Plan de implementación

1. **Dependencia y config.** Agregar `resend` a `package.json` (`npm install resend`). Crear `.env.local` con `RESEND_API_KEY=` (placeholder vacío, el usuario lo completa después). El proyecto sigue compilando aunque la key esté vacía (el endpoint fallará en runtime hasta que se coloque, lo cual es comportamiento esperado).
2. **Route Handler.** Crear `app/api/contacto/route.ts`: exporta `POST`, valida que `name`/`email`/`msg` no estén vacíos (400 si faltan), instancia `new Resend(process.env.RESEND_API_KEY)`, llama a `resend.emails.send({ from: "onboarding@resend.dev", to: "passionsociety1@gmail.com", reply_to: email, subject: "Nuevo mensaje de contacto — Arcade Vault", text: ... })`, responde `200` si Resend confirma el envío, `500` con mensaje de error si falla.
3. **Conectar el formulario.** En `app/acerca-de/page.tsx`, cambiar `onSubmit` a `async`, agregar estado `sending` (bool) y `error` (string | null). Al enviar: valida campos vacíos (shake, igual que hoy) → si pasa, `setSending(true)`, hace `fetch("/api/contacto", ...)` → si `res.ok`, `setSent(form.name.trim())`; si falla, `setError("No se pudo enviar. Intenta de nuevo.")` y mantiene el formulario con los datos ingresados; en ambos casos `setSending(false)` al terminar.
4. **UI de estados.** El botón "ENVIAR MENSAJE" muestra "ENVIANDO…" y queda `disabled` mientras `sending` es `true`. Si `error` tiene valor, se muestra un texto debajo del botón (reutilizando la paleta de colores de error/rojo ya definida en `globals.css` si existe, o un estilo inline consistente con el resto del formulario si no).
5. **Repaso funcional final.** Con la `RESEND_API_KEY` real ya colocada por el usuario, probar en `npm run dev`: enviar con campos vacíos (shake, sin llamar al endpoint), enviar con los 3 campos completos (llega el correo a `passionsociety1@gmail.com` con el `reply_to` correcto), simular un fallo (key inválida) y confirmar que se ve el mensaje de error inline. Correr `npm run build` para confirmar que no hay errores de tipos ni de build.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` no reporta errores nuevos.
- [ ] `RESEND_API_KEY` vive en `.env.local` (no versionado) y el Route Handler la lee de `process.env.RESEND_API_KEY`.
- [ ] Enviar el formulario con los 3 campos completos y una `RESEND_API_KEY` válida hace que llegue un correo a `passionsociety1@gmail.com` con asunto `"Nuevo mensaje de contacto — Arcade Vault"`, el nombre/email/mensaje ingresados, y `reply_to` igual al email del formulario.
- [ ] Mientras se espera la respuesta del servidor, el botón de envío muestra "ENVIANDO…" y está deshabilitado.
- [ ] El bloque `terminal-success` solo aparece cuando el endpoint responde `200 OK` — no aparece de forma optimista antes de la confirmación.
- [ ] Si el endpoint responde con error (o la key es inválida), se muestra un mensaje de error inline debajo del formulario y los datos ingresados no se pierden, permitiendo reintentar.
- [ ] Enviar con algún campo vacío sigue sacudiendo el formulario (`shake`) sin llegar a llamar al endpoint.
- [ ] El botón "Enviar otro mensaje" tras un envío exitoso resetea el formulario, igual que hoy.

## Decisiones tomadas y descartadas

- **Route Handler (`app/api/contacto/route.ts`) en vez de Server Action.** Ambas opciones mantienen la API key fuera del cliente; se eligió Route Handler por ser el patrón más explícito para un endpoint que solo hace una cosa (enviar correo) y más fácil de probar de forma aislada (`curl`/Postman) mientras se configura la key real.
- **Dominio de pruebas `onboarding@resend.dev` como remitente.** Se descarta verificar un dominio propio en esta spec porque no hay uno disponible todavía; el dominio de pruebas de Resend permite enviar sin configuración adicional y es suficiente ya que el destino es un correo propio del equipo.
- **Destino hardcodeado (`passionsociety1@gmail.com`) en el Route Handler, no en variable de entorno.** Consistente con el patrón de "decisión cerrada, sin necesidad de configurarla" — ya se definió como fijo, no como algo que vaya a cambiar por ambiente.
- **Espera la confirmación real antes de mostrar `terminal-success`** (no optimista). Se descarta el comportamiento instantáneo del template original porque ahora hay un envío real que puede fallar (key inválida, red, rate limit de Resend) y el usuario necesita saber si su mensaje realmente llegó.
- **Sin persistencia de los mensajes** (ni `localStorage` ni base de datos). El único canal de entrega es el correo; no se introduce un nuevo store de datos para no expandir el alcance de la spec.
- **`.env.local` se crea con placeholder vacío.** El usuario coloca la `RESEND_API_KEY` real manualmente después de esta spec; el build no depende de que la key ya esté presente, solo el envío en runtime.

## Riesgos identificados

- **Límite del dominio de pruebas de Resend.** `onboarding@resend.dev` solo permite enviar hacia la dirección de correo asociada a la cuenta de Resend del usuario durante el modo de pruebas (antes de verificar un dominio). Si `passionsociety1@gmail.com` no es esa cuenta, los envíos podrían ser rechazados por Resend hasta verificar un dominio propio — a validar en el paso 5 del plan de implementación con la key real.
