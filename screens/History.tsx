import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Workout } from '../data/types';
import { totalWeightLifted, formatWeight } from '../data/utils';

function exerciseVolume(workout: Workout, exerciseName: string): number {
  const sets = workout.sets?.[exerciseName] ?? [];
  return sets.reduce((sum, s) => sum + (parseFloat(s.kg) || 0) * (parseInt(s.reps) || 0), 0);
}

function previousVolume(workouts: Workout[], currentId: string, exerciseName: string): number | null {
  const idx = workouts.findIndex(w => w.id === currentId);
  for (let i = idx + 1; i < workouts.length; i++) {
    if (workouts[i].exercises.find(e => e.name === exerciseName)) {
      return exerciseVolume(workouts[i], exerciseName);
    }
  }
  return null;
}

function WorkoutDetailModal({ workout, workouts, onClose }: { workout: Workout; workouts: Workout[]; onClose: () => void }) {
  const total = totalWeightLifted(workout);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.detail}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.detailName}>{workout.name}</Text>
        <Text style={styles.detailDate}>
          {workout.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <Text style={styles.detailTotal}>{formatWeight(total)} total lifted</Text>

        <View style={styles.divider} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {workout.exercises.map(exercise => {
            const sets = workout.sets?.[exercise.name] ?? [];
            const exerciseTotal = sets.reduce((sum, s) => sum + (parseFloat(s.kg) || 0) * (parseInt(s.reps) || 0), 0);
            const prev = previousVolume(workouts, workout.id, exercise.name);
            const pct = prev !== null && prev > 0 && exerciseTotal > 0
              ? Math.round(((exerciseTotal - prev) / prev) * 100)
              : null;

            return (
              <View key={exercise.name} style={styles.exerciseBlock}>
                <View style={styles.exerciseBlockHeader}>
                  <View>
                    <Text style={styles.exerciseBlockName}>{exercise.name}</Text>
                    <Text style={styles.exerciseBlockMuscle}>{exercise.muscle}</Text>
                  </View>
                  <View style={styles.exerciseBlockRight}>
                    {pct !== null && (
                      <Text style={[styles.exercisePct, pct >= 0 ? styles.pctGreen : styles.pctRed]}>
                        {pct >= 0 ? `+${pct}%` : `${pct}%`}
                      </Text>
                    )}
                    {exerciseTotal > 0 && (
                      <Text style={styles.exerciseBlockTotal}>{formatWeight(exerciseTotal)}</Text>
                    )}
                  </View>
                </View>

                {sets.length === 0 ? (
                  <Text style={styles.noSets}>No sets logged</Text>
                ) : (
                  <>
                    <View style={styles.setsHeader}>
                      <Text style={styles.setsHeaderText}>Set</Text>
                      <Text style={styles.setsHeaderText}>Weight</Text>
                      <Text style={styles.setsHeaderText}>Reps</Text>
                    </View>
                    {sets.map((set, i) => (
                      <View key={i} style={styles.setRow}>
                        <Text style={styles.setIndex}>{i + 1}</Text>
                        <Text style={styles.setVal}>{set.kg ? `${set.kg} kg` : '—'}</Text>
                        <Text style={styles.setVal}>{set.reps ? `${set.reps}` : '—'}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function History({ workouts }: { workouts: Workout[] }) {
  const [selected, setSelected] = useState<Workout | null>(null);

  return (
    <View style={styles.container}>
      {workouts.length === 0 ? (
        <Text style={styles.empty}>No workouts yet</Text>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={w => w.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardDate}>
                  {item.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <Text style={styles.cardExercises}>
                {item.exercises.map(e => e.name).join(' · ')}
              </Text>
              <Text style={styles.cardWeight}>
                {formatWeight(totalWeightLifted(item))} lifted
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {selected && (
        <WorkoutDetailModal workout={selected} workouts={workouts} onClose={() => setSelected(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  empty: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#aaa',
    fontSize: 16,
  },
  list: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDate: {
    fontSize: 13,
    color: '#888',
  },
  cardExercises: {
    fontSize: 13,
    color: '#555',
  },
  cardWeight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginTop: 6,
  },
  detail: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeText: {
    fontSize: 22,
    color: '#000',
  },
  detailName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  detailDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  detailTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
  },
  exerciseBlock: {
    marginBottom: 24,
  },
  exerciseBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  exerciseBlockName: {
    fontSize: 16,
    fontWeight: '700',
  },
  exerciseBlockMuscle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  exerciseBlockRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  exercisePct: {
    fontSize: 13,
    fontWeight: '700',
  },
  pctGreen: {
    color: '#22c55e',
  },
  pctRed: {
    color: '#ef4444',
  },
  exerciseBlockTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  noSets: {
    fontSize: 13,
    color: '#bbb',
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  setsHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  setIndex: {
    flex: 1,
    fontSize: 14,
    color: '#888',
  },
  setVal: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});
