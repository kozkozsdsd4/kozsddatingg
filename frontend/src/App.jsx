import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SwipeScreen from './components/SwipeScreen/SwipeScreen';
import MatchScreen from './components/MatchScreen/MatchScreen';
import ChatScreen from './components/ChatScreen/ChatScreen';
import Navigation from './components/common/Navigation';
import './App.css';

function App() {
  const [matches, setMatches] = useState([]);
  
  const handleMatch = (character) => {
    setMatches([...matches, character]);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<SwipeScreen onMatch={handleMatch} />} />
          <Route path="/matches" element={<MatchScreen matches={matches} />} />
          <Route path="/chat/:id" element={<ChatScreen />} />
        </Routes>
        
        <Navigation />
      </div>
    </Router>
  );
}

export default App;