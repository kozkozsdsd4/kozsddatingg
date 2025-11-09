import { X, Heart } from 'lucide-react';
import './SwipeControls.css';

function SwipeControls({ onNope, onLike }) {
  return (
    <div className="swipe-controls">
      <button 
        className="control-btn nope-btn"
        onClick={onNope}
      >
        <X size={32} />
      </button>
      
      <button 
        className="control-btn like-btn"
        onClick={onLike}
      >
        <Heart size={32} />
      </button>
    </div>
  );
}

export default SwipeControls;