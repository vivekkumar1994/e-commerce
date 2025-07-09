// types/User.ts
export interface UserClient {
  _id: string;
  name: string;
  email: string;
}

export interface RecentUser extends UserClient {
  createdAt: string;
}
