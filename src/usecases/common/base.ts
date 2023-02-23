import { User, UserRole } from "../../entities/models/users";
import { ValidationError } from "../../entities/errors";
import { Pagination } from "../../entities/types/pagination";
import { TranslationUseCasePort } from "./interfaces";

export abstract class BaseUseCase {
  protected constructor(
    protected readonly translator: TranslationUseCasePort,
    private currentUser: User | null,
  ) {}

  public setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  public getCurrentUserId(): string {
    return this.currentUser?.id ?? "";
  }

  protected isCurrentUserAdmin(): boolean {
    return this.currentUser?.role === UserRole.Admin;
  }

  protected isCurrentUserAuthorized(id: string): boolean {
    return this.currentUser?.id === id || this.isCurrentUserAdmin();
  }

  protected validateFilterInputWithUser<T extends Pagination & { userId?: string }>(
    filter: T,
  ): void {
    const errors = this.validateFiltersInput(filter);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("filtersError"), errors);
    }

    if (filter.userId && !this.isCurrentUserAuthorized(filter.userId)) {
      throw new ValidationError(this.translator.translate("viewAllError"), new Map());
    } else {
      filter.userId = this.getCurrentUserId();
    }
  }
  protected validateFiltersInput<T extends Pagination>(input: T): Map<string, string> {
    const errors: Map<string, string> = new Map();
    if (!input.limit || input.limit < 1) {
      errors.set("limit", this.translator.translate("inputFilterLimitError"));
    }

    if (input.cursor && input.cursor.length < 1 && isNaN(new Date(input.cursor).valueOf())) {
      errors.set("cursor", this.translator.translate("inputFilterCursorError"));
    }

    if (!input.direction || (input.direction !== "ASC" && input.direction !== "DESC")) {
      errors.set("direction", this.translator.translate("inputFilterDirectionError"));
    }

    return errors;
  }
}
