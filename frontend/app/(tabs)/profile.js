import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Button,
  Divider,
  List,
  Badge,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { useIdeas } from '../../context/IdeaContext';
import { theme, spacing } from '../../utils/theme';

const ACHIEVEMENT_BADGES = [
  {
    id: 'first_idea',
    title: 'First Idea',
    description: 'Submitted your first Kaizen idea',
    icon: 'lightbulb',
    color: theme.colors.tertiary,
    condition: (userIdeas) => userIdeas.length >= 1,
  },
  {
    id: 'five_ideas',
    title: 'Idea Generator',
    description: 'Submitted 5 improvement ideas',
    icon: 'auto-awesome',
    color: theme.colors.secondary,
    condition: (userIdeas) => userIdeas.length >= 5,
  },
  {
    id: 'ten_ideas',
    title: 'Innovation Champion',
    description: 'Submitted 10 improvement ideas',
    icon: 'emoji-events',
    color: theme.colors.primary,
    condition: (userIdeas) => userIdeas.length >= 10,
  },
  {
    id: 'first_approved',
    title: 'Approved Contributor',
    description: 'Had your first idea approved',
    icon: 'check-circle',
    color: theme.colors.success,
    condition: (userIdeas) => userIdeas.some(idea => idea.status === 'approved'),
  },
  {
    id: 'first_implemented',
    title: 'Change Maker',
    description: 'Had your first idea implemented',
    icon: 'build',
    color: '#FF6F00',
    condition: (userIdeas) => userIdeas.some(idea => idea.status === 'implementing'),
  },
];

export default function ProfileScreen() {
  const { user, logout } = useUser();
  const { ideas } = useIdeas();

  if (!user) return null;

  const userIdeas = ideas.filter(idea => idea.submittedBy === user.employeeNumber);
  const approvedIdeas = userIdeas.filter(idea => idea.status === 'approved');
  const implementedIdeas = userIdeas.filter(idea => idea.status === 'implementing');
  
  const earnedBadges = ACHIEVEMENT_BADGES.filter(badge => badge.condition(userIdeas));
  
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const formatJoinDate = () => {
    // Mock join date for demo
    const joinDate = new Date();
    joinDate.setMonth(joinDate.getMonth() - 6);
    return joinDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text 
              size={80} 
              label={user.name.split(' ').map(n => n[0]).join('')}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {user.name}
              </Text>
              <Text variant="titleMedium" style={styles.userDesignation}>
                {user.designation}
              </Text>
              <Text variant="bodyMedium" style={styles.userDepartment}>
                {user.department} Department
              </Text>
              <Text variant="bodySmall" style={styles.userEmail}>
                {user.email}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Your Impact
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Surface style={[styles.statIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                  <MaterialIcons name="lightbulb" size={24} color={theme.colors.primary} />
                </Surface>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {userIdeas.length}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Ideas Submitted
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Surface style={[styles.statIcon, { backgroundColor: theme.colors.successContainer }]}>
                  <MaterialIcons name="check-circle" size={24} color={theme.colors.success} />
                </Surface>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {approvedIdeas.length}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Approved
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Surface style={[styles.statIcon, { backgroundColor: theme.colors.tertiaryContainer }]}>
                  <MaterialIcons name="build" size={24} color={theme.colors.tertiary} />
                </Surface>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  {implementedIdeas.length}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Implemented
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Achievements */}
        <Card style={styles.achievementsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Achievements
            </Text>
            {earnedBadges.length > 0 ? (
              <View style={styles.badgeGrid}>
                {earnedBadges.map((badge) => (
                  <Surface key={badge.id} style={[styles.badge, { backgroundColor: badge.color + '20' }]}>
                    <MaterialIcons 
                      name={badge.icon} 
                      size={32} 
                      color={badge.color} 
                      style={styles.badgeIcon}
                    />
                    <Text variant="titleSmall" style={styles.badgeTitle}>
                      {badge.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.badgeDescription}>
                      {badge.description}
                    </Text>
                  </Surface>
                ))}
              </View>
            ) : (
              <View style={styles.noBadges}>
                <MaterialIcons name="emoji-events" size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyLarge" style={styles.noBadgesText}>
                  Start submitting ideas to earn achievement badges!
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Profile Details */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Profile Details
            </Text>
            
            <List.Item
              title="Employee Number"
              description={user.employeeNumber}
              left={props => <List.Icon {...props} icon="badge" />}
            />
            <Divider />
            
            <List.Item
              title="Role"
              description={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              left={props => <List.Icon {...props} icon="account-circle" />}
            />
            <Divider />
            
            <List.Item
              title="Member Since"
              description={formatJoinDate()}
              left={props => <List.Icon {...props} icon="calendar-today" />}
            />
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Settings
            </Text>
            
            <List.Item
              title="Notifications"
              description="Manage your notification preferences"
              left={props => <List.Icon {...props} icon="notifications" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available in the next update.')}
            />
            <Divider />
            
            <List.Item
              title="Privacy"
              description="Privacy and data settings"
              left={props => <List.Icon {...props} icon="privacy-tip" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available in the next update.')}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
          textColor={theme.colors.error}
        >
          Sign Out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    paddingBottom: spacing.xl,
  },
  profileCard: {
    margin: spacing.lg,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginBottom: spacing.md,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
  },
  userDesignation: {
    color: theme.colors.primary,
    marginBottom: spacing.xs,
  },
  userDepartment: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  userEmail: {
    color: theme.colors.onSurfaceVariant,
  },
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: theme.colors.onSurface,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    elevation: 2,
  },
  statNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
  },
  achievementsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badge: {
    width: '48%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  badgeIcon: {
    marginBottom: spacing.sm,
  },
  badgeTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  badgeDescription: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
  },
  noBadges: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  noBadgesText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.md,
  },
  detailsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  settingsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderColor: theme.colors.error,
  },
});