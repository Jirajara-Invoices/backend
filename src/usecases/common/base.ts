import { User, UserRole } from "../../entities/models/users";
import { validateFiltersInput } from "./validators";
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
    const errors = validateFiltersInput(filter);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("filtersError"), errors);
    }

    if (filter.userId && !this.isCurrentUserAuthorized(filter.userId)) {
      throw new ValidationError(this.translator.translate("viewAllError"), new Map());
    } else {
      filter.userId = this.getCurrentUserId();
    }
  }
}
