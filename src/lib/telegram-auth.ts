import crypto from "crypto";

/**
 * Validates Telegram WebApp initData per official spec:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Все query-параметры из initData (кроме hash) сортируются по ключу, объединяются \n,
 * подписываются HMAC-SHA256 ключом = HMAC-SHA256("WebAppData", bot_token).
 *
 * @param initDataRaw — строка из window.Telegram.WebApp.initData
 * @param botToken — Bot API token
 * @returns parsed user если валидно, null иначе
 */
export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export function validateTelegramWebAppData(
  initDataRaw: string,
  botToken: string
): { ok: boolean; user?: TelegramWebAppUser; authDate?: number; error?: string } {
  if (!initDataRaw || !botToken) {
    return { ok: false, error: "missing initData or botToken" };
  }

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initDataRaw);
  } catch {
    return { ok: false, error: "cannot parse initData" };
  }

  const hash = params.get("hash");
  if (!hash) return { ok: false, error: "no hash in initData" };

  // Собираем data-check-string
  const entries: [string, string][] = [];
  params.forEach((value, key) => {
    if (key !== "hash") entries.push([key, value]);
  });
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  // Считаем HMAC
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== hash) {
    return { ok: false, error: "hash mismatch" };
  }

  // Проверка свежести (24 часа)
  const authDate = Number(params.get("auth_date") || 0);
  if (authDate > 0) {
    const ageSec = Math.floor(Date.now() / 1000) - authDate;
    if (ageSec > 24 * 60 * 60) {
      return { ok: false, error: "initData too old" };
    }
  }

  // Парсим user
  let user: TelegramWebAppUser | undefined;
  const userRaw = params.get("user");
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      return { ok: false, error: "cannot parse user" };
    }
  }

  return { ok: true, user, authDate };
}
