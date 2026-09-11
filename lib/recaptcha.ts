import "server-only";

// Google reCAPTCHA v2 server-side verification.
//
// The SECRET key never leaves the server: it is read from process.env here
// and only used for the siteverify API call. It must never be imported by
// client components or referenced in any API response.
//
// Requires both env vars:
//   NEXT_PUBLIC_RECAPTCHA_SITE_KEY — public site key (browser widget)
//   RECAPTCHA_SECRET_KEY           — secret key (this file only)

const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

function getSecretKey() {
  return (process.env.RECAPTCHA_SECRET_KEY || "").trim();
}

/**
 * Verify a reCAPTCHA token with Google's siteverify endpoint.
 */
export async function verifyRecaptcha(
  token: string | undefined | null,
  remoteIp?: string,
): Promise<{ success: boolean; reason?: string }> {
  if (!token) {
    return { success: false, reason: "missing-token" };
  }

  const secretKey = getSecretKey();
  if (!secretKey) {
    // reCAPTCHA is not configured in this environment (no RECAPTCHA_SECRET_KEY).
    // Skip verification so deployments without the keys keep working unchanged;
    // once the keys are set, verification is strictly enforced.
    console.warn("[RECAPTCHA] RECAPTCHA_SECRET_KEY not set — skipping verification");
    return { success: true, reason: "not-configured" };
  }

  try {
    const params = new URLSearchParams();
    params.set("secret", secretKey);
    params.set("response", token);
    if (remoteIp) {
      params.set("remoteip", remoteIp);
    }

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      // Verification result is short-lived; never cache it.
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[RECAPTCHA] siteverify HTTP " + res.status);
      return { success: false, reason: "verification-request-failed" };
    }

    const data = await res.json();

    if (!data.success) {
      const codes = Array.isArray(data["error-codes"]) ? data["error-codes"].join(", ") : "unknown";
      console.warn("[RECAPTCHA] verification failed:", codes);
      return { success: false, reason: codes };
    }

    return { success: true };
  } catch (err) {
    console.error("[RECAPTCHA] verification error:", err);
    return { success: false, reason: "verification-error" };
  }
}
