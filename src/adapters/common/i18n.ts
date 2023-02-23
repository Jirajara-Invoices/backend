import * as i18next from "i18next";

import { TranslationUseCasePort } from "../../usecases/common/interfaces";

export class TranslatorAdapter implements TranslationUseCasePort {
  constructor(private readonly _: i18next.TFunction) {}
  translate(key: string, data?: Record<string, string>): string {
    return this._(key, data || {});
  }
}
