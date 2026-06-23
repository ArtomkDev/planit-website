export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface NavigationItem {
  label: string;
  href: string;
}