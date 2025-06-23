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
  Chip,
  Button,
  Searchbar,
  Badge,
  Menu,
  Divider,
  Modal,
  Portal,
  Dialog,
  Provider as PaperProvider,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { useIdeas } from '../../context/IdeaContext';
import { theme, spacing } from '../../utils/theme';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Ideas' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'implementing', label: 'Implementing' },
];

export default function TrackerScreen() {
  const { user } = useUser();
  const { ideas, editIdea, deleteIdea, loadIdeas } = useIdeas();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editIdeaData, setEditIdeaData] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', problem: '', benefit: '', estimatedSavings: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteIdeaId, setDeleteIdeaId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const userIdeas = ideas.filter(idea => idea.submittedBy?.employeeNumber === user?.employeeNumber);
  
  const filteredIdeas = userIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         idea.problem.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      case 'implementing': return theme.colors.tertiary;
      default: return theme.colors.secondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'implementing': return 'Implementing';
      default: return 'Under Review';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'check-circle';
      case 'rejected': return 'cancel';
      case 'implementing': return 'build';
      default: return 'schedule';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openEditModal = (idea) => {
    setEditIdeaData(idea);
    setEditForm({
      title: idea.title,
      problem: idea.problem,
      benefit: idea.benefit,
      estimatedSavings: idea.estimatedSavings ? String(idea.estimatedSavings) : '',
    });
    setEditModalVisible(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    try {
      await editIdea(editIdeaData._id, {
        ...editForm,
        estimatedSavings: editForm.estimatedSavings ? Number(editForm.estimatedSavings) : undefined,
      });
      setEditModalVisible(false);
    } catch (e) {
      // Optionally show error
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteDialog = (ideaId) => {
    setDeleteIdeaId(ideaId);
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteIdea(deleteIdeaId);
      setDeleteDialogVisible(false);
    } catch (e) {
      // Optionally show error
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderIdeaCard = ({ item }) => (
    <Card style={styles.ideaCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.ideaTitle}>
            {item.title}
          </Text>
          <Badge 
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}
          >
            {getStatusText(item.status)}
          </Badge>
        </View>
        
        <Text variant="bodyMedium" style={styles.ideaProblem} numberOfLines={2}>
          {item.problem}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.ideaMetadata}>
            <MaterialIcons 
              name="business" 
              size={16} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text variant="bodySmall" style={styles.metadataText}>
              {item.department}
            </Text>
          </View>
          
          <View style={styles.ideaMetadata}>
            <MaterialIcons 
              name="calendar-today" 
              size={16} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text variant="bodySmall" style={styles.metadataText}>
              {item.createdAt ? formatDate(item.createdAt) : ''}
            </Text>
          </View>
        </View>
        
        <Chip 
          mode="outlined" 
          style={styles.benefitChip}
        >
          {item.benefit.replace('_', ' ').toUpperCase()}
        </Chip>
        
        {item.estimatedSavings && (
          <View style={styles.savingsContainer}>
            <MaterialIcons 
              name="attach-money" 
              size={16} 
              color={theme.colors.tertiary} 
            />
            <Text variant="bodySmall" style={styles.savingsText}>
              Est. Savings: ${item.estimatedSavings}
            </Text>
          </View>
        )}
        {/* Edit & Delete Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button mode="outlined" compact onPress={() => openEditModal(item)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button mode="contained" compact buttonColor={theme.colors.error} textColor="#fff" onPress={() => openDeleteDialog(item._id)}>
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons 
        name="lightbulb-outline" 
        size={64} 
        color={theme.colors.onSurfaceVariant} 
      />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No ideas found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        {statusFilter === 'all' 
          ? "You haven't submitted any ideas yet. Start your Kaizen journey today!"
          : `No ideas with "${STATUS_FILTERS.find(f => f.value === statusFilter)?.label}" status found.`
        }
      </Text>
    </View>
  );

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            My Ideas
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {filteredIdeas.length} of {userIdeas.length} ideas
          </Text>
        </View>

        <View style={styles.filters}>
          <Searchbar
            placeholder="Search ideas..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                style={styles.filterButton}
                icon="filter"
              >
                {STATUS_FILTERS.find(f => f.value === statusFilter)?.label}
              </Button>
            }
          >
            {STATUS_FILTERS.map((filter) => (
              <Menu.Item
                key={filter.value}
                onPress={() => {
                  setStatusFilter(filter.value);
                  setMenuVisible(false);
                }}
                title={filter.label}
              />
            ))}
          </Menu>
        </View>

        {filteredIdeas.length > 0 ? (
          <FlatList
            data={filteredIdeas}
            renderItem={renderIdeaCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {renderEmptyState()}
          </ScrollView>
        )}
        {/* Edit Modal */}
        <Portal>
          <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={{ backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8 }}>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>Edit Idea</Text>
            <Text>Title</Text>
            <TextInput
              value={editForm.title}
              onChangeText={text => handleEditChange('title', text)}
              style={{ marginBottom: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 }}
            />
            <Text>Problem</Text>
            <TextInput
              value={editForm.problem}
              onChangeText={text => handleEditChange('problem', text)}
              style={{ marginBottom: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 }}
              multiline
            />
            <Text>Benefit</Text>
            <TextInput
              value={editForm.benefit}
              onChangeText={text => handleEditChange('benefit', text)}
              style={{ marginBottom: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 }}
            />
            <Text>Estimated Savings</Text>
            <TextInput
              value={editForm.estimatedSavings}
              onChangeText={text => handleEditChange('estimatedSavings', text)}
              style={{ marginBottom: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8 }}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button onPress={() => setEditModalVisible(false)} style={{ marginRight: 8 }} disabled={editLoading}>Cancel</Button>
              <Button mode="contained" onPress={handleEditSubmit} loading={editLoading} disabled={editLoading}>Save</Button>
            </View>
          </Modal>
        </Portal>
        {/* Delete Confirmation Dialog */}
        <Portal>
          <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
            <Dialog.Title>Delete Idea</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to delete this idea? This action cannot be undone.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDeleteDialogVisible(false)} disabled={deleteLoading}>Cancel</Button>
              <Button onPress={handleDeleteConfirm} loading={deleteLoading} disabled={deleteLoading} textColor={theme.colors.error}>Delete</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
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
  headerSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  filters: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
    elevation: 1,
  },
  searchbar: {
    marginBottom: spacing.md,
  },
  filterButton: {
    alignSelf: 'flex-start',
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  ideaCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  ideaTitle: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: spacing.sm,
    color: theme.colors.onSurface,
  },
  statusBadge: {
    // Badge styles handled by backgroundColor prop
  },
  ideaProblem: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  ideaMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    marginLeft: spacing.xs,
    color: theme.colors.onSurfaceVariant,
  },
  benefitChip: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  savingsText: {
    marginLeft: spacing.xs,
    color: theme.colors.tertiary,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
});