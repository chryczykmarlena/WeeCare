import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

export default function HomePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check current auth status
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);

            // Redirect to login if not authenticated
            if (!session) {
                window.location.href = '/login';
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session) {
                window.location.href = '/login';
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold mb-4">WeeCare</h1>
            <p className="text-lg text-muted-foreground mb-4">Child Medical History Tracker</p>
            <p className="text-sm text-muted-foreground mb-8">
                Logged in as: {user.email}
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button className="w-full" size="lg" onClick={() => window.location.href = '/children'}>
                    Manage Children
                </Button>
                <Button className="w-full" variant="secondary" size="lg" onClick={() => window.location.href = '/doctors'}>
                    Doctors & Contacts
                </Button>
                <Button className="w-full" variant="outline" size="lg" onClick={handleSignOut}>
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
