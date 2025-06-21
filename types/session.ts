export interface IFormData {
  marker: string;
  value: string;
}

export interface IUserEntity {
  _id: string; // MongoDB document ID
  email: string;
  password?: string; // Optional if you're omitting it on the client side
  name: string;
  identifier: string;
  formData: IFormData[];
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}
