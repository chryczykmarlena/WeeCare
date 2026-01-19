import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
}

export default function DoctorsList() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = '/login';
            return;
        }

        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching doctors:', error);
        } else {
            setDoctors(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('doctors')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting doctor:', error);
        } else {
            setDoctors(doctors.filter(doc => doc.id !== id));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">Loading...</div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Doctors & Contacts</h1>
                    <p className="text-muted-foreground">Manage your medical directory</p>
                </div>
                <Button onClick={() => window.location.href = '/doctors/new'}>
                    Add Doctor
                </Button>
            </div>

            {doctors.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground mb-4">No doctors added yet</p>
                        <Button onClick={() => window.location.href = '/doctors/new'}>
                            Add Your First Contact
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {doctors.map((doctor) => (
                        <Card key={doctor.id} className="relative group">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{doctor.name}</CardTitle>
                                        {doctor.specialty && (
                                            <CardDescription className="font-medium text-primary">
                                                {doctor.specialty}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => window.location.href = `/doctors/${doctor.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete {doctor.name}? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(doctor.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {doctor.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <a href={`tel:${doctor.phone}`} className="hover:underline">{doctor.phone}</a>
                                    </div>
                                )}
                                {doctor.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a href={`mailto:${doctor.email}`} className="hover:underline">{doctor.email}</a>
                                    </div>
                                )}
                                {doctor.address && (
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span>{doctor.address}</span>
                                    </div>
                                )}
                                {doctor.notes && (
                                    <div className="text-sm text-muted-foreground border-t pt-3 mt-3">
                                        <p>{doctor.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Back to Home
                </Button>
            </div>
        </div>
    );
}
