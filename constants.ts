
import { Stop } from './types';

export const STOPS: Stop[] = [
  { id: 0, name: 'Kasaragod', x: 200, y: 50 },
  { id: 1, name: 'Kannur', x: 220, y: 150 },
  { id: 2, name: 'Malappuram', x: 260, y: 250 },
  { id: 3, name: 'Thrissur', x: 250, y: 350 },
  { id: 4, name: 'Ernakulam', x: 230, y: 450 },
  { id: 5, name: 'Kottayam', x: 280, y: 550 },
];

export const TRANSITION_TIME_MS = 20000; // 20 seconds between stops
export const STOP_WAIT_TIME_MS = 10000; // 10 seconds halt at each stop
export const MAX_CAPACITY = 55;
