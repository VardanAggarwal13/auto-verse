import { useMemo, useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Car, Clock, Plus, User, Wrench } from "lucide-react";

interface ServiceRequest {
    _id: string;
    customer: {
        name: string;
        email: string;
    };
    vehicle: {
        title: string;
        brand: string;
    };
    serviceType: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    scheduledDate?: string;
    createdAt?: string;
}

const StaffDashboard = () => {
    const [services, setServices] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchServices = async () => {
        try {
            const response = await apiClient.get("/staff/services");
            setServices(response.data);
        } catch (error) {
            console.error("Failed to fetch service requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const updateServiceStatus = async (id: string, newStatus: string) => {
        try {
            await apiClient.patch(`/staff/services/${id}`, { status: newStatus });
            toast.success(`Service marked ${newStatus}`);
            fetchServices();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'in-progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const stats = useMemo(() => {
        const pending = services.filter((s) => s.status === "pending").length;
        const inProgress = services.filter((s) => s.status === "in-progress").length;
        const completed = services.filter((s) => s.status === "completed").length;
        const cancelled = services.filter((s) => s.status === "cancelled").length;
        const active = pending + inProgress;
        return { pending, inProgress, completed, cancelled, active, total: services.length };
    }, [services]);

    const activeRequests = useMemo(() => {
        return services
            .filter((s) => s.status === "pending" || s.status === "in-progress")
            .slice(0, 6);
    }, [services]);

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-2xl border bg-card">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,hsl(var(--primary)/0.14),transparent_42%),radial-gradient(circle_at_90%_28%,hsl(var(--secondary)/0.20),transparent_45%),radial-gradient(circle_at_40%_92%,hsl(var(--primary)/0.08),transparent_38%)]" />
                <div className="relative p-6 sm:p-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                            <Wrench className="h-3.5 w-3.5" />
                            Staff Console
                        </div>
                        <h1 className="mt-3 text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                            Service operations, at a glance.
                        </h1>
                        <p className="mt-2 text-muted-foreground max-w-2xl">
                            Create service requests, move jobs through the pipeline, and keep inspections flowing.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button asChild className="gap-2">
                            <Link to="/dashboard/staff/services">
                                <Plus className="h-4 w-4" />
                                New service request
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="gap-2">
                            <Link to="/dashboard/staff/inspections">
                                Inspection reports <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Active</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-bold">{stats.active}</div>
                            <div className="text-xs text-muted-foreground">Pending + in progress</div>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Pending</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-bold">{stats.pending}</div>
                            <div className="text-xs text-muted-foreground">Awaiting start</div>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-bold">{stats.inProgress}</div>
                            <div className="text-xs text-muted-foreground">Being worked on</div>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Completed</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-bold">{stats.completed}</div>
                            <div className="text-xs text-muted-foreground">All time</div>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Car className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> Active Service Requests
                    </h2>
                    <Button asChild variant="ghost" className="gap-2">
                        <Link to="/dashboard/staff/services">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {loading ? (
                    <div className="grid gap-3">
                        <div className="h-24 rounded-xl border bg-card animate-pulse" />
                        <div className="h-24 rounded-xl border bg-card animate-pulse" />
                    </div>
                ) : activeRequests.length === 0 ? (
                    <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                        <p className="font-medium text-foreground">No active service requests</p>
                        <p className="mt-1 text-sm text-muted-foreground">Create a new request to get started.</p>
                        <Button asChild className="mt-5 gap-2">
                            <Link to="/dashboard/staff/services">
                                <Plus className="h-4 w-4" />
                                Create service request
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {activeRequests.map((service) => (
                            <div key={service._id} className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    <div className="space-y-2 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="capitalize">{service.serviceType}</Badge>
                                            <Badge variant="outline" className={getStatusColor(service.status)}>
                                                {service.status.toUpperCase()}
                                            </Badge>
                                            {service.scheduledDate && (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(service.scheduledDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg truncate">{service.vehicle.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3" />
                                                <span>{service.customer.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Car className="w-3 h-3" />
                                                <span>{service.vehicle.brand}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        {service.status === 'pending' && (
                                            <Button size="sm" onClick={() => updateServiceStatus(service._id, 'in-progress')} className="gap-2">
                                                <Wrench className="h-4 w-4" />
                                                Start
                                            </Button>
                                        )}
                                        {service.status === 'in-progress' && (
                                            <Button size="sm" onClick={() => updateServiceStatus(service._id, 'completed')} className="bg-green-600 hover:bg-green-700">
                                                Complete
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateServiceStatus(service._id, 'cancelled')}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
