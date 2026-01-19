import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddChildForm() {
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [allergiesText, setAllergiesText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                window.location.href = '/login';
            }
        });
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        if (!dob) {
            setError('Date of birth is required');
            return;
        }

        // Check if date is not in the future
        if (new Date(dob) > new Date()) {
            setError('Date of birth cannot be in the future');
            return;
        }

        setLoading(true);

        // Parse allergies (comma-separated)
        const allergies = allergiesText
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0);

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = '/login';
            return;
        }

        const { error: insertError } = await supabase
            .from('children')
            .insert([
                {
                    user_id: session.user.id,
                    name: name.trim(),
                    dob,
                    allergies,
                },
            ]);

        if (insertError) {
            console.error('Error adding child:', insertError);
            setError('Failed to add child. Please try again.');
            setLoading(false);
        } else {
            // Success - redirect to children list
            window.location.href = '/children';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Add Child Profile</CardTitle>
                    <CardDescription>Enter your child's information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                placeholder="Child's name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth *</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="allergies">Allergies (optional)</Label>
                            <Textarea
                                id="allergies"
                                placeholder="Enter allergies separated by commas (e.g., Peanuts, Milk, Eggs)"
                                value={allergiesText}
                                onChange={(e) => setAllergiesText(e.target.value)}
                                rows={3}
                            />
                            <p className="text-sm text-muted-foreground">
                                Separate multiple allergies with commas
                            </p>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Child'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.location.href = '/children'}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
