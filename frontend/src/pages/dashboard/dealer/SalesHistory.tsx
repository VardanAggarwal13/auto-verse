import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Car } from "lucide-react";
import PageLoader from "@/components/ui/page-loader";

interface Sale {
    _id: string;
    title: string;
    brand: string;
    model: string;
    price: number;
    updatedAt: string;
}

const SalesHistory = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                // Fetch vehicles with status 'sold'
                const response = await apiClient.get("/vehicles/dealer");
                const soldVehicles = response.data.filter((v: any) => v.status === 'sold');
                setSales(soldVehicles);
            } catch (error) {
                console.error("Failed to fetch sales history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.price, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold">Sales History</h1>
                    <p className="text-muted-foreground">Track your completed vehicle sales and revenue.</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-right">
                    <p className="text-xs font-semibold uppercase text-primary mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-primary">${totalRevenue.toLocaleString()}</p>
                </div>
            </div>

            {loading ? (
                <PageLoader title="Loading sales history" subtitle="Fetching completed sales..." />
            ) : sales.length === 0 ? (
                <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                    No sales recorded yet.
                </div>
            ) : (
                <div className="bg-card rounded-xl border overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/50 text-sm">
                                <th className="p-4 font-medium">Vehicle</th>
                                <th className="p-4 font-medium">Sale Date</th>
                                <th className="p-4 font-medium">Sale Price</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sales.map((sale) => (
                                <tr key={sale._id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                                <Car className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{sale.title}</p>
                                                <p className="text-xs text-muted-foreground">{sale.brand} {sale.model}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            {new Date(sale.updatedAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                                            {sale.price.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/10">
                                            SOLD
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SalesHistory;
