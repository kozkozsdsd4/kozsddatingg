import './SwipeCard.css';

function SwipeCard({ character, direction }) {
  return (
    <div className={`swipe-card ${direction ? `swipe-${direction}` : ''}`}>
      <div className="card-image">
        <img 
          src={character.photos[0]} 
          alt={character.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x600?text=' + character.name;
          }}
        />
      </div>
      
      <div className="card-info">
        <div className="card-header">
          <h2>{character.name}, {character.age}</h2>
          <span className={`status ${character.online ? 'online' : 'offline'}`}>
            {character.online ? '🟢' : '⚪'}
          </span>
        </div>
        
        <p className="location">📍 {character.location}</p>
        <p className="bio">{character.bio}</p>
        
        <div className="interests">
          {character.interests.map((interest, idx) => (
            <span key={idx} className="interest-tag">
              {interest}
            </span>
          ))}
        </div>
        
        <div className="discovery">
          <span>🔍 Keşfedildi: {character.traits.discovered}%</span>
        </div>
      </div>
    </div>
  );
}

export default SwipeCard;