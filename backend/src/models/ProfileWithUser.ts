export interface UserInfo {
  id?: number;
  name?: string;
  email?: string;
}

export interface ProfileWithUser<T> {
  profile: T | null;
  user?: UserInfo | null;
}