export const emailValidation = {
  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  message: "Invalid email format",
};

export const passwordValidation = {
  value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])[A-Za-z\d\S]+$/,
  message:
    "Password must contain at least 1 letter, 1 number, and 1 special symbol",
};

export const usernameValidation = {
  value: /^[a-zA-Z0-9_.]{3,20}$/,
  message:
    "Username must be 3-20 characters and may contain letters, numbers, underscores and dots only",
};

export const fullNameValidation = {
  value: /^[A-Za-zА-Яа-яЁё\s-]{3,50}$/,
  message:
    "Full name must be 3-50 characters and contain only letters, spaces or hyphens",
};
