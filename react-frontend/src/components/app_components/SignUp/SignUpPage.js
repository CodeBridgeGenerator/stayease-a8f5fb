import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Link, useNavigate } from 'react-router-dom';
import client from "../../../services/restClient";


const states = ['Selangor', 'Johor', 'Kuala Lumpur', 'Penang', 'Sabah', 'Sarawak'];

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    location: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleSignup = async () => {
    const { name, email, password, role, phone, location } = form;
    if (!name || !email || !password || !role || !phone || !location) {
      setError('All fields are required');
      return;
    }
    try {
      await client.service('users').create(form);
      navigate('/login');
    } catch (e) {
      setError('Signup failed: ' + e.message);
    }
  };

  return (
    <div className="card w-[500px] mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4 text-center">Create StayEase Account</h2>
      <div className="grid gap-4">
        <InputText placeholder="Username" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        <InputText placeholder="Email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        <InputText type="password" placeholder="Password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
        <InputText placeholder="Role (e.g. customer/service provider)" value={form.role} onChange={(e) => handleChange('role', e.target.value)} />
        <InputText placeholder="Phone Number" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        <Dropdown placeholder="Select State" value={form.location} options={states} onChange={(e) => handleChange('location', e.value)} className="w-full" />
        {error && <small className="text-red-500">{error}</small>}
        <Button label="Sign Up" onClick={handleSignup} className="w-full mt-4" />
        <div className="text-center mt-4">
          <p>Already have an account? <Link to="/login" className="text-blue-500">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
