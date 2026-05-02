import { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Modal, Animated, TextInput, StyleSheet, TouchableWithoutFeedback } from 'react-native';

export default function StartWorkout() {
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  function openExerciseModal() {
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
                  />
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
    marginBottom: 32,
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
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
    width: '80%',
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
});
