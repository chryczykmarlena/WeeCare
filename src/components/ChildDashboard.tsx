import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Child {
    id: string;
    name: string;
    dob: string;
    allergies: string[];
}

interface Visit {
    id: string;
    date: string;
    reason: string;
    diagnosis: string;
    notes: string;
}

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date: string;
    active: boolean;
}

export default function ChildDashboard({ childId }: { childId: string }) {
    const [child, setChild] = useState<Child | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChildData = useCallback(async () => {
        if (!childId) return;

        // Fetch child profile
        const { data: childData, error: childError } = await supabase
            .from('children')
            .select('*')
            .eq('id', childId)
            .single();

        if (childError) {
            console.error('Error fetching child:', childError);
            setChild(null);
            setLoading(false);
            return;
        }
        setChild(childData);

        // Fetch visits
        const { data: visitsData } = await supabase
            .from('visits')
            .select('*')
            .eq('child_id', childId)
            .order('date', { ascending: false });
        setVisits(visitsData || []);

        // Fetch medications
        const { data: medsData } = await supabase
            .from('medications')
            .select('*')
            .eq('child_id', childId)
            .order('start_date', { ascending: false });
        setMedications(medsData || []);

        setLoading(false);
    }, [childId]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                window.location.href = '/login';
                return;
            }
            fetchChildData();
        });
    }, [childId, fetchChildData]);

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    if (!child) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p>Child not found</p>
                <Button onClick={() => window.location.href = '/children'}>Back to List</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{child.name}</h1>
                    <p className="text-muted-foreground">{calculateAge(child.dob)} years old • Born {new Date(child.dob).toLocaleDateString()}</p>
                    {child.allergies && child.allergies.length > 0 && (
                        <div className="flex gap-2 mt-2">
                            {child.allergies.map((allergy, i) => (
                                <Badge key={i} variant="destructive">{allergy}</Badge>
                            ))}
                        </div>
                    )}
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/children'}>
                    Back to List
                </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="visits">Visits</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Visits</CardTitle>
                                <CardDescription>Latest doctor appointments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {visits.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No visits recorded</p>
                                ) : (
                                    <div className="space-y-4">
                                        {visits.slice(0, 3).map((visit) => (
                                            <div key={visit.id} className="border-b pb-2 last:border-0 last:pb-0">
                                                <p className="font-medium">{new Date(visit.date).toLocaleDateString()}</p>
                                                <p className="text-sm">{visit.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button className="mt-4 w-full" variant="secondary" onClick={() => window.location.href = `/children/${childId}/visits/new`}>
                                    Log Visit
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Medications</CardTitle>
                                <CardDescription>Currently taken medicines</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {medications.filter(m => m.active).length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No active medications</p>
                                ) : (
                                    <div className="space-y-4">
                                        {medications.filter(m => m.active).map((med) => (
                                            <div key={med.id} className="border-b pb-2 last:border-0 last:pb-0">
                                                <p className="font-medium">{med.name}</p>
                                                <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button className="mt-4 w-full" variant="secondary" onClick={() => window.location.href = `/children/${childId}/medications/new`}>
                                    Add Medication
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="visits">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Visit History</CardTitle>
                                <CardDescription>All doctor visits and checkups</CardDescription>
                            </div>
                            <Button onClick={() => window.location.href = `/children/${childId}/visits/new`}>Log Visit</Button>
                        </CardHeader>
                        <CardContent>
                            {visits.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground">No visits recorded yet.</p>
                            ) : (
                                <div className="space-y-6">
                                    {visits.map((visit) => (
                                        <div key={visit.id} className="flex gap-4">
                                            <div className="min-w-[100px] text-sm text-muted-foreground">
                                                {new Date(visit.date).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <p className="font-medium">{visit.reason}</p>
                                                {visit.diagnosis && (
                                                    <p className="text-sm"><span className="font-semibold">Diagnosis:</span> {visit.diagnosis}</p>
                                                )}
                                                {visit.notes && <p className="text-sm text-muted-foreground mt-1">{visit.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="medications">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Medications</CardTitle>
                                <CardDescription>History of all medications</CardDescription>
                            </div>
                            <Button onClick={() => window.location.href = `/children/${childId}/medications/new`}>Add Medication</Button>
                        </CardHeader>
                        <CardContent>
                            {medications.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground">No medications recorded yet.</p>
                            ) : (
                                <div className="space-y-6">
                                    {medications.map((med) => (
                                        <div key={med.id} className="flex gap-4 items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{med.name}</p>
                                                    {med.active ? (
                                                        <Badge variant="default">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Ended {med.end_date ? new Date(med.end_date).toLocaleDateString() : ''}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm mt-1">{med.dosage} • {med.frequency}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Started: {new Date(med.start_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
