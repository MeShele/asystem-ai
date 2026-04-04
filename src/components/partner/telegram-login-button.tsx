"use client";

import { useEffect } from "react";

export function TelegramLoginButton() {
  useEffect(() => {
    (window as unknown as Record<string, unknown>).onTelegramAuth = async (user: Record<string, string>) => {
      try {
        const res = await fetch("/api/partner/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        if (res.ok) {
          window.location.reload();
        }
      } catch {
        // ignore
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "asystemai_sms_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    const container = document.getElementById("tg-login-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }

    return () => {
      delete (window as unknown as Record<string, unknown>).onTelegramAuth;
    };
  }, []);

  return <div id="tg-login-container" className="flex justify-center" />;
}
