export interface IUser {
  name: string;
  email: string;
  logoUrl?: string;
  location?: string;
  createdAt: string;
  teams?: string[];
}

export interface BatchUpdate {
  [key: string]: any;
}
