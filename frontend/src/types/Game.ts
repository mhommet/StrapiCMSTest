import { Genre } from './Genre';

export interface Game {
  id?: number;
  title: string;
  description?: string;
  release_date?: string;
  genres?: Genre[];
}
