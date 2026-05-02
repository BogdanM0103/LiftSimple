import { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Modal, Animated, TextInput, FlatList, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { exercises, Exercise } from '../data/exercises';
import { Workout } from '../data/types';

const MUSCLES = ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps', 'Legs'];

function WorkoutExerciseItem({ exercise, onRemove }: { exercise: Exercise; onRemove: () => void }) {
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
      <View>
        <Text style={styles.workoutExerciseName}>{exercise.name}</Text>
        <Text style={styles.workoutExerciseMuscle}>{exercise.muscle}</Text>
      </View>
      <TouchableOpacity onPress={handleRemove}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function StartWorkout({ onWorkoutComplete }: { onWorkoutComplete: (workout: Workout) => void }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const [workoutName, setWorkoutName] = useState('Workout');
  const [isEditingName, setIsEditingName] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

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
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  }

  function closeExerciseModal() {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setExerciseModalVisible(false));
  }

  function addExercise(exercise: Exercise) {
    if (!workoutExercises.find(e => e.name === exercise.name)) {
      setWorkoutExercises(prev => [...prev, exercise]);
    }
    closeExerciseModal();
  }

  function confirmWorkout() {
    onWorkoutComplete({
      id: Date.now().toString(),
      name: workoutName,
      exercises: workoutExercises,
      date: new Date(),
    });
    setModalVisible(false);
    setWorkoutExercises([]);
    setWorkoutName('Workout');
    setIsEditingName(false);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
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
              onRemove={() => setWorkoutExercises(prev => prev.filter(e => e.name !== exercise.name))}
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

        <Modal
          visible={exerciseModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeExerciseModal}
        >
          <TouchableWithoutFeedback onPress={closeExerciseModal}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                  <Text style={styles.cardTitle}>Add Exercise</Text>
                  <TextInput
                    style={styles.searchBar}
                    placeholder="Search exercises..."
                    placeholderTextColor="#999"
                    autoFocus
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
  removeText: {
    fontSize: 18,
    color: '#999',
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
});
