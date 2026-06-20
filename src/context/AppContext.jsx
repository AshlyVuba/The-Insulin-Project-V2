import React, { createContext, useReducer, useContext } from 'react';

const AppStateContext = createContext(undefined);
const AppDispatchContext = createContext(undefined);

const initialState = {
  user: null,
  isAuthenticated: false,
  isTrackingActive: false,
  syncStatus: 'IDLE', // IDLE | SYNCING | ERROR
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        syncStatus: 'IDLE',
      };
    case 'LOGOUT':
      return {
        ...initialState, // Wipe memory cleanly, leaving no traces
      };
    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: action.payload,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

// Safe-access hooks to prevent components from trying to use context outside of providers
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
};