import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/api/apiClient";
import { Car, MessageSquare, Calendar, BarChart3, Clock, User } from "lucide-react";
import PageLoader from "@/components/ui/page-loader";

const DealerDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get("/dealer/stats");
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch dealer stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        { label: "Listed Cars", value: data?.stats.totalVehicles || "0", icon: Car, color: "text-blue-500" },
        { label: "Inquiries", value: data?.stats.totalInquiries || "0", icon: MessageSquare, color: "text-green-500" },
        { label: "Test Drives", value: data?.stats.totalBookings || "0", icon: Calendar, color: "text-purple-500" },
        { label: "Total Sales", value: `$${(data?.stats.totalSales / 1000 || 0).toFixed(1)}k`, icon: BarChart3, color: "text-orange-500" },
    ];

    if (loading) return <PageLoader title="Loading dealer dashboard" subtitle="Fetching your overview..." variant="spinner" />;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Dealer Overview</h1>
                <p className="text-muted-foreground">Manage your inventory and respond to customer inquiries.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-xl border">
                    <h3 className="font-bold mb-4">Recent Inquiries</h3>
                    {data?.recentInquiries.length > 0 ? (
                        <div className="space-y-4">
                            {data.recentInquiries.map((inquiry: any) => (
                                <div key={inquiry._id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-semibold text-sm">{inquiry.vehicle.title}</p>
                                        <p className="text-xs text-muted-foreground">From: {inquiry.customer.name}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No recent inquiries to show.</p>
                    )}
                </div>
                <div className="bg-card p-6 rounded-xl border">
                    <h3 className="font-bold mb-4">Upcoming Test Drives</h3>
                    {data?.upcomingBookings.length > 0 ? (
                        <div className="space-y-4">
                            {data.upcomingBookings.map((booking: any) => (
                                <div key={booking._id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-semibold text-sm">{booking.vehicle.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-xs">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                            <Clock className="w-3 h-3 text-muted-foreground ml-1" />
                                            <span className="text-xs">{booking.timeSlot}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <User className="w-3 h-3" />
                                        <span>{booking.customer.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No upcoming test drives.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DealerDashboard;
