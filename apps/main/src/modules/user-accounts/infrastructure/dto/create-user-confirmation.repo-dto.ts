export class CreateUserConfirmationRepoDto {
  confirmationCode: string | null;
  expirationDate: Date | null;
  isConfirmed: boolean;
  isAgreeWithPrivacy: boolean;
}
