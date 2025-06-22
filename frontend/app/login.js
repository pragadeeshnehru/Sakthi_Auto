import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { theme, spacing } from '../utils/theme';

export default function LoginScreen() {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();

  const handleLogin = async () => {
    if (!employeeNumber || !otp) {
      Alert.alert('Error', 'Please enter both Employee Number and OTP');
      return;
    }

    setLoading(true);
    const success = await login(employeeNumber, otp);
    setLoading(false);

    if (!success) {
      Alert.alert('Error', 'Invalid credentials. Try:\n• Employee: 12345, 67890, or 11111\n• OTP: 1234');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Title style={styles.title}>Kaizen Ideas</Title>
              <Paragraph style={styles.subtitle}>
                Continuous Improvement Platform
              </Paragraph>
            </View>

            <Card style={styles.card}>
              <Card.Content>
                <Text variant="headlineSmall" style={styles.cardTitle}>
                  Sign In
                </Text>
                
                <TextInput
                  label="Employee Number"
                  value={employeeNumber}
                  onChangeText={setEmployeeNumber}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                />

                <TextInput
                  label="OTP"
                  value={otp}
                  onChangeText={setOtp}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  secureTextEntry
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.button}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : 'Sign In'}
                </Button>

                <View style={styles.demoInfo}>
                  <Text variant="bodySmall" style={styles.demoTitle}>
                    Demo Credentials:
                  </Text>
                  <Text variant="bodySmall" style={styles.demoText}>
                    Employee: 12345 (Employee), 67890 (Reviewer), 11111 (Admin)
                  </Text>
                  <Text variant="bodySmall" style={styles.demoText}>
                    OTP: 1234
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  card: {
    elevation: 4,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: theme.colors.onSurface,
  },
  input: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  demoInfo: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  demoTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: theme.colors.onSurfaceVariant,
  },
  demoText: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },
});