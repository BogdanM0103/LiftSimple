import { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Modal, Animated, TextInput, FlatList, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { exercises, Exercise } from '../data/exercises';
import { Workout } from '../data/types';
import { totalWeightLifted, formatWeight } from '../data/utils';

const MUSCLES = ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps', 'Legs'];

function WorkoutExerciseItem({ exercise, onRemove, onPress, setCount }: {
  exercise: Exercise;
  onRemove: () => void;
  onPress: () => void;
  setCount: number;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  function handleRemove() {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 40, duration: 250, useNativeDriver: true }),
    ]).start(onRemove);
  }

  return (
    <Animated.View style={[styles.workoutExerciseItem, { opacity, transform: [{ translateX }] }]}>
      <TouchableOpacity style={styles.exerciseItemLeft} onPress={onPress}>
        <Text style={styles.workoutExerciseName}>{exercise.name}</Text>
        <Text style={styles.workoutExerciseMuscle}>
          {exercise.muscle}{setCount > 0 ? `  ·  ${setCount} set${setCount > 1 ? 's' : ''}` : ''}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRemove}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function StartWorkout({ onWorkoutComplete, onWorkoutUpdate, lastWorkout }: {
  onWorkoutComplete: (workout: Workout) => void;
  onWorkoutUpdate: (workout: Workout) => void;
  lastWorkout: Workout | null;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [setsModalExercise, setSetsModalExercise] = useState<Exercise | null>(null);
  const [query, setQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const [exerciseSets, setExerciseSets] = useState<Record<string, { reps: string; kg: string }[]>>({});
  const [workoutName, setWorkoutName] = useState('Workout');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const setsScaleAnim = useRef(new Animated.Value(0)).current;

  const results = exercises.filter(e => {
    const matchesQuery = query.trim() === '' || e.name.toLowerCase().includes(query.toLowerCase());
    const matchesMuscle = selectedMuscle === null || e.muscle === selectedMuscle;
    return matchesQuery && matchesMuscle;
  });

  function openExerciseModal() {
    setQuery('');
    setSelectedMuscle(null);
    setExerciseModalVisible(true);
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 6 }).start();
  }

  function closeExerciseModal() {
    Animated.timing(scaleAnim, { toValue: 0, duration: 150, useNativeDriver: true })
      .start(() => setExerciseModalVisible(false));
  }

  function addExercise(exercise: Exercise) {
    if (!workoutExercises.find(e => e.name === exercise.name)) {
      setWorkoutExercises(prev => [...prev, exercise]);
    }
    closeExerciseModal();
  }

  function openSetsModal(exercise: Exercise) {
    setSetsModalExercise(exercise);
    setsScaleAnim.setValue(0);
    Animated.spring(setsScaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 6 }).start();
  }

  function closeSetsModal() {
    Animated.timing(setsScaleAnim, { toValue: 0, duration: 150, useNativeDriver: true })
      .start(() => setSetsModalExercise(null));
  }

  function addSet(exerciseName: string) {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseName]: [...(prev[exerciseName] ?? []), { reps: '', kg: '' }],
    }));
  }

  function updateSet(exerciseName: string, index: number, field: 'reps' | 'kg', value: string) {
    setExerciseSets(prev => {
      const sets = [...(prev[exerciseName] ?? [])];
      sets[index] = { ...sets[index], [field]: value };
      return { ...prev, [exerciseName]: sets };
    });
  }

  function openWorkoutForEdit(workout: Workout) {
    setWorkoutName(workout.name);
    setWorkoutExercises(workout.exercises);
    setExerciseSets(workout.sets ?? {});
    setEditingId(workout.id);
    setEditingDate(workout.date);
    setModalVisible(true);
  }

  function confirmWorkout() {
    const workout: Workout = {
      id: editingId ?? Date.now().toString(),
      name: workoutName,
      exercises: workoutExercises,
      sets: exerciseSets,
      date: editingDate ?? new Date(),
    };
    if (editingId) {
      onWorkoutUpdate(workout);
    } else {
      onWorkoutComplete(workout);
    }
    setModalVisible(false);
    setWorkoutExercises([]);
    setExerciseSets({});
    setWorkoutName('Workout');
    setIsEditingName(false);
    setEditingId(null);
    setEditingDate(null);
  }

  const currentSets = setsModalExercise ? (exerciseSets[setsModalExercise.name] ?? []) : [];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>

      {lastWorkout && (
        <TouchableOpacity style={styles.lastWorkoutCard} onPress={() => openWorkoutForEdit(lastWorkout)}>
          <View style={styles.lastWorkoutHeader}>
            <Text style={styles.lastWorkoutLabel}>Last workout</Text>
            <Text style={styles.lastWorkoutDate}>
              {lastWorkout.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <Text style={styles.lastWorkoutName}>{lastWorkout.name}</Text>
          <Text style={styles.lastWorkoutExercises}>
            {lastWorkout.exercises.map(e => e.name).join(' · ')}
          </Text>
          <Text style={styles.lastWorkoutWeight}>
            {formatWeight(totalWeightLifted(lastWorkout))} lifted
          </Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <View style={styles.titleButtons}>
              <TouchableOpacity onPress={() => setIsEditingName(!isEditingName)} style={styles.editButton}>
                <Text style={styles.editButtonText}>{isEditingName ? '✓' : '✎'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalTitle}
              value={workoutName}
              onChangeText={setWorkoutName}
              editable={isEditingName}
              selectTextOnFocus
            />
          </View>

          {workoutExercises.map(exercise => (
            <WorkoutExerciseItem
              key={exercise.name}
              exercise={exercise}
              onPress={() => openSetsModal(exercise)}
              setCount={(exerciseSets[exercise.name] ?? []).length}
              onRemove={() => {
                setWorkoutExercises(prev => prev.filter(e => e.name !== exercise.name));
                setExerciseSets(prev => { const next = { ...prev }; delete next[exercise.name]; return next; });
              }}
            />
          ))}

          <TouchableOpacity style={styles.addButton} onPress={openExerciseModal}>
            <Text style={styles.addButtonText}>Add exercise</Text>
          </TouchableOpacity>

          {workoutExercises.length > 0 && (
            <TouchableOpacity style={styles.confirmWorkoutButton} onPress={confirmWorkout}>
              <Text style={styles.confirmWorkoutText}>Confirm Workout</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Exercise picker modal */}
        <Modal visible={exerciseModalVisible} transparent animationType="none" onRequestClose={closeExerciseModal}>
          <TouchableWithoutFeedback onPress={closeExerciseModal}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                  <Text style={styles.cardTitle}>Add Exercise</Text>
                  <TextInput
                    style={styles.searchBar}
                    placeholder="Search exercises..."
                    placeholderTextColor="#999"
                    value={query}
                    onChangeText={setQuery}
                  />
                  <View style={styles.filterRow}>
                    {MUSCLES.map(muscle => (
                      <TouchableOpacity
                        key={muscle}
                        style={[styles.filterChip, selectedMuscle === muscle && styles.filterChipActive]}
                        onPress={() => setSelectedMuscle(selectedMuscle === muscle ? null : muscle)}
                      >
                        <Text style={[styles.filterChipText, selectedMuscle === muscle && styles.filterChipTextActive]}>
                          {muscle}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {results.length > 0 && (
                    <FlatList
                      data={results}
                      keyExtractor={item => item.name}
                      style={styles.resultsList}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => (
                        <View style={styles.resultItem}>
                          <View>
                            <Text style={styles.resultName}>{item.name}</Text>
                            <Text style={styles.resultMuscle}>{item.muscle}</Text>
                          </View>
                          <TouchableOpacity style={styles.addExerciseButton} onPress={() => addExercise(item)}>
                            <Text style={styles.addExerciseButtonText}>Add</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  )}
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Sets modal */}
        <Modal visible={setsModalExercise !== null} transparent animationType="none" onRequestClose={closeSetsModal}>
          <TouchableWithoutFeedback onPress={closeSetsModal}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                <Animated.View style={[styles.setsCard, { transform: [{ scale: setsScaleAnim }] }]}>
                  <Text style={styles.setsCardTitle}>{setsModalExercise?.name}</Text>
                  <Text style={styles.setsCardMuscle}>{setsModalExercise?.muscle}</Text>

                  <View style={styles.setsDivider} />

                  <ScrollView style={styles.setsList} keyboardShouldPersistTaps="handled">
                    {currentSets.length === 0 && (
                      <Text style={styles.setsEmptyText}>No sets yet — tap below to add one</Text>
                    )}
                    {currentSets.map((set, index) => (
                      <View key={index} style={styles.setRow}>
                        <Text style={styles.setLabel}>Set {index + 1}</Text>
                        <View style={styles.setInputWrapper}>
                          <TextInput
                            style={styles.setInput}
                            value={set.kg}
                            onChangeText={val => updateSet(setsModalExercise!.name, index, 'kg', val)}
                            keyboardType="decimal-pad"
                            placeholder="0"
                            placeholderTextColor="#ccc"
                          />
                          <Text style={styles.setInputUnit}>kg</Text>
                          <TextInput
                            style={styles.setInput}
                            value={set.reps}
                            onChangeText={val => updateSet(setsModalExercise!.name, index, 'reps', val)}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor="#ccc"
                          />
                          <Text style={styles.setInputUnit}>reps</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(setsModalExercise!.name)}>
                    <Text style={styles.addSetButtonText}>+ Add Set</Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modal: {
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  titleButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  editButton: {
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 20,
    color: '#aaa',
  },
  workoutExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 4,
  },
  exerciseItemLeft: {
    flex: 1,
  },
  removeText: {
    fontSize: 18,
    color: '#999',
    paddingLeft: 16,
  },
  confirmWorkoutButton: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: '#000',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmWorkoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  workoutExerciseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  workoutExerciseMuscle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastWorkoutCard: {
    marginTop: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
  },
  lastWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  lastWorkoutLabel: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lastWorkoutDate: {
    fontSize: 12,
    color: '#aaa',
  },
  lastWorkoutName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  lastWorkoutExercises: {
    fontSize: 13,
    color: '#555',
  },
  lastWorkoutWeight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginTop: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 4,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterChipText: {
    fontSize: 13,
    color: '#555',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsList: {
    marginTop: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addExerciseButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  addExerciseButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
  },
  resultMuscle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  setsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '65%',
  },
  setsCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  setsCardMuscle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  setsDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  setsList: {
    maxHeight: 220,
  },
  setsEmptyText: {
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  setLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  setInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 15,
    color: '#000',
    width: 64,
    textAlign: 'center',
  },
  setInputUnit: {
    fontSize: 13,
    color: '#888',
  },
  addSetButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addSetButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
