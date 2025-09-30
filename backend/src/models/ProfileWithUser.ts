export interface UserInfo {
  id?: number;
  name?: string;
  email?: string;
}

export interface ProfileWithUser<T> {
  profile: T | null;
  user?: UserInfo | null; // present when owner fetches (or when we want to expose email)
}
