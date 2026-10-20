import { Route, Router } from 'wouter';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import PlayPage from './pages/PlayPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Route path="/" component={HomePage} />
        <Route path="/learn/:methodId" component={LearnPage} />
        <Route path="/play" component={PlayPage} />
      </div>
    </Router>
  );
}

export default App;
