import React from 'react';
import styled from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const StyledButton = styled.button<ButtonProps>`
  background-color: ${({ variant = 'primary' }) =>
    variant === 'secondary' ? '#1c7d47' : '#69eca3'};
  color: #ffffff;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => (
  <StyledButton variant={variant} {...props}>
    {children}
  </StyledButton>
);
