import { Link, useLocation } from 'react-router-dom';
import { Flame, MessageCircle, User } from 'lucide-react';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="navigation">
      <Link 
        to="/" 
        className={location.pathname === '/' ? 'active' : ''}
      >
        <Flame size={24} />
        <span>Swipe</span>
      </Link>
      
      <Link 
        to="/matches" 
        className={location.pathname === '/matches' ? 'active' : ''}
      >
        <MessageCircle size={24} />
        <span>Matches</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={location.pathname === '/profile' ? 'active' : ''}
      >
        <User size={24} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}

export default Navigation;