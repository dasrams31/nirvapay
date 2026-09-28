import crypto from "node:crypto";
import sql from "./db";

export async function sendTelegramNotification(message: string, chatId?: string | number) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const targetChat = chatId || process.env.ADMIN_TELEGRAM_ID || "606533609";
  if (!token || !targetChat) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChat,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    console.error("Failed to send Telegram alert:", err);
  }
}

export async function dispatchWebhook(invoiceId: string, merchantId: number, payload: Record<string, any>) {
  // Find webhook endpoint for this merchant
  const endpoints = await sql`
    SELECT id, url, secret_key
    FROM webhook_endpoints
    WHERE merchant_id = ${merchantId} AND is_active = TRUE;
  `;

  if (endpoints.length === 0 && !payload.callback_url) {
    return;
  }

  const targetUrls: Array<{ url: string; secret: string }> = endpoints.map((e) => ({
    url: e.url,
    secret: e.secret_key,
  }));

  if (payload.callback_url && !targetUrls.some((t) => t.url === payload.callback_url)) {
    targetUrls.push({ url: payload.callback_url, secret: "nirvapay_dynamic_callback" });
  }

  const payloadString = JSON.stringify(payload);

  for (const { url, secret } of targetUrls) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${invoiceId}|${payload.status}|${payload.total_amount || payload.amount}|${timestamp}`)
      .digest("hex");

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-NirvaPay-Signature": signature,
          "X-NirvaPay-Timestamp": timestamp,
          "X-Invoice-Id": invoiceId,
          "User-Agent": "NirvaPay-Webhook-Engine/2.0",
        },
        body: payloadString,
      });

      const responseText = await resp.text();
      await sql`
        INSERT INTO webhook_logs (
          merchant_id, invoice_id, endpoint_url, request_payload, 
          response_status, response_body, success, created_at
        ) VALUES (
          ${merchantId}, ${invoiceId}, ${url}, ${payloadString},
          ${resp.status}, ${responseText.slice(0, 1000)}, ${resp.ok}, NOW()
        );
      `;
    } catch (err: any) {
      await sql`
        INSERT INTO webhook_logs (
          merchant_id, invoice_id, endpoint_url, request_payload, 
          response_status, response_body, success, created_at
        ) VALUES (
          ${merchantId}, ${invoiceId}, ${url}, ${payloadString},
          500, ${err.message || "Network Error"}, FALSE, NOW()
        );
      `;
    }
  }
}
