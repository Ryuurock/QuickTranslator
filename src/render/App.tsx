import React from 'react';
import { Route, Switch, HashRouter as Router } from 'react-router-dom';
import { TypeToken } from './pages';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <TypeToken />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
