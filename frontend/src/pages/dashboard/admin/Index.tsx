import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Users, Car, MessageSquare, Calendar, CreditCard, ShoppingBag, ArrowUpRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PageLoader from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                setError(null);
                const response = await apiClient.get("/admin/stats");
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
                setError((error as any)?.response?.data?.message || "Failed to load admin dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchAdminStats();
    }, []);

    const retry = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get("/admin/stats");
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
            setError((error as any)?.response?.data?.message || "Failed to load admin dashboard");
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: "Total Users", value: data?.stats.totalUsers || "0", icon: Users, trend: "+12%" },
        { label: "Active Dealers", value: data?.stats.totalDealers || "0", icon: Car, trend: "+5%" },
        { label: "Total Vehicles", value: data?.stats.totalVehicles || "0", icon: Car, trend: "+18%" },
        { label: "Total Revenue", value: `$${(data?.stats.totalRevenue / 1000000 || 0).toFixed(1)}M`, icon: CreditCard, trend: "+24%" },
    ];

    if (loading) return <PageLoader title="Loading admin dashboard" subtitle="Fetching system overview..." variant="spinner" />;

    const recentOrders = Array.isArray(data?.recentOrders) ? data.recentOrders : [];
    const recentUsers = Array.isArray(data?.recentUsers) ? data.recentUsers : [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold">System Overview</h1>
                    <p className="text-muted-foreground">Monitor system-wide activity and performance.</p>
                </div>
                <Badge variant="outline" className="gap-2 py-1 px-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>Live Updates</span>
                </Badge>
            </div>

            {error ? (
                <Card className="card-elevated">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="font-semibold">Couldn’t load admin data</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                        <Button variant="outline" onClick={retry}>Retry</Button>
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="card-elevated">
                        <CardContent className="p-6 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    {stat.trend} <ArrowUpRight className="w-3 h-3" />
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-bold font-display">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="card-elevated lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="font-bold flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" /> Recent Orders
                        </CardTitle>
                        <Button variant="ghost" className="h-8 px-2 text-primary hover:text-primary" disabled>
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order: any) => {
                                const customerName = String(order?.customer?.name || "Unknown");
                                const customerInitials = customerName.slice(0, 2).toUpperCase();
                                const vehicleTitle = String(order?.vehicle?.title || "Vehicle");
                                const amount = Number(order?.amount || 0);
                                const createdAt = order?.createdAt ? new Date(order.createdAt) : null;

                                return (
                                <div key={order._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border/60 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                                            {customerInitials}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{vehicleTitle}</p>
                                            <p className="text-xs text-muted-foreground">By {customerName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <p className="font-bold text-sm">${amount.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">{createdAt ? createdAt.toLocaleDateString() : "—"}</p>
                                    </div>
                                </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-muted-foreground">No recent orders.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="font-bold">New Registrations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentUsers.length > 0 ? (
                            recentUsers.map((user: any) => {
                                const name = String(user?.name || "Unknown");
                                const role = String(user?.role || "user");
                                const initial = name.slice(0, 1).toUpperCase();
                                return (
                                <div key={user._id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                        {initial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{name}</p>
                                        <p className="text-xs text-muted-foreground truncate capitalize">{role}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-auto">NEW</Badge>
                                </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-muted-foreground">No new registrations.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
