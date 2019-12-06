import React from 'react';

export interface IGlobalStore {
  sysytemColor?: {
    color: string,
    colorShallow: string,
    colorShallower: string,
  }
}

export default React.createContext<IGlobalStore | null>(null);
