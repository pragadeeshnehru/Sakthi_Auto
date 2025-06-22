import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IdeaContext = createContext();

const ideaReducer = (state, action) => {
  switch (action.type) {
    case 'SET_IDEAS':
      return {
        ...state,
        ideas: action.payload,
      };
    case 'ADD_IDEA':
      return {
        ...state,
        ideas: [action.payload, ...state.ideas],
      };
    case 'UPDATE_IDEA':
      return {
        ...state,
        ideas: state.ideas.map(idea =>
          idea.id === action.payload.id ? action.payload : idea
        ),
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  ideas: [],
  loading: false,
};

export const IdeaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ideaReducer, initialState);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const storedIdeas = await AsyncStorage.getItem('ideas');
      if (storedIdeas) {
        dispatch({ type: 'SET_IDEAS', payload: JSON.parse(storedIdeas) });
      } else {
        // Load mock data
        const mockIdeas = [
          {
            id: '1',
            title: 'Improve Assembly Line Efficiency',
            problem: 'Current assembly line has bottlenecks causing delays',
            improvement: 'Reorganize workstations and implement lean principles',
            benefit: 'Productivity',
            estimatedSavings: 50000,
            department: 'Manufacturing',
            submittedBy: '12345',
            submittedDate: '2024-01-15',
            status: 'approved',
            images: [],
          },
          {
            id: '2',
            title: 'Digital Document Management',
            problem: 'Paper-based filing system is inefficient',
            improvement: 'Implement digital document management system',
            benefit: 'Cost saving',
            estimatedSavings: 25000,
            department: 'Administration',
            submittedBy: '12345',
            submittedDate: '2024-01-10',
            status: 'under_review',
            images: [],
          },
        ];
        dispatch({ type: 'SET_IDEAS', payload: mockIdeas });
        await AsyncStorage.setItem('ideas', JSON.stringify(mockIdeas));
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const submitIdea = async (ideaData) => {
    const newIdea = {
      id: Date.now().toString(),
      ...ideaData,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'under_review',
    };

    dispatch({ type: 'ADD_IDEA', payload: newIdea });
    
    const updatedIdeas = [newIdea, ...state.ideas];
    await AsyncStorage.setItem('ideas', JSON.stringify(updatedIdeas));
    
    return newIdea;
  };

  const updateIdeaStatus = async (ideaId, status) => {
    const updatedIdea = state.ideas.find(idea => idea.id === ideaId);
    if (updatedIdea) {
      updatedIdea.status = status;
      dispatch({ type: 'UPDATE_IDEA', payload: updatedIdea });
      await AsyncStorage.setItem('ideas', JSON.stringify(state.ideas));
    }
  };

  return (
    <IdeaContext.Provider value={{ 
      ...state, 
      submitIdea, 
      updateIdeaStatus,
      loadIdeas 
    }}>
      {children}
    </IdeaContext.Provider>
  );
};

export const useIdeas = () => {
  const context = useContext(IdeaContext);
  if (!context) {
    throw new Error('useIdeas must be used within an IdeaProvider');
  }
  return context;
};