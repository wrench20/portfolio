import React, { createContext } from 'react';
import { useState } from 'react';

const TransitionContext = createContext<{ completed: boolean; toggleCompleted: (value: boolean) => void }>({ completed: false, toggleCompleted: () => {} });

export const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [completed, setCompleted] = useState(false);

  const toggleCompleted = (value: boolean) => {
    setCompleted(value);
  };

  return (
    <TransitionContext.Provider
      value={{
        toggleCompleted,
        completed,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
};

export default TransitionContext;
