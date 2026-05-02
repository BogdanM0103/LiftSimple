import { Exercise } from './exercises';

export type WorkoutSet = {
  reps: string;
  kg: string;
};

export type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
  sets: Record<string, WorkoutSet[]>;
  date: Date;
};
