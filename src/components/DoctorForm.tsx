import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DoctorFormProps {
    doctorId?: string; // Optional for edit mode
}

export default function DoctorForm({ doctorId }: DoctorFormProps) {
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!doctorId);

    useEffect(() => {
        setMounted(true);
        if (doctorId) {
            fetchDoctor();
        }
    }, [doctorId]);

    const fetchDoctor = async () => {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', doctorId)
            .single();

        if (error) {
            console.error('Error fetching doctor:', error);
            setError('Failed to load doctor details.');
        } else if (data) {
            setName(data.name);
            setSpecialty(data.specialty || '');
            setPhone(data.phone || '');
            setEmail(data.email || '');
            setAddress(data.address || '');
            setNotes(data.notes || '');
        }
        setInitialLoading(false);
    };

    if (!mounted || initialLoading) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Doctor name is required');
            return;
        }

        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = '/login';
            return;
        }

        const doctorData = {
            user_id: session.user.id,
            name: name.trim(),
            specialty: specialty.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
            notes: notes.trim(),
        };

        let result;
        if (doctorId) {
            // Update
            result = await supabase
                .from('doctors')
                .update(doctorData)
                .eq('id', doctorId);
        } else {
            // Insert
            result = await supabase
                .from('doctors')
                .insert([doctorData]);
        }

        if (result.error) {
            console.error('Error saving doctor:', result.error);
            setError('Failed to save doctor details. Please try again.');
            setLoading(false);
        } else {
            // Success - redirect to doctors list
            window.location.href = '/doctors';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>{doctorId ? 'Edit Doctor' : 'Add Doctor'}</CardTitle>
                    <CardDescription>
                        {doctorId ? 'Update contact details' : 'Add a new medical professional to your directory'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                placeholder="Dr. Start"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specialty">Specialty</Label>
                            <Input
                                id="specialty"
                                placeholder="Pediatrician, Dentist, etc."
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="(555) 123-4567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="doctor@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                placeholder="Clinic address..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Opening hours, personal opinions, etc."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? 'Saving...' : (doctorId ? 'Update Doctor' : 'Add Doctor')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.location.href = '/doctors'}
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
