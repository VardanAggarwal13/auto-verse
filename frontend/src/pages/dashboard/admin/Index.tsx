import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Users, Car, MessageSquare, Calendar, CreditCard, ShoppingBag, ArrowUpRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PageLoader from "@/components/ui/page-loader";

const AdminDashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const response = await apiClient.get("/admin/stats");
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminStats();
    }, []);

    const stats = [
        { label: "Total Users", value: data?.stats.totalUsers || "0", icon: Users, color: "text-blue-500", trend: "+12%" },
        { label: "Active Dealers", value: data?.stats.totalDealers || "0", icon: Car, color: "text-purple-500", trend: "+5%" },
        { label: "Total Vehicles", value: data?.stats.totalVehicles || "0", icon: Car, color: "text-green-500", trend: "+18%" },
        { label: "Total Revenue", value: `$${(data?.stats.totalRevenue / 1000000 || 0).toFixed(1)}M`, icon: CreditCard, color: "text-orange-500", trend: "+24%" },
    ];

    if (loading) return <PageLoader title="Loading admin dashboard" subtitle="Fetching system overview..." variant="spinner" />;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold">System Overview</h1>
                    <p className="text-muted-foreground">Monitor system-wide activity and performance.</p>
                </div>
                <Badge variant="outline" className="gap-2 py-1 px-3">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Live Updates</span>
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-card p-6 rounded-xl border shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-green-500 flex items-center gap-1">
                                {stat.trend} <ArrowUpRight className="w-3 h-3" />
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-bold font-display">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card p-6 rounded-xl border space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" /> Recent Orders
                        </h3>
                        <button className="text-sm text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {data?.recentOrders.length > 0 ? (
                            data.recentOrders.map((order: any) => (
                                <div key={order._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center font-bold text-xs uppercase">
                                            {order.customer.name.slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{order.vehicle.title}</p>
                                            <p className="text-xs text-muted-foreground">By {order.customer.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <p className="font-bold text-sm">${order.amount.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No recent orders.</p>
                        )}
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border space-y-4">
                    <h3 className="font-bold">New Registrations</h3>
                    <div className="space-y-4">
                        {data?.recentUsers.length > 0 ? (
                            data.recentUsers.map((user: any) => (
                                <div key={user._id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                        {user.name.slice(0, 1)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-auto">NEW</Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No new registrations.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
