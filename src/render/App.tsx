import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import { TypeToken } from './pages';
import Context, { IGlobalStore } from './store';
import { THEME_COLOR_CHANGE } from '@/common/event';

/**
 * 16进制颜色转rgba
 * @param hex 16进制字符串
 * @param ratio 比率
 */
function HEXToRGBA(hex: string, ratio: number, alpha = 1) {
  const hexCharArray = hex.split('');
  const rgba: number[] = [];
  while (hexCharArray.length) {
    const hexStr = hexCharArray.splice(0, 2);
    rgba.push(hexCharArray.length ? parseInt(`0x${hexStr.join('')}`, 16) * ratio : alpha);
  }

  return `rgba(${rgba})`;
}

function getThemeColors(color = '125eedff'): IGlobalStore {
  return {
    sysytemColor: {
      color: HEXToRGBA(color, 1),
      colorShallow: HEXToRGBA(color, 1.2),
      colorShallower: HEXToRGBA(color, 1.4),
      colorShallowest: HEXToRGBA(color, 1.6),
      colorShallowestAlpha: HEXToRGBA(color, 1.6, 0.8),
      colorShallowestAlpha2: HEXToRGBA(color, 1.6, 0.5),
      colorDeep: HEXToRGBA(color, 0.9),
      colorDeeper: HEXToRGBA(color, 0.8),
      colorDeepest: HEXToRGBA(color, 0.7),
    }
  }
}

const App: React.FC = () => {
  const [state, setState] = useState<IGlobalStore>(getThemeColors());

  useEffect(() => {
    ipcRenderer.on(THEME_COLOR_CHANGE, (_, sysytemColor) => {
      setState(getThemeColors(sysytemColor));
    });
    const color = ipcRenderer.sendSync('react-did-mounted');
    setState(getThemeColors(color));
  }, []);

  return (
    <Router>
      <Context.Provider value={state}>
        <Routes>
          <Route path="/" element={<TypeToken />} />
        </Routes>
      </Context.Provider>
    </Router>
  );
};

export default App;
