import React from 'react';
import { Router } from '@reach/router';
import { TypeToken } from './pages';

const App: React.FC = () => {
  return (
    <>
      <Router basepath="dist">
        <TypeToken path="/" />
      </Router>
    </>
  );
};

export default App;
