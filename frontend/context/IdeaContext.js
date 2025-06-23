import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

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
          idea._id === action.payload._id ? action.payload : idea
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

  // For God's sake dont hardcode IP address

  const loadIdeas = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.get('/api/ideas');
      dispatch({ type: 'SET_IDEAS', payload: res.data.data.ideas });
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const submitIdea = async (ideaData) => {
    try {
      const res = await api.post('/api/ideas', ideaData);
      await loadIdeas();
      return res.data.data.idea;
    } catch (error) {
      console.error('Error submitting idea:', error);
      throw error;
    }
  };

  const updateIdeaStatus = async (ideaId, statusData) => {
    try {
      const res = await api.put(`/api/ideas/${ideaId}/status`, statusData);
      dispatch({ type: 'UPDATE_IDEA', payload: res.data.data.idea });
      return res.data.data.idea;
    } catch (error) {
      console.error('Error updating idea status:', error);
      throw error;
    }
  };

  const editIdea = async (ideaId, updatedData) => {
    try {
      const res = await api.put(`/api/ideas/${ideaId}`, updatedData);
      await loadIdeas();
      return res.data.data.idea;
    } catch (error) {
      console.error('Error editing idea:', error);
      throw error;
    }
  };

  const deleteIdea = async (ideaId) => {
    try {
      await api.delete(`/api/ideas/${ideaId}`);
      await loadIdeas();
    } catch (error) {
      console.error('Error deleting idea:', error);
      throw error;
    }
  };

  return (
    <IdeaContext.Provider value={{
      ...state,
      submitIdea,
      updateIdeaStatus,
      loadIdeas,
      editIdea,
      deleteIdea
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