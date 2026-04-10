import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../components/Auth/Auth';
import { vi } from 'vitest';

vi.mock('../../firebase/firebase', () => ({
  auth: {},
  googleProvider: {},
  signInWithPopup: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn()
}));

describe('Auth Component Module (Phase 2)', () => {
  it('Properly mounts default explicit User Auth login state', () => {
    render(<BrowserRouter><Auth /></BrowserRouter>);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  });

  it('Succesfully routes context switch matching signup form state', () => {
    render(<BrowserRouter><Auth /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Sign up for free/i));
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });
});
