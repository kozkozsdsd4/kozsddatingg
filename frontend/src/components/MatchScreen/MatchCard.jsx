import './MatchCard.css';

function MatchCard({ character, onClick }) {
  return (
    <div className="match-card" onClick={onClick}>
      <div className="match-avatar">
        <img 
          src={character.photos[0]} 
          alt={character.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/80?text=' + character.name;
          }}
        />
        <span className={`status-dot ${character.online ? 'online' : 'offline'}`} />
      </div>
      
      <div className="match-info">
        <div className="match-header">
          <h3>{character.name}</h3>
          <span className="time">Şimdi</span>
        </div>
        <p className="last-message">
          Merhaba! Nasılsın? 😊
        </p>
      </div>
    </div>
  );
}

export default MatchCard;