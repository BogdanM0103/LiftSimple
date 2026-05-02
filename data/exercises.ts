export type Exercise = {
  name: string;
  muscle: string;
};

export const exercises: Exercise[] = [
  { name: 'Flat Barbell Press', muscle: 'Chest' },
  { name: 'Incline Barbell Press', muscle: 'Chest' },
  { name: 'Flat Dumbbell Press', muscle: 'Chest' },
  { name: 'Incline Dumbbell Press', muscle: 'Chest' },
  { name: 'Pec Deck', muscle: 'Chest' },
  { name: 'Cable Chest Fly', muscle: 'Chest' },
  { name: 'Squat', muscle: 'Legs' },
  { name: 'Romanian Deadlift', muscle: 'Legs' },
  { name: 'Bulgarian Split-Squat', muscle: 'Legs' },
  { name: 'Leg Extension', muscle: 'Legs' },
  { name: 'Leg Curl', muscle: 'Legs' },
  { name: 'Calf Raises', muscle: 'Legs' },
  { name: 'Deadlift', muscle: 'Back' },
  { name: 'Pullups', muscle: 'Back' },
  { name: 'Lat Pulldown', muscle: 'Back' },
  { name: 'Lat Cable Rows', muscle: 'Back' },
  { name: 'Barbell Rows', muscle: 'Back' },
  { name: 'Dumbbell Rows', muscle: 'Back' },
  { name: 'Dumbbell Curls', muscle: 'Biceps' },
  { name: 'Hammer Curls', muscle: 'Biceps' },
  { name: 'Barbell Curls', muscle: 'Biceps' },
  { name: 'Chin-ups', muscle: 'Biceps' },
  { name: 'Preacher Curls', muscle: 'Biceps' },
  { name: 'Dips', muscle: 'Triceps' },
  { name: 'Rope Pushdowns', muscle: 'Triceps' },
  { name: 'V-Bar Pushdowns', muscle: 'Triceps' },
  { name: 'Overhead Pushdowns', muscle: 'Triceps' },
  { name: 'French Press', muscle: 'Triceps' },
];
