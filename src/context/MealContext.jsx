import React, { createContext, useState, useContext } from 'react';

// Context 생성
const MealContext = createContext();

// Provider 컴포넌트
export const MealProvider = ({ children }) => {
  // 업데이트 트리거용 상태 (키값)
  const [updateKey, setUpdateKey] = useState(0);

  // 업데이트 발생 함수
  const triggerUpdate = () => {
    setUpdateKey(prev => prev + 1);
  };

  return (
    <MealContext.Provider value={{ updateKey, triggerUpdate }}>
      {children}
    </MealContext.Provider>
  );
};

// Custom Hook
export const useMealContext = () => {
    const context = useContext(MealContext);
    if (!context) {
        throw new Error('useMealContext must be used within a MealProvider');
    }
    return context;
};
