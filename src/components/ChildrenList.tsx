import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateAge, cn } from '@/lib/utils';
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
import type { User } from '@supabase/supabase-js';

interface Child {
    id: string;
    name: string;
    dob: string;
    allergies: string[];
}

export default function ChildrenList() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Check auth and fetch children
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);

            if (!session) {
                window.location.href = '/login';
                return;
            }

            fetchChildren();
        });
    }, []);

    const fetchChildren = async () => {
        const { data, error } = await supabase
            .from('children')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching children:', error);
        } else {
            setChildren(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {


        const { error } = await supabase
            .from('children')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting child:', error);
            alert('Failed to delete child profile');
        } else {
            setChildren(children.filter(child => child.id !== id));
        }
    };


    if (!mounted || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Children</h1>
                    <p className="text-muted-foreground">Manage your children's profiles</p>
                </div>
                <Button onClick={() => window.location.href = '/children/new'}>
                    Add Child
                </Button>
            </div>

            {children.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground mb-4">No children added yet</p>
                        <Button onClick={() => window.location.href = '/children/new'}>
                            Add Your First Child
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {children.map((child) => (
                        <Card key={child.id}>
                            <CardHeader>
                                <CardTitle>{child.name}</CardTitle>
                                <CardDescription>
                                    {calculateAge(child.dob)} years old
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Born: {new Date(child.dob).toLocaleDateString()}
                                    </p>
                                    {child.allergies && child.allergies.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">Allergies:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {child.allergies.map((allergy, index) => (
                                                    <Badge key={index} variant="secondary">
                                                        {allergy}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => window.location.href = `/children/${child.id}`}
                                        >
                                            View Details
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the profile for {child.name}.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(child.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
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
