import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import PageLoader from "@/components/ui/page-loader";

interface Inquiry {
    _id: string;
    vehicle: {
        title: string;
        brand: string;
    };
    message: string;
    status: 'pending' | 'responded' | 'closed';
    createdAt: string;
}

const MyInquiries = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const response = await apiClient.get("/inquiries/my");
                setInquiries(response.data);
            } catch (error) {
                console.error("Failed to fetch inquiries", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInquiries();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-display font-bold mb-6">My Inquiries</h1>
            {loading ? (
                <PageLoader title="Loading inquiries" subtitle="Fetching your messages..." />
            ) : inquiries.length === 0 ? (
                <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                    You haven't sent any inquiries yet.
                </div>
            ) : (
                <div className="grid gap-4">
                    {inquiries.map((inquiry) => (
                        <div key={inquiry._id} className="bg-card p-6 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <p className="font-bold text-lg">{inquiry.vehicle.title}</p>
                                <p className="text-sm text-muted-foreground">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                                <p className="mt-2 text-sm">{inquiry.message}</p>
                            </div>
                            <Badge variant={inquiry.status === 'pending' ? 'outline' : inquiry.status === 'responded' ? 'default' : 'secondary'}>
                                {inquiry.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyInquiries;
