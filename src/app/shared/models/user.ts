export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

export const CURRENT_USER: User = {
  id: 1,
  name: 'Carlos Rodríguez',
  role: 'MANAGER',
};