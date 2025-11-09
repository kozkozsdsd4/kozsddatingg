import { useState } from 'react';
import { characters } from '../../data/characters';
import SwipeCard from './SwipeCard';
import SwipeControls from './SwipeControls';
import './SwipeScreen.css';

function SwipeScreen({ onMatch }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  
  const currentCharacter = characters[currentIndex];
  
  const handleSwipe = (dir) => {
    setDirection(dir);
    
    if (dir === 'right') {
      onMatch(currentCharacter);
      showMatchNotification(currentCharacter);
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
    }, 300);
  };
  
  const showMatchNotification = (char) => {
    // Match bildirimi göster
    alert(`🎉 It's a match with ${char.name}!`);
  };
  
  if (currentIndex >= characters.length) {
    return (
      <div className="swipe-screen">
        <div className="no-more-cards">
          <h2>🎉 Tüm karakterleri gördün!</h2>
          <button onClick={() => setCurrentIndex(0)}>
            Baştan Başla
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="swipe-screen">
      <header className="swipe-header">
        <h1>💕 Dating App</h1>
      </header>
      
      <div className="card-container">
        <SwipeCard 
          character={currentCharacter}
          direction={direction}
        />
      </div>
      
      <SwipeControls 
        onLike={() => handleSwipe('right')}
        onNope={() => handleSwipe('left')}
      />
      
      <div className="progress">
        {currentIndex + 1} / {characters.length}
      </div>
    </div>
  );
}

export default SwipeScreen;