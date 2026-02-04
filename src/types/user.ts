export type Role = 'Admin' | 'Analyst' | 'Viewer';

export type User = {
  id: string;
  email: string;
  role: Role;
};

export type AppUser = User;
