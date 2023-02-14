import { LoggerUseCasePort } from "../../usecases/common/interfaces";
import { Logger } from "winston";

export class LoggerAdapter implements LoggerUseCasePort {
  constructor(private readonly instance: Logger) {}
  info(message: string): void {
    this.instance.info(message);
  }

  error(message: string): void {
    this.instance.error(message);
  }

  debug(message: string): void {
    this.instance.debug(message);
  }

  warn(message: string): void {
    this.instance.warn(message);
  }
}
