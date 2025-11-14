import { Resend } from "resend";

/**
 * Resend email client
 * Initialize once and reuse
 * Will be null if RESEND_API_KEY is not set (email features disabled)
 */
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Default sender email
 * Use this for all outgoing emails
 */
export const FROM_EMAIL = "MusicIncome.io <noreply@musicincome.io>";

/**
 * Email sending helper with error handling
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  // Check if Resend is configured
  if (!resend) {
    console.warn("Email not sent - RESEND_API_KEY not configured:", { to, subject });
    return {
      success: false,
      error: "Email service not configured. Add RESEND_API_KEY to environment variables.",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", { to, subject, id: data?.id });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
