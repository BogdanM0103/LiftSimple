import { Exercise } from './exercises';

export type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
  date: Date;
};
