import { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Modal, Animated, TextInput, FlatList, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { exercises, Exercise } from '../data/exercises';

export default function StartWorkout() {
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const results = query.trim()
    ? exercises.filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  function openExerciseModal() {
    setQuery('');
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
          <Text style={styles.modalTitle}>Workout</Text>

          {workoutExercises.map(exercise => (
            <View key={exercise.name} style={styles.workoutExerciseItem}>
              <Text style={styles.workoutExerciseName}>{exercise.name}</Text>
              <Text style={styles.workoutExerciseMuscle}>{exercise.muscle}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={openExerciseModal}>
            <Text style={styles.addButtonText}>Add exercise</Text>
          </TouchableOpacity>
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
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 24,
  },
  workoutExerciseItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 4,
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
