export const loginConstraints = {
  minLength: 6,
  maxLength: 30,
  match: /^[a-zA-Z0-9_-]*$/,
};
export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
  match:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!"#$%&'()*+,\-.\/\\:;<=>?@\[\]^_{|}~]*$/,
};

export const jwtConstraints = {
  secret: 'jwt-secret'
}
