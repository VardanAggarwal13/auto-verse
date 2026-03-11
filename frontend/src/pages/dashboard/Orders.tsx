import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Calendar, DollarSign, Package } from "lucide-react";
import PageLoader from "@/components/ui/page-loader";

interface Order {
    _id: string;
    vehicle: {
        title: string;
        brand: string;
    };
    dealer: {
        name: string;
    };
    amount: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
}

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await apiClient.get("/orders/my");
                setOrders(response.data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-display font-bold mb-6">My Orders</h1>
            {loading ? (
                <PageLoader title="Loading orders" subtitle="Fetching your purchases..." />
            ) : orders.length === 0 ? (
                <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                    You haven't placed any orders yet.
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-semibold">
                                        <Package className="w-3 h-3" />
                                        <span>Order #{order._id.slice(-8)}</span>
                                    </div>
                                    <h3 className="font-bold text-xl">{order.vehicle.title}</h3>
                                    <p className="text-sm text-muted-foreground">Dealer: {order.dealer.name}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="outline" className={getStatusColor(order.orderStatus)}>
                                        {order.orderStatus.toUpperCase()}
                                    </Badge>
                                    <p className="text-2xl font-bold font-display">${order.amount.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Order Date:</span>
                                    <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Payment:</span>
                                    <Badge variant="secondary" className="capitalize">{order.paymentStatus}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Items:</span>
                                    <span className="font-medium">1 Vehicle</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
