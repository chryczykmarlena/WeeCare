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
        vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });

        render(<ChildrenList />);
        await waitFor(() => {
            expect(screen.getByText(/Loading.../)).toBeInTheDocument();
        });
    });

    it('shows empty state when user is logged in but has no children', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: { user: { id: 'user-1' } } as any },
            error: null
        });

        vi.mocked(supabase.from).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null })
        } as any);

        render(<ChildrenList />);

        await waitFor(() => {
            expect(screen.getByText(/No children added yet/)).toBeInTheDocument();
        });
    });

    it('renders children cards when data is returned', async () => {
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: { user: { id: 'user-1' } } as any },
            error: null
        });

        const mockChildren = [
            { id: '1', name: 'Child One', dob: '2020-01-01', allergies: ['Milk'] },
        ];

        vi.mocked(supabase.from).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockChildren, error: null })
        } as any);

        render(<ChildrenList />);

        await waitFor(() => {
            expect(screen.getByText('Child One')).toBeInTheDocument();
            expect(screen.getByText(/Milk/)).toBeInTheDocument();
        });
    });
});
