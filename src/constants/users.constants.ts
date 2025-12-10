export const emailValidation: { value: RegExp; message: string } = {
  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  message: 'Email must contain "@" and a dot, and not contain spaces',
};

export const passwordValidation: { value: RegExp; message: string } = {
  value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])[A-Za-z\d\S]+$/,
  message:
    "Password must contain at least 1 letter, 1 number, and 1 special symbol",
};

export const usernameValidation: { value: RegExp; message: string } = {
  value: /^[a-zA-Z0-9_.]+$/,
  message:
    "Username can only contain letters, numbers, underscores (_), and dots (.)",
};

export const fullnameValidation: { value: RegExp; message: string } = {
  value: /^[^<>]*$/,
  message: "Fullname cannot contain HTML tags (< >)",
};
