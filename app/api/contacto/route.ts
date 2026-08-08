import { Resend } from "resend";

const CONTACT_EMAIL_TO = "passionsociety1@gmail.com";

export async function POST(request: Request) {
  const { name, email, msg } = await request.json();

  if (!name?.trim() || !email?.trim() || !msg?.trim()) {
    return Response.json({ error: "Campos incompletos." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: CONTACT_EMAIL_TO,
    replyTo: email,
    subject: "Nuevo mensaje de contacto — Arcade Vault",
    text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${msg}`,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
