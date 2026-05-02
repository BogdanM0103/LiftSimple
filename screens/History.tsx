import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Workout } from '../data/types';

export default function History({ workouts }: { workouts: Workout[] }) {
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
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardDate}>
                  {item.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <Text style={styles.cardExercises}>
                {item.exercises.map(e => e.name).join(' · ')}
              </Text>
            </View>
          )}
        />
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
});
