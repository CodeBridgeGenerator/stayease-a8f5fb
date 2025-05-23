import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';

const AppTopbar = ({ isLoggedIn, user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 shadow-md bg-white">
      <Link to="/" className="text-2xl font-bold text-blue-700">
        StayEase
      </Link>

      <nav className="flex gap-6 items-center">
        <Link to="/services" className="text-gray-700 hover:text-blue-600">Services</Link>
        <Link to="/how-it-works" className="text-gray-700 hover:text-blue-600">How It Works</Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Avatar label={user?.name?.charAt(0).toUpperCase() || '?'} shape="circle" size="large" style={{ backgroundColor: '#D30000', color: '#fff' }} />
            <Button label="Logout" onClick={handleLogout} className="p-button-sm p-button-danger" />
          </div>
        ) : (
          <Button label="Login" className="p-button-sm" onClick={() => navigate('/login')} />
        )}
      </nav>
    </header>
  );
};

const mapState = (state) => ({
  isLoggedIn: state.auth.isLoggedIn,
  user: state.auth.user
});

const mapDispatch = (dispatch) => ({
  logout: () => dispatch.auth.logout()
});

export default connect(mapState, mapDispatch)(AppTopbar);
