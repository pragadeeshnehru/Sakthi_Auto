import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
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
import api from '../../utils/api';
import { theme, spacing } from '../../utils/theme';

const { width } = Dimensions.get('window');

export default function LeaderboardScreen() {
  const { user } = useUser();
  const [viewMode, setViewMode] = useState('individual');
  const [individualStats, setIndividualStats] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Individual leaderboard
        const resInd = await api.get('/api/users/leaderboard?type=individual');
        setIndividualStats(resInd.data.data.leaderboard || []);
        // Department leaderboard
        const resDept = await api.get('/api/users/leaderboard?type=department');
        setDepartmentStats(resDept.data.data.departmentLeaderboard || []);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const currentUserRank = individualStats.findIndex(stat => stat.employeeNumber === user?.employeeNumber) + 1;

  const renderIndividualRankItem = ({ item, index }) => {
    const isCurrentUser = item.employeeNumber === user?.employeeNumber;
    const rankColor = index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : theme.colors.onSurfaceVariant;
    return (
      <Card style={[
        styles.rankCard,
        isCurrentUser && styles.currentUserCard
      ]}>
        <Card.Content style={styles.rankContentCompact}>
          <Surface style={[styles.rankBadgeCompact, { backgroundColor: rankColor }]}> 
            <Text variant="titleSmall" style={styles.rankNumberCompact}>
              {index + 1}
            </Text>
          </Surface>
          <Avatar.Text 
            size={32} 
            label={item.name.split(' ').map(n => n[0]).join('')}
            style={styles.userAvatarCompact}
          />
          <Text style={[styles.userNameCompact, isCurrentUser && styles.currentUserText]} numberOfLines={1}>
            {item.name.split(' ')[0]}{isCurrentUser ? ' (You)' : ''}
          </Text>
          <MaterialIcons name="emoji-events" size={18} color={theme.colors.primary} style={{ marginHorizontal: 4 }} />
          <Text style={styles.statNumberCompact}>{item.totalIdeas}</Text>
          <MaterialIcons name="check-circle" size={18} color={theme.colors.success} style={{ marginHorizontal: 4 }} />
          <Text style={styles.statNumberCompact}>{item.implementedIdeas}</Text>
        </Card.Content>
      </Card>
    );
  };

  const renderDepartmentRankItem = ({ item, index }) => (
    <Card style={styles.rankCard}>
      <Card.Content style={styles.rankContentCompact}>
        <Surface style={[styles.rankBadgeCompact, { 
          backgroundColor: index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : theme.colors.onSurfaceVariant 
        }]}> 
          <Text variant="titleSmall" style={styles.rankNumberCompact}>
            {index + 1}
          </Text>
        </Surface>
        <Avatar.Icon 
          size={32} 
          icon="business"
          style={styles.deptAvatarCompact}
        />
        <Text style={styles.userNameCompact} numberOfLines={1}>
          {item._id || item.department}
        </Text>
        <MaterialIcons name="groups" size={18} color={theme.colors.tertiary} style={{ marginHorizontal: 4 }} />
        <Text style={styles.statNumberCompact}>{item.employeeCount || ''}</Text>
        <MaterialIcons name="lightbulb" size={18} color={theme.colors.primary} style={{ marginHorizontal: 4 }} />
        <Text style={styles.statNumberCompact}>{item.totalIdeas}</Text>
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
      <ScrollView horizontal={false} contentContainerStyle={styles.scrollContainer}>
        <FlatList
          data={viewMode === 'individual' ? individualStats : departmentStats}
          renderItem={viewMode === 'individual' ? renderIndividualRankItem : renderDepartmentRankItem}
          keyExtractor={(item, index) => 
            viewMode === 'individual' ? item.employeeNumber : (item._id || item.department)
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
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
    color: theme.colors.onSurface,
  },
  rankChip: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  segmentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scrollContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    minWidth: width,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  rankCard: {
    marginBottom: spacing.md,
    width: '100%',
    alignSelf: 'center',
    elevation: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  rankContentCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 0,
  },
  rankBadgeCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rankNumberCompact: {
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
    fontSize: 14,
  },
  userAvatarCompact: {
    marginRight: spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  userNameCompact: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontSize: 14,
    maxWidth: 70,
    flexShrink: 1,
  },
  currentUserText: {
    color: theme.colors.primary,
  },
  statNumberCompact: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontSize: 14,
    minWidth: 20,
    textAlign: 'center',
  },
  deptAvatarCompact: {
    marginRight: spacing.sm,
    backgroundColor: theme.colors.secondary,
  },
});