import { CreateUserInputDto } from '../../../../src/modules/user-accounts/api/input-dto/create-user.input-dto';

export function makeValidUserInput(
  overrides: Partial<CreateUserInputDto> = {},
): CreateUserInputDto {
  const random = Math.random().toString(36).slice(2, 8);
  return {
    login: `user_${random}`,
    email: `user_${random}@example.com`,
    password: 'Qwerty123',
    ...overrides,
  };
}

export function getInvalidLoginCases(existingUserLogin: string): any[] {
  const validInput = makeValidUserInput();
  return [
    // missing
    { ...validInput, login: undefined },
    // not string
    { ...validInput, login: 4 },
    // empty string
    { ...validInput, login: '' },
    // empty string with spaces
    { ...validInput, login: '  ' },
    // too long
    { ...validInput, login: 'a'.repeat(31) },
    // too short
    { ...validInput, login: 'a'.repeat(5) },
    // does not match pattern
    { ...validInput, login: '//     //' },
    // already taken
    { ...validInput, login: existingUserLogin },
  ];
}

export function getInvalidEmailCases(existingUserEmail: string): any[] {
  const validInput = makeValidUserInput();
  return [
    // missing
    { ...validInput, email: undefined },
    // not string
    { ...validInput, email: 4 },
    // empty string
    { ...validInput, email: '' },
    // empty string with spaces
    { ...validInput, email: '  ' },
    // does not match pattern
    { ...validInput, email: 'without domain' },
    // already taken
    { ...validInput, email: existingUserEmail },
  ];
}

export function getInvalidPasswordCases(): any[] {
  const validInput = makeValidUserInput();
  return [
    // missing
    { ...validInput, password: undefined },
    // not string
    { ...validInput, password: 4 },
    // empty string
    { ...validInput, password: '' },
    // empty string with spaces
    { ...validInput, password: '  ' },
    // too long
    { ...validInput, password: 'aB1'.repeat(7) },
    // too short
    { ...validInput, password: 'aB123' },
    // missing number
    { ...validInput, password: 'withoutNumber' },
    // missing uppercase letter
    { ...validInput, password: 'lowercase123' },
    // missing lowercase letter
    { ...validInput, password: 'UPPERCASE123' },
    // some character is not allowed
    { ...validInput, password: 'aB 12345' },
  ];
}
