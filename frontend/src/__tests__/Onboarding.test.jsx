import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Onboarding from '../pages/Onboarding';
import { vi } from 'vitest';

// Audit Fix: Expose AuthProvider natively for context requirement
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: '123', email: 'test@test.com' } }),
  AuthProvider: ({children}) => <div>{children}</div>
}));

describe('Wizard Onboarding Form (Phase 3)', () => {
  it('Loads Step 1 gracefully', () => {
    render(<BrowserRouter><Onboarding /></BrowserRouter>);
    expect(screen.getByText(/Let's get to know you/i)).toBeInTheDocument();
  });

  it('Can navigate sequentially into the next steps of the form accurately', () => {
    render(<BrowserRouter><Onboarding /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Next/i));
    expect(screen.getByText(/Education Background/i)).toBeInTheDocument();
  });
});
