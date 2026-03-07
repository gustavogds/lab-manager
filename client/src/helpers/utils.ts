export const passwordValidator = (
  password: string,
  passwordConfirm: string
) => {
  let errors = {
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
    symbol: false,
    match: false,
  };

  if (password.length < 6) {
    errors.length = true;
  }

  if (!/\d/.test(password)) {
    errors.number = true;
  }

  if (!/[A-Z]/.test(password)) {
    errors.uppercase = true;
  }

  if (!/[a-z]/.test(password)) {
    errors.lowercase = true;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.symbol = true;
  }

  if (password !== passwordConfirm) {
    errors.match = true;
  }

  return errors;
};

export const isEmptyObject = (obj: object) => {
  return obj && Object.keys(obj).length === 0;
};

export const randomString = (length: number = 8, prefix?: string) => {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  if (prefix) {
    result = `${prefix}${result}`;
  }

  return result;
};

export const bytesToSize = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "n/a";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)) as any);
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

export type UserWithRoles = { roles?: string[] };

export const hasRole = (user: UserWithRoles | null | undefined, role: string): boolean => {
  return user?.roles?.includes(role) ?? false;
};

export const hasAnyRole = (user: UserWithRoles | null | undefined, roles: string[]): boolean => {
  return roles.some(role => user?.roles?.includes(role) ?? false);
};

export const canManageEquipment = (user: UserWithRoles | null | undefined): boolean => {
  return hasAnyRole(user, ["professor", "inventory_manager"]);
};

export const canManageAll = (user: UserWithRoles | null | undefined): boolean => {
  return hasRole(user, "professor");
};
