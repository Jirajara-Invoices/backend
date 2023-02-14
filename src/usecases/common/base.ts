import { User, UserRole } from "../../entities/models/users";

export abstract class BaseUseCase {
  protected constructor(private currentUser: User | null) {}

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
}
