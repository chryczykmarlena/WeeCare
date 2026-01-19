import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
        },
    },
}));

import { supabase } from '@/lib/supabase';

describe('LoginForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        render(<LoginForm />);
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('shows error message on failed login', async () => {
        const errorMessage = 'Invalid login credentials';
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
            data: { user: null, session: null },
            error: { message: errorMessage } as any
        });

        render(<LoginForm />);

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('updates state on input change', () => {
        render(<LoginForm />);
        const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        expect(emailInput.value).toBe('user@example.com');
    });
});
