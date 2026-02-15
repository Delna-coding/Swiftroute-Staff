
export interface Stop {
  id: number;
  name: string;
  x: number; // For SVG mapping
  y: number;
}

export interface Ticket {
  id: string;
  busName: string;
  boardingIdx: number;
  destinationIdx: number;
  count: number;
  timestamp: number;
}

export interface User {
  username: string;
  busName?: string;
  route?: string;
  isLoggedIn: boolean;
}

export enum AuthState {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD'
}
