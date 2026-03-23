import { UserModel } from '../../../../graph-ql/models/user.model';

export type UsersPage = {
  users: UserModel[];
  nextCursor: string | null;
  hasMore: boolean;
};

export const USERS_PAGE_SIZE = 8;
