import React, { useState } from 'react';
import { TextInput, Button, Card, Title, Text } from '@tremor/react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterCredentials } from '../types/auth';
import { authApi } from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    company: '',
    jobTitle: '',
    phoneNumber: '',
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authApi.register(credentials);
      if (response.data) {
        navigate('/login');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Title>Create Account</Title>
          <Text>Join us today</Text>
        </div>
        {error && (
          <div className="mb-4 p-2 text-red-600 bg-red-50 rounded text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              placeholder="Full Name"
              value={credentials.name}
              onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
              required
            />
            <TextInput
              placeholder="Email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
            />
            <TextInput
              placeholder="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
            <TextInput
              placeholder="Company"
              value={credentials.company}
              onChange={(e) => setCredentials({ ...credentials, company: e.target.value })}
              required
            />
            <TextInput
              placeholder="Job Title"
              value={credentials.jobTitle}
              onChange={(e) => setCredentials({ ...credentials, jobTitle: e.target.value })}
              required
            />
            <TextInput
              placeholder="Phone Number"
              value={credentials.phoneNumber}
              onChange={(e) => setCredentials({ ...credentials, phoneNumber: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-4">
            Create Account
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Text>Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Sign In
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
