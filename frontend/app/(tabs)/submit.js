import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ProgressBar,
  RadioButton,
  Chip,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { useIdeas } from '../../context/IdeaContext';
import { theme, spacing } from '../../utils/theme';

const STEPS = [
  'Basic Info',
  'Problem & Solution',
  'Benefits',
  'Images',
  'Review',
];

const BENEFIT_OPTIONS = [
  { value: 'cost_saving', label: 'Cost Saving' },
  { value: 'safety', label: 'Safety' },
  { value: 'quality', label: 'Quality' },
  { value: 'productivity', label: 'Productivity' },
];

export default function SubmitIdeaScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { submitIdea } = useIdeas();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    improvement: '',
    benefit: '',
    estimatedSavings: '',
    images: [],
    department: user?.department || '',
    submittedBy: user?.employeeNumber || '',
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.title.trim()) {
          Alert.alert('Validation Error', 'Please enter a title for your idea');
          return false;
        }
        return true;
      case 1:
        if (!formData.problem.trim() || !formData.improvement.trim()) {
          Alert.alert('Validation Error', 'Please fill in both problem and improvement fields');
          return false;
        }
        return true;
      case 2:
        if (!formData.benefit) {
          Alert.alert('Validation Error', 'Please select an expected benefit');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Image picker is not available in web preview');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      updateFormData('images', [...formData.images, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitIdea(formData);
      Alert.alert(
        'Success!', 
        'Your idea has been submitted successfully and is now under review.',
        [{ text: 'OK', onPress: () => router.push('tracker') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Basic Information
            </Text>
            <TextInput
              label="Idea Title *"
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              mode="outlined"
              style={styles.input}
              placeholder="Enter a clear, descriptive title"
            />
            <TextInput
              label="Department"
              value={formData.department}
              mode="outlined"
              style={styles.input}
              disabled
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Problem & Solution
            </Text>
            <TextInput
              label="Problem Identified *"
              value={formData.problem}
              onChangeText={(text) => updateFormData('problem', text)}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Describe the current problem or inefficiency"
            />
            <TextInput
              label="Suggested Improvement *"
              value={formData.improvement}
              onChangeText={(text) => updateFormData('improvement', text)}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Describe your proposed solution"
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Expected Benefits
            </Text>
            <Text variant="bodyMedium" style={styles.sectionSubtitle}>
              Select the primary benefit category:
            </Text>
            <RadioButton.Group
              onValueChange={(value) => updateFormData('benefit', value)}
              value={formData.benefit}
            >
              {BENEFIT_OPTIONS.map((option) => (
                <View key={option.value} style={styles.radioOption}>
                  <RadioButton value={option.value} />
                  <Text variant="bodyLarge" style={styles.radioLabel}>
                    {option.label}
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
            
            <TextInput
              label="Estimated Savings (Optional)"
              value={formData.estimatedSavings}
              onChangeText={(text) => updateFormData('estimatedSavings', text)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              placeholder="Enter amount in your local currency"
              left={<TextInput.Icon icon="currency-usd" />}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Supporting Images
            </Text>
            <Text variant="bodyMedium" style={styles.sectionSubtitle}>
              Add before/after photos or diagrams (optional)
            </Text>
            
            <Button
              mode="outlined"
              onPress={pickImage}
              style={styles.imageButton}
              icon="camera"
            >
              Add Image
            </Button>

            {formData.images.length > 0 && (
              <View style={styles.imageContainer}>
                {formData.images.map((uri, index) => (
                  <Surface key={index} style={styles.imageItem}>
                    <Text variant="bodySmall" style={styles.imageText}>
                      Image {index + 1}
                    </Text>
                    <Button
                      mode="text"
                      onPress={() => removeImage(index)}
                      textColor={theme.colors.error}
                    >
                      Remove
                    </Button>
                  </Surface>
                ))}
              </View>
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Review & Submit
            </Text>
            
            <Card style={styles.reviewCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.reviewTitle}>
                  {formData.title}
                </Text>
                
                <View style={styles.reviewSection}>
                  <Text variant="labelLarge" style={styles.reviewLabel}>
                    Problem:
                  </Text>
                  <Text variant="bodyMedium">{formData.problem}</Text>
                </View>
                
                <View style={styles.reviewSection}>
                  <Text variant="labelLarge" style={styles.reviewLabel}>
                    Solution:
                  </Text>
                  <Text variant="bodyMedium">{formData.improvement}</Text>
                </View>
                
                <View style={styles.reviewSection}>
                  <Text variant="labelLarge" style={styles.reviewLabel}>
                    Benefit Category:
                  </Text>
                  <Chip mode="outlined" style={styles.benefitChip}>
                    {BENEFIT_OPTIONS.find(opt => opt.value === formData.benefit)?.label}
                  </Chip>
                </View>
                
                {formData.estimatedSavings && (
                  <View style={styles.reviewSection}>
                    <Text variant="labelLarge" style={styles.reviewLabel}>
                      Estimated Savings:
                    </Text>
                    <Text variant="bodyMedium">${formData.estimatedSavings}</Text>
                  </View>
                )}
                
                <View style={styles.reviewSection}>
                  <Text variant="labelLarge" style={styles.reviewLabel}>
                    Images:
                  </Text>
                  <Text variant="bodyMedium">
                    {formData.images.length} image(s) attached
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Submit Idea
        </Text>
        <ProgressBar 
          progress={(currentStep + 1) / STEPS.length} 
          style={styles.progressBar}
        />
        <Text variant="bodySmall" style={styles.stepIndicator}>
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.navigation}>
        <Button
          mode="outlined"
          onPress={prevStep}
          disabled={currentStep === 0}
          style={[styles.navButton, styles.prevButton]}
        >
          Previous
        </Button>
        
        {currentStep === STEPS.length - 1 ? (
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={[styles.navButton, styles.submitButton]}
          >
            Submit Idea
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={nextStep}
            style={[styles.navButton, styles.nextButton]}
          >
            Next
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: theme.colors.onSurface,
  },
  progressBar: {
    marginBottom: spacing.sm,
    height: 6,
  },
  stepIndicator: {
    color: theme.colors.onSurfaceVariant,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: spacing.lg,
  },
  stepTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    color: theme.colors.onSurface,
  },
  sectionSubtitle: {
    marginBottom: spacing.md,
    color: theme.colors.onSurfaceVariant,
  },
  input: {
    marginBottom: spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  radioLabel: {
    marginLeft: spacing.sm,
  },
  imageButton: {
    marginBottom: spacing.md,
  },
  imageContainer: {
    marginTop: spacing.md,
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    elevation: 1,
  },
  imageText: {
    color: theme.colors.onSurface,
  },
  reviewCard: {
    elevation: 2,
  },
  reviewTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: theme.colors.primary,
  },
  reviewSection: {
    marginBottom: spacing.md,
  },
  reviewLabel: {
    marginBottom: spacing.xs,
    color: theme.colors.primary,
  },
  benefitChip: {
    alignSelf: 'flex-start',
  },
  navigation: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
    elevation: 2,
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
  },
  prevButton: {
    // Additional styles if needed
  },
  nextButton: {
    // Additional styles if needed
  },
  submitButton: {
    // Additional styles if needed
  },
});