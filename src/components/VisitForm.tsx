import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VisitForm({ childId }: { childId: string }) {
    const [mounted, setMounted] = useState(false);
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Set default date to today
        setDate(new Date().toISOString().split('T')[0]);
    }, []);

    if (!mounted) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!date) {
            setError('Date is required');
            return;
        }

        if (!reason.trim()) {
            setError('Reason for visit is required');
            return;
        }

        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = '/login';
            return;
        }

        const { error: insertError } = await supabase
            .from('visits')
            .insert([
                {
                    user_id: session.user.id,
                    child_id: childId,
                    date,
                    reason: reason.trim(),
                    diagnosis: diagnosis.trim(),
                    notes: notes.trim(),
                },
            ]);

        if (insertError) {
            console.error('Error logging visit:', insertError);
            setError('Failed to log visit. Please try again.');
            setLoading(false);
        } else {
            // Success - redirect to child dashboard
            window.location.href = `/children/${childId}`;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Log Doctor Visit</CardTitle>
                    <CardDescription>Record details from a doctor appointment</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date of Visit *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Visit *</Label>
                            <Input
                                id="reason"
                                placeholder="e.g., Annual Checkup, Fever, Cough"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="diagnosis">Diagnosis (Optional)</Label>
                            <Input
                                id="diagnosis"
                                placeholder="e.g., Strep Throat, Healthy"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes / Instructions (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Doctor's instructions, prescriptions mentioned, etc."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Record'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.location.href = `/children/${childId}`}
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
