export class CreateUserRepoDto {
  login: string;
  email: string;
  passwordHash: string | null;
}
