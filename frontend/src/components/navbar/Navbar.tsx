// src/components/Navbar.tsx
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Tractor, Home, Users, LogOut } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logout } from '@/features/auth/authSlice';
import { Button } from '@/components/atoms/Button';

const Nav = styled.nav`
  width: 100%;
  background-color: #1c7d47;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: bold;
`;

const CenterMenu = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
`;

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Nav>
      <LogoWrapper>
        <Tractor size={24} style={{ marginRight: '0.5rem' }} />
        Agriculture
      </LogoWrapper>

      <CenterMenu>
        <Button
          variant="secondary"
          onClick={() => navigate('/')}
        >
          <Home size={16} style={{ marginRight: '0.25rem' }} />
          Dashboard
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate('/producer')}
        >
          <Users size={16} style={{ marginRight: '0.25rem' }} />
          Produtores
        </Button>
      </CenterMenu>

      <RightMenu>
        <Button
          variant="secondary"
          onClick={handleLogout}
        >
          <LogOut size={16} style={{ marginRight: '0.25rem' }} />
          Sair
        </Button>
      </RightMenu>
    </Nav>
  );
};