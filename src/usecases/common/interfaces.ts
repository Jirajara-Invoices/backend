export interface LoggerUseCasePort {
  info(message: string, data?: any): void;
  error(message: string, data?: any): void;
  debug(message: string, data?: any): void;
  warn(message: string, data?: any): void;
}

export interface TranslationUseCasePort {
  translate(key: string, data?: Record<string, string>): string;
}
