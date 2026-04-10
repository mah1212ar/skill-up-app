import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';
import { vi } from 'vitest';

// Intercept window operations to simulate live remote API connectivity
global.fetch = vi.fn();

describe('Superadmin Table Review Component (Phase 5)', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  it('Fetches secure user data endpoints and renders matching table components successfully', async () => {
    const mockUsers = [
      {
        _id: '1',
        email: 'test@admin.com',
        onboardingData: {
          basicInfo: { fullName: 'Admin Tester', age: 30, gender: 'Male', location: 'Dhaka' }
        }
      }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<BrowserRouter><AdminDashboard /></BrowserRouter>);
    
    // Test Initial loading state structure rendering
    expect(screen.getByText(/Fetching demographic data streams/i)).toBeInTheDocument();
    
    // Simulate promise completion and exact table mapping verifications
    await waitFor(() => {
      expect(screen.getByText(/Admin Tester/i)).toBeInTheDocument();
      expect(screen.getByText(/test@admin.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Dhaka/i)).toBeInTheDocument();
    });
  });
});
