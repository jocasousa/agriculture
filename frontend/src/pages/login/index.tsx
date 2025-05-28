import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { login } from '@/features/auth/authSlice';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { useNavigate } from 'react-router-dom';

const PageWrapper = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
`;

const FormContainer = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 320px;
`;

const Title = styled.h1`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
  color: #1c7d47;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuth = useAppSelector(state => state.auth.isAuthenticated);
  const error = useAppSelector(state => state.auth.error);

  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  useEffect(() => {
    if (isAuth) {
      navigate('/', { replace: true });
    }
  }, [isAuth, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ user, pass }));
  };

  return (
    <PageWrapper>
      <FormContainer>
        <Title>Login</Title>
        <form onSubmit={handleSubmit}>
          <Input
            label="Usuário"
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="admin"
          />

          <Input
            type="password"
            label="Senha"
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="123456"
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
            Entrar
          </Button>
        </form>
      </FormContainer>
    </PageWrapper>
  );
};

export default LoginPage;
