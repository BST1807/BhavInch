import { useState } from 'react';

export const useThemeStore = () => {
  const [theme, setThemeState] = useState(() => 'coffee');

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    // localStorage.setItem("defi-theme", newTheme);
  };

  return { theme, setTheme };
};
