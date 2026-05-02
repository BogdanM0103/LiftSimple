import { Workout } from './types';

export function totalWeightLifted(workout: Workout): number {
  let total = 0;
  for (const sets of Object.values(workout.sets ?? {})) {
    for (const set of sets) {
      total += (parseFloat(set.kg) || 0) * (parseInt(set.reps) || 0);
    }
  }
  return total;
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg.toLocaleString()} kg`;
}
