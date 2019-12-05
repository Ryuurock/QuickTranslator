import React from 'react';
import { systemPreferences } from 'electron';

interface IGlobalStore {
  sysytemColor: string,
}

export default React.createContext<IGlobalStore>({
  sysytemColor: systemPreferences.getAccentColor().substr(0, 6),
});
