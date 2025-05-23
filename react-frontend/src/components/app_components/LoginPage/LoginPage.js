import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Link, useNavigate } from 'react-router-dom';


const LoginPage = ({ isLoggedIn, login, alert }) => {
  const navigate = useNavigate();
  const [name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (!name || !password) {
      setError('Username and password are required');
      return;
    }
    login({ name: name, password })
      .then(() => navigate('/'))
      .catch(() => {
        alert({ title: 'Login failed', type: 'error', message: 'Invalid credentials' });
      });
  };

  return (
    <div className="card w-[400px] mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4 text-center">Login to StayEase</h2>
      <div className="mb-3">
        <label>Username</label>
        <InputText value={name} onChange={(e) => setUsername(e.target.value)} className="w-full" />
      </div>
      <div className="mb-3">
        <label>Password</label>
        <InputText type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
      </div>
      {error && <small className="text-red-500">{error}</small>}
      <Button label="Login" onClick={handleLogin} className="w-full mt-4" />
      <div className="text-center mt-4">
        <p>Don't have an account? <Link to="/signup" className="text-blue-500">Sign up now</Link></p>
      </div>
    </div>
  );
};

const mapState = (state) => ({ isLoggedIn: state.auth.isLoggedIn });
const mapDispatch = (dispatch) => ({
  login: (data) => dispatch.auth.login(data),
  alert: (data) => dispatch.toast.alert(data)
});

export default connect(mapState, mapDispatch)(LoginPage);