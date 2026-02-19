import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import env from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(1, "Naam is verplicht").max(100, "Naam is te lang"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().optional(),
  message: z
    .string()
    .min(1, "Bericht is verplicht")
    .max(5000, "Bericht is te lang"),
  honeypot: z.string().optional(),
});

// In-memory rate limiter: 3 submissions per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(ip: string): boolean {
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    // No entry or expired — reset
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true; // allowed
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // blocked
  }

  entry.count += 1;
  return true; // allowed
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Ongeldige invoer", details: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, phone, message, honeypot } = result.data;

    // Honeypot check — silent rejection for bots
    if (honeypot && honeypot.length > 0) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Rate limiting by IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    const allowed = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Te veel verzoeken. Probeer het later opnieuw." },
        { status: 429 }
      );
    }

    // Send notification email to business owner
    await resend.emails.send({
      from: "Pure Blinds <info@pure-blinds.nl>",
      to: env.CONTACT_EMAIL,
      subject: `Nieuw contactformulier bericht van ${name}`,
      html: `
        <!DOCTYPE html>
        <html lang="nl">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="font-size: 18px; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px;">
            Nieuw contactformulier bericht
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #6b7280; width: 120px; vertical-align: top;">Naam</td>
              <td style="padding: 10px 0; font-size: 14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #6b7280; vertical-align: top;">E-mail</td>
              <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #1a1a1a;">${email}</a></td>
            </tr>
            ${
              phone
                ? `<tr>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #6b7280; vertical-align: top;">Telefoon</td>
              <td style="padding: 10px 0; font-size: 14px;">${phone}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #6b7280; vertical-align: top;">Bericht</td>
              <td style="padding: 10px 0; font-size: 14px; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    // Send confirmation email to customer
    await resend.emails.send({
      from: "Pure Blinds <info@pure-blinds.nl>",
      to: email,
      subject: "We ontvingen uw bericht - Pure Blinds",
      html: `
        <!DOCTYPE html>
        <html lang="nl">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="font-size: 18px; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px;">
            Bedankt voor uw bericht
          </h2>
          <p style="font-size: 14px; line-height: 1.6;">Beste ${name},</p>
          <p style="font-size: 14px; line-height: 1.6;">
            Bedankt voor uw bericht. We hebben uw aanvraag ontvangen en nemen zo snel mogelijk contact met u op.
          </p>
          <p style="font-size: 14px; line-height: 1.6;">
            Met vriendelijke groet,<br>
            <strong>Pure Blinds</strong>
          </p>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json(
      {
        error:
          "Er is iets misgegaan bij het versturen. Probeer het later opnieuw.",
      },
      { status: 500 }
    );
  }
}
