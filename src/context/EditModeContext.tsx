import React, { createContext, useContext, useState, useEffect } from 'react';

interface EditModeContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  toggleEditMode: () => {},
  setEditMode: () => {},
});

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('makhe_edit_images_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleEditMode = () => {
    setIsEditMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('makhe_edit_images_mode', String(next));
      } catch (err) {
        console.error('Failed to persist edit mode state:', err);
      }
      return next;
    });
  };

  const setEditMode = (value: boolean) => {
    setIsEditMode(value);
    try {
      localStorage.setItem('makhe_edit_images_mode', String(value));
    } catch (err) {
      console.error('Failed to persist edit mode state:', err);
    }
  };

  return (
    <EditModeContext.Provider value={{ isEditMode, toggleEditMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => useContext(EditModeContext);
