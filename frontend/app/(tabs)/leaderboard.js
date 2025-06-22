import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Chip,
  SegmentedButtons,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { useIdeas } from '../../context/IdeaContext';
import { theme, spacing } from '../../utils/theme';

const MOCK_USERS = [
  { employeeNumber: '12345', name: 'John Doe', department: 'Engineering' },
  { employeeNumber: '67890', name: 'Jane Smith', department: 'Quality' },
  { employeeNumber: '11111', name: 'Admin User', department: 'Management' },
  { employeeNumber: '22222', name: 'Alice Johnson', department: 'Manufacturing' },
  { employeeNumber: '33333', name: 'Bob Wilson', department: 'Engineering' },
  { employeeNumber: '44444', name: 'Carol Brown', department: 'Quality' },
];

const MOCK_DEPARTMENTS = [
  'Engineering',
  'Quality', 
  'Manufacturing',
  'Management',
  'Administration',
];

export default function LeaderboardScreen() {
  const { user } = useUser();
  const { ideas } = useIdeas();
  const [viewMode, setViewMode] = useState('individual');

  // Calculate individual stats
  const getIndividualStats = () => {
    const userStats = MOCK_USERS.map(userData => {
      const userIdeas = ideas.filter(idea => idea.submittedBy === userData.employeeNumber);
      const approvedIdeas = userIdeas.filter(idea => idea.status === 'approved');
      const implementedIdeas = userIdeas.filter(idea => idea.status === 'implementing');
      
      // Add some mock variation to make leaderboard more interesting
      const mockBonus = parseInt(userData.employeeNumber) % 3;
      
      return {
        ...userData,
        totalIdeas: userIdeas.length + mockBonus,
        approvedIdeas: approvedIdeas.length + Math.floor(mockBonus / 2),
        implementedIdeas: implementedIdeas.length + Math.floor(mockBonus / 3),
        score: (approvedIdeas.length * 10) + (implementedIdeas.length * 20) + (userIdeas.length * 5) + (mockBonus * 15),
      };
    }).sort((a, b) => b.score - a.score);

    return userStats;
  };

  // Calculate department stats
  const getDepartmentStats = () => {
    const deptStats = MOCK_DEPARTMENTS.map(dept => {
      const deptUsers = MOCK_USERS.filter(u => u.department === dept);
      const deptIdeas = ideas.filter(idea => 
        deptUsers.some(u => u.employeeNumber === idea.submittedBy)
      );
      const approvedIdeas = deptIdeas.filter(idea => idea.status === 'approved');
      const implementedIdeas = deptIdeas.filter(idea => idea.status === 'implementing');
      
      // Add mock data for departments
      const mockMultiplier = dept.length % 3 + 1;
      
      return {
        department: dept,
        employeeCount: deptUsers.length,
        totalIdeas: deptIdeas.length + mockMultiplier,
        approvedIdeas: approvedIdeas.length + Math.floor(mockMultiplier / 2),
        implementedIdeas: implementedIdeas.length + Math.floor(mockMultiplier / 3),
        avgIdeasPerEmployee: Math.round(((deptIdeas.length + mockMultiplier) / deptUsers.length) * 10) / 10,
      };
    }).sort((a, b) => b.totalIdeas - a.totalIdeas);

    return deptStats;
  };

  const individualStats = getIndividualStats();
  const departmentStats = getDepartmentStats();
  const currentUserRank = individualStats.findIndex(stat => stat.employeeNumber === user?.employeeNumber) + 1;

  const renderIndividualRankItem = ({ item, index }) => {
    const isCurrentUser = item.employeeNumber === user?.employeeNumber;
    const rankColor = index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : theme.colors.onSurfaceVariant;
    
    return (
      <Card style={[
        styles.rankCard,
        isCurrentUser && styles.currentUserCard
      ]}>
        <Card.Content style={styles.rankContent}>
          <View style={styles.rankLeft}>
            <Surface style={[styles.rankBadge, { backgroundColor: rankColor }]}>
              <Text variant="titleMedium" style={styles.rankNumber}>
                {index + 1}
              </Text>
            </Surface>
            
            <Avatar.Text 
              size={40} 
              label={item.name.split(' ').map(n => n[0]).join('')}
              style={styles.userAvatar}
            />
            
            <View style={styles.userInfo}>
              <Text variant="titleMedium" style={[
                styles.userName,
                isCurrentUser && styles.currentUserText
              ]}>
                {item.name} {isCurrentUser && '(You)'}
              </Text>
              <Text variant="bodySmall" style={styles.userDepartment}>
                {item.department}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="titleSmall" style={styles.statNumber}>
                {item.totalIdeas}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Ideas
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleSmall" style={[styles.statNumber, { color: theme.colors.success }]}>
                {item.implementedIdeas}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Implemented
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderDepartmentRankItem = ({ item, index }) => (
    <Card style={styles.rankCard}>
      <Card.Content style={styles.rankContent}>
        <View style={styles.rankLeft}>
          <Surface style={[styles.rankBadge, { 
            backgroundColor: index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : theme.colors.onSurfaceVariant 
          }]}>
            <Text variant="titleMedium" style={styles.rankNumber}>
              {index + 1}
            </Text>
          </Surface>
          
          <Avatar.Icon 
            size={40} 
            icon="business"
            style={styles.deptAvatar}
          />
          
          <View style={styles.userInfo}>
            <Text variant="titleMedium" style={styles.userName}>
              {item.department}
            </Text>
            <Text variant="bodySmall" style={styles.userDepartment}>
              {item.employeeCount} employees
            </Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="titleSmall" style={styles.statNumber}>
              {item.totalIdeas}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Total Ideas
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleSmall" style={[styles.statNumber, { color: theme.colors.tertiary }]}>
              {item.avgIdeasPerEmployee}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Avg/Employee
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Leaderboard
        </Text>
        {viewMode === 'individual' && currentUserRank > 0 && (
          <Chip 
            mode="outlined" 
            style={styles.rankChip}
            icon="emoji-events"
          >
            Your Rank: #{currentUserRank}
          </Chip>
        )}
      </View>

      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            {
              value: 'individual',
              label: 'Individual',
              icon: 'person',
            },
            {
              value: 'department',
              label: 'Department',
              icon: 'business',
            },
          ]}
        />
      </View>

      <FlatList
        data={viewMode === 'individual' ? individualStats : departmentStats}
        renderItem={viewMode === 'individual' ? renderIndividualRankItem : renderDepartmentRankItem}
        keyExtractor={(item, index) => 
          viewMode === 'individual' ? item.employeeNumber : item.department
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  rankChip: {
    backgroundColor: theme.colors.tertiaryContainer,
  },
  segmentContainer: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  rankCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  rankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    elevation: 2,
  },
  rankNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: spacing.md,
  },
  deptAvatar: {
    backgroundColor: theme.colors.secondary,
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  currentUserText: {
    color: theme.colors.primary,
  },
  userDepartment: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});