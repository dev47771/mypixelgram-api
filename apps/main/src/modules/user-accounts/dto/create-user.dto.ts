export class CreateUserDto {
  login: string;
  email: string;
  password: string | null;
}

export class RegistrationWithRecaptchaDto {}
