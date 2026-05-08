import { UserModel } from '../../../../graph-ql/models/user.model';

export type UsersPage = {
  users: UserModel[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
};
