import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Workout } from '../data/types';

type Mode = 'volume' | 'maxWeight';

function getWorkoutNames(workouts: Workout[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const w of workouts) {
    if (!seen.has(w.name)) {
      const hasData = w.exercises.some(e => (w.sets?.[e.name] ?? []).some(s => s.kg || s.reps));
      if (hasData) {
        seen.add(w.name);
        result.push(w.name);
      }
    }
  }
  return result;
}

function getExercisesForWorkout(workouts: Workout[], workoutName: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const w of workouts.filter(w => w.name === workoutName)) {
    for (const e of w.exercises) {
      if (!seen.has(e.name)) {
        const sets = w.sets?.[e.name] ?? [];
        if (sets.some(s => s.kg || s.reps)) {
          seen.add(e.name);
          result.push(e.name);
        }
      }
    }
  }
  return result;
}

function getExerciseData(workouts: Workout[], workoutName: string, exerciseName: string, mode: Mode) {
  return workouts
    .filter(w => w.name === workoutName && w.exercises.find(e => e.name === exerciseName))
    .map(w => {
      const sets = w.sets?.[exerciseName] ?? [];
      const value = mode === 'volume'
        ? sets.reduce((sum, s) => sum + (parseFloat(s.kg) || 0) * (parseInt(s.reps) || 0), 0)
        : sets.reduce((max, s) => Math.max(max, parseFloat(s.kg) || 0), 0);
      return { date: w.date, value };
    })
    .filter(d => d.value > 0)
    .reverse();
}

function BarChart({ data, mode }: { data: { date: Date; value: number }[]; mode: Mode }) {
  if (data.length === 0) {
    return <Text style={styles.noData}>No data logged yet</Text>;
  }

  const max = Math.max(...data.map(d => d.value));
  const latest = data[data.length - 1];
  const best = data.reduce((a, b) => (a.value >= b.value ? a : b));
  const prev = data.length >= 2 ? data[data.length - 2] : null;
  const change = prev && prev.value > 0
    ? Math.round(((latest.value - prev.value) / prev.value) * 100)
    : null;

  const BAR_W = 40;
  const CHART_H = 120;

  return (
    <View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Latest</Text>
          <Text style={styles.summaryValue}>{latest.value.toFixed(0)} kg</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Best</Text>
          <Text style={styles.summaryValue}>{best.value.toFixed(0)} kg</Text>
        </View>
        {change !== null && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>vs Prev</Text>
            <Text style={[styles.summaryValue, change >= 0 ? styles.green : styles.red]}>
              {change >= 0 ? `+${change}%` : `${change}%`}
            </Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.chart, { height: CHART_H + 36 }]}>
          {data.map((d, i) => {
            const barH = max > 0 ? Math.max(4, (d.value / max) * CHART_H) : 4;
            const isLatest = i === data.length - 1;
            return (
              <View key={i} style={[styles.barWrapper, { width: BAR_W }]}>
                <View style={[styles.barContainer, { height: CHART_H }]}>
                  <View style={[styles.bar, { height: barH }, isLatest && styles.barActive]} />
                </View>
                <Text style={styles.barLabel}>
                  {d.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export default function Stats({ workouts }: { workouts: Workout[] }) {
  const [mode, setMode] = useState<Mode>('volume');
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const workoutNames = useMemo(() => getWorkoutNames(workouts), [workouts]);

  const exercises = useMemo(
    () => (selectedWorkout ? getExercisesForWorkout(workouts, selectedWorkout) : []),
    [workouts, selectedWorkout],
  );

  const chartData = useMemo(
    () => (selectedWorkout && selectedExercise
      ? getExerciseData(workouts, selectedWorkout, selectedExercise, mode)
      : []),
    [workouts, selectedWorkout, selectedExercise, mode],
  );

  function selectWorkout(name: string) {
    if (name === selectedWorkout) {
      setSelectedWorkout(null);
      setSelectedExercise(null);
    } else {
      setSelectedWorkout(name);
      setSelectedExercise(null);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Statistics</Text>

      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'volume' && styles.toggleActive]}
          onPress={() => setMode('volume')}
        >
          <Text style={[styles.toggleText, mode === 'volume' && styles.toggleTextActive]}>Volume</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'maxWeight' && styles.toggleActive]}
          onPress={() => setMode('maxWeight')}
        >
          <Text style={[styles.toggleText, mode === 'maxWeight' && styles.toggleTextActive]}>Max Weight</Text>
        </TouchableOpacity>
      </View>

      {workoutNames.length === 0 ? (
        <Text style={styles.empty}>Log some workouts to see stats</Text>
      ) : (
        <>
          <Text style={styles.sectionLabel}>Workout</Text>
          <View style={styles.chipList}>
            {workoutNames.map(name => (
              <TouchableOpacity
                key={name}
                style={[styles.chip, selectedWorkout === name && styles.chipActive]}
                onPress={() => selectWorkout(name)}
              >
                <Text style={[styles.chipText, selectedWorkout === name && styles.chipTextActive]}>
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedWorkout && (
            <>
              <Text style={styles.sectionLabel}>Exercise</Text>
              <View style={styles.chipList}>
                {exercises.map(name => (
                  <TouchableOpacity
                    key={name}
                    style={[styles.chip, selectedExercise === name && styles.chipActive]}
                    onPress={() => setSelectedExercise(selectedExercise === name ? null : name)}
                  >
                    <Text style={[styles.chipText, selectedExercise === name && styles.chipTextActive]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {selectedWorkout && selectedExercise && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>{selectedExercise}</Text>
              <Text style={styles.chartSubtitle}>
                {mode === 'volume' ? 'Total volume per session (sets × reps × kg)' : 'Heaviest set per session'}
              </Text>
              <BarChart data={chartData} mode={mode} />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  toggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginBottom: 28,
    overflow: 'hidden',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  toggleActive: {
    backgroundColor: '#000',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  toggleTextActive: {
    color: '#fff',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  chartSection: {
    marginTop: 4,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  green: {
    color: '#22c55e',
  },
  red: {
    color: '#ef4444',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 0,
  },
  barWrapper: {
    alignItems: 'center',
  },
  barContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: 24,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
  },
  barActive: {
    backgroundColor: '#000',
  },
  barLabel: {
    fontSize: 9,
    color: '#aaa',
    marginTop: 6,
    textAlign: 'center',
  },
  noData: {
    color: '#bbb',
    fontSize: 14,
    marginTop: 8,
  },
  empty: {
    color: '#aaa',
    fontSize: 15,
    marginTop: 40,
    textAlign: 'center',
  },
});
