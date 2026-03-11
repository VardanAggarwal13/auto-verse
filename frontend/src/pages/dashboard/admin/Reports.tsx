import { useMemo, useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { BarChart3, TrendingUp, Users, DollarSign, PieChart } from "lucide-react";
import { toast } from "sonner";
import PageLoader from "@/components/ui/page-loader";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const AdminReports = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // In a real app, we'd have a specific endpoint for complex reports
                // For now, we'll simulate fetching some data
                const response = await apiClient.get("/admin/stats");
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch reports", error);
                toast.error("Failed to load reports data");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const totals = stats?.stats || {};

    const formatCurrency = (n: any) => {
        const v = Number(n || 0);
        try {
            return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
        } catch {
            return `$${v.toLocaleString()}`;
        }
    };

    const salesData = useMemo(() => {
        const orders = Array.isArray(stats?.recentOrders) ? stats.recentOrders.slice() : [];
        orders.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return orders.map((o: any) => ({
            date: new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "2-digit" }),
            amount: Number(o.amount || 0),
        }));
    }, [stats]);

    const reportCards = [
        { label: "Total Revenue", value: formatCurrency(totals.totalRevenue), change: "Live", icon: DollarSign, color: "text-green-500" },
        { label: "Total Accounts", value: (totals.totalAccounts ?? 0).toLocaleString(), change: "Live", icon: Users, color: "text-blue-500" },
        { label: "Vehicle Listings", value: (totals.totalVehicles ?? 0).toLocaleString(), change: "Live", icon: BarChart3, color: "text-orange-500" },
        { label: "Total Orders", value: (totals.totalOrders ?? 0).toLocaleString(), change: "Live", icon: TrendingUp, color: "text-purple-500" },
    ];

    if (loading) return <PageLoader title="Loading reports" subtitle="Fetching analytics..." variant="spinner" />;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Analytics & Reports</h1>
                <p className="text-muted-foreground">Comprehensive insights into platform performance and user activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reportCards.map((card) => (
                    <div key={card.label} className="bg-card p-6 rounded-xl border shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{card.change}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                        <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card p-6 rounded-xl border">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold">Sales Performance</h3>
                        <PieChart className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="h-64">
                        {salesData.length === 0 ? (
                            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
                                <p className="text-muted-foreground text-sm text-center px-4">
                                    No recent orders yet. Once orders are created, revenue trends will appear here.
                                </p>
                            </div>
                        ) : (
                            <ChartContainer
                                className="h-full w-full"
                                config={{
                                    amount: { label: "Revenue", color: "hsl(var(--primary))" },
                                }}
                            >
                                <AreaChart data={salesData} margin={{ left: 12, right: 12 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} width={44} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="var(--color-amount)"
                                        fill="var(--color-amount)"
                                        fillOpacity={0.15}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        )}
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border">
                    <h3 className="font-bold mb-6">User Distribution</h3>
                    <div className="space-y-4">
                        {[
                            { role: "Customers", count: Number(totals.totalUsers || 0), color: "bg-blue-500" },
                            { role: "Dealers", count: Number(totals.totalDealers || 0), color: "bg-green-500" },
                            { role: "Staff", count: Number(totals.totalStaff || 0), color: "bg-orange-500" },
                            { role: "Admins", count: Number(totals.totalAdmins || 0), color: "bg-red-500" },
                        ].map((item) => {
                            const total = Number(totals.totalAccounts || 0) || 1;
                            const percent = Math.round((item.count / total) * 100);
                            return (
                            <div key={item.role}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{item.role}</span>
                                    <span className="font-medium">{item.count}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${percent}%` }} />
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
