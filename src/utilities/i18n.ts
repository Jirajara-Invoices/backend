import i18next from "i18next";
import middleware from "i18next-http-middleware";

import en from "../../locales/en.json" assert { type: "json" };
import es from "../../locales/es.json" assert { type: "json" };

export async function initializeI18n() {
  await i18next.use(middleware.LanguageDetector).init({
    preload: ["en", "es"],
    fallbackLng: "en",
    cache: {
      enabled: true,
    },
    resources: {
      en: {
        translation: en,
      },
      es: {
        translation: es,
      },
    },
  });
}
