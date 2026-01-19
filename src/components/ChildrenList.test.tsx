import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChildrenList from './ChildrenList';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
        },
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        order: vi.fn(),
    },
}));

import { supabase } from '@/lib/supabase';

describe('ChildrenList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });

        render(<ChildrenList />);
        await waitFor(() => {
            expect(screen.getByText(/Loading.../)).toBeInTheDocument();
        });
    });

    it('shows empty state when user is logged in but has no children', async () => {
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: { user: { id: 'user-1' } } }
        });

        (supabase.from as any)().order.mockResolvedValue({ data: [], error: null });

        render(<ChildrenList />);

        await waitFor(() => {
            expect(screen.getByText(/No children added yet/)).toBeInTheDocument();
        });
    });

    it('renders children cards when data is returned', async () => {
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: { user: { id: 'user-1' } } }
        });

        const mockChildren = [
            { id: '1', name: 'Child One', dob: '2020-01-01', allergies: ['Milk'] },
        ];

        (supabase.from as any)().order.mockResolvedValue({ data: mockChildren, error: null });

        render(<ChildrenList />);

        await waitFor(() => {
            expect(screen.getByText('Child One')).toBeInTheDocument();
            expect(screen.getByText(/Milk/)).toBeInTheDocument();
        });
    });
});
