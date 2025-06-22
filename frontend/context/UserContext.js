import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

const userReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
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
  user: null,
  isAuthenticated: false,
  loading: true,
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        dispatch({ type: 'LOGIN', payload: JSON.parse(userData) });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (employeeNumber, otp) => {
    // Mock authentication
    const mockUsers = {
      '12345': {
        id: '1',
        employeeNumber: '12345',
        name: 'John Doe',
        department: 'Engineering',
        designation: 'Senior Engineer',
        role: 'employee',
        email: 'john.doe@company.com',
      },
      '67890': {
        id: '2',
        employeeNumber: '67890',
        name: 'Jane Smith',
        department: 'Quality',
        designation: 'Quality Manager',
        role: 'reviewer',
        email: 'jane.smith@company.com',
      },
      '11111': {
        id: '3',
        employeeNumber: '11111',
        name: 'Admin User',
        department: 'Management',
        designation: 'Kaizen Coordinator',
        role: 'admin',
        email: 'admin@company.com',
      },
    };

    if (mockUsers[employeeNumber] && otp === '1234') {
      const user = mockUsers[employeeNumber];
      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <UserContext.Provider value={{ ...state, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};