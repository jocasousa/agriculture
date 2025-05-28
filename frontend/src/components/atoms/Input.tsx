// src/components/atoms/Input.tsx
import React from 'react';
import styled from 'styled-components';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
`;

const StyledLabel = styled.label`
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1c7d47;
`;

const StyledInput = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid ${({ hasError }) => (hasError ? 'red' : '#ccc')};
  border-radius: 0.375rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #69eca3;
    box-shadow: 0 0 0 2px rgba(105, 236, 163, 0.3);
  }
`;

const ErrorText = styled.span`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: red;
`;

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => (
  <InputWrapper>
    {label && <StyledLabel>{label}</StyledLabel>}
    <StyledInput hasError={!!error} {...props} />
    {error && <ErrorText>{error}</ErrorText>}
  </InputWrapper>
);
