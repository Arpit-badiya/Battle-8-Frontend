import { useContext } from 'react';
import { AppDataContext } from '../context/AppDataContext';

const useAppData = () => {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }

  return context;
};

export default useAppData;
