import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";

export default function MedicationForm({ childId }: { childId: string }) {
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [active, setActive] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Set default date to today
        setStartDate(new Date().toISOString().split('T')[0]);
    }, []);

    if (!mounted) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Medication name is required');
            return;
        }

        if (!startDate) {
            setError('Start date is required');
            return;
        }

        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = '/login';
            return;
        }

        const { error: insertError } = await supabase
            .from('medications')
            .insert([
                {
                    user_id: session.user.id,
                    child_id: childId,
                    name: name.trim(),
                    dosage: dosage.trim(),
                    frequency: frequency.trim(),
                    start_date: startDate,
                    end_date: endDate || null,
                    active,
                },
            ]);

        if (insertError) {
            console.error('Error logging medication:', insertError);
            setError('Failed to save medication. Please try again.');
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
                    <CardTitle>Add Medication</CardTitle>
                    <CardDescription>Track a new prescription or medicine</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Medication Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Amoxicillin, Ibuprofen"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dosage">Dosage</Label>
                                <Input
                                    id="dosage"
                                    placeholder="e.g., 5ml, 1 tablet"
                                    value={dosage}
                                    onChange={(e) => setDosage(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="frequency">Frequency</Label>
                                <Input
                                    id="frequency"
                                    placeholder="e.g., 3x daily"
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date *</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date (Optional)</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="active"
                                checked={active}
                                onCheckedChange={(checked) => setActive(checked as boolean)}
                            />
                            <Label htmlFor="active">Currently taking this medication</Label>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Medication'}
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
