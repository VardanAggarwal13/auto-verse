import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PageLoader from "@/components/ui/page-loader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Inquiry {
    _id: string;
    vehicle: {
        title: string;
        brand: string;
    };
    customer: {
        name: string;
        email: string;
    };
    message: string;
    status: 'pending' | 'responded' | 'closed';
    createdAt: string;
}

const InquiriesReceived = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInquiries = async () => {
        try {
            const response = await apiClient.get("/inquiries/received");
            setInquiries(response.data);
        } catch (error) {
            console.error("Failed to fetch received inquiries", error);
            toast.error("Failed to fetch inquiries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await apiClient.patch(`/inquiries/${id}`, { status: newStatus });
            toast.success("Status updated");
            fetchInquiries(); // Refresh list
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-display font-bold mb-6">Inquiries Received</h1>
            {loading ? (
                <PageLoader title="Loading inquiries" subtitle="Fetching customer messages..." />
            ) : inquiries.length === 0 ? (
                <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                    No inquiries received yet.
                </div>
            ) : (
                <div className="grid gap-4">
                    {inquiries.map((inquiry) => (
                        <div key={inquiry._id} className="bg-card p-6 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold text-lg">{inquiry.vehicle.title}</p>
                                    <Badge variant={inquiry.status === 'pending' ? 'outline' : inquiry.status === 'responded' ? 'default' : 'secondary'}>
                                        {inquiry.status}
                                    </Badge>
                                </div>
                                <p className="text-sm font-medium">Customer: {inquiry.customer.name} ({inquiry.customer.email})</p>
                                <p className="text-xs text-muted-foreground mb-2">{new Date(inquiry.createdAt).toLocaleString()}</p>
                                <div className="bg-muted/50 p-3 rounded-lg text-sm italic">
                                    "{inquiry.message}"
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 min-w-[150px]">
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Update Status</p>
                                <Select
                                    value={inquiry.status}
                                    onValueChange={(value) => handleStatusUpdate(inquiry._id, value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="responded">Responded</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InquiriesReceived;
