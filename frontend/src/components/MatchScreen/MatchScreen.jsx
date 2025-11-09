import { useNavigate } from 'react-router-dom';
import MatchCard from './MatchCard';
import './MatchScreen.css';

function MatchScreen({ matches }) {
  const navigate = useNavigate();
  
  if (matches.length === 0) {
    return (
      <div className="match-screen">
        <header className="match-header">
          <h1>💬 Matches</h1>
        </header>
        
        <div className="no-matches">
          <h2>😔 Henüz match yok</h2>
          <p>Swipe ekranında karakterleri beğen!</p>
          <button onClick={() => navigate('/')}>
            Swipe'a Git 🔥
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="match-screen">
      <header className="match-header">
        <h1>💬 Matches ({matches.length})</h1>
      </header>
      
      <div className="matches-list">
        {matches.map(character => (
          <MatchCard 
            key={character.id}
            character={character}
            onClick={() => navigate(`/chat/${character.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default MatchScreen;