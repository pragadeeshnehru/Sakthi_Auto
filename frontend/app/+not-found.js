import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme, spacing } from '../utils/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <MaterialIcons 
          name="error-outline" 
          size={64} 
          color={theme.colors.onSurfaceVariant} 
        />
        <Text variant="headlineMedium" style={styles.title}>
          Page Not Found
        </Text>
        <Text variant="bodyLarge" style={styles.text}>
          This screen doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Button mode="contained" style={styles.button}>
            Go to Home
          </Button>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: theme.colors.onSurface,
  },
  text: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: theme.colors.onSurfaceVariant,
  },
  button: {
    marginTop: spacing.md,
  },
});