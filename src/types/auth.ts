export interface User {
  id?: string;
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  phoneNumber: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends User {
  password: string;
}