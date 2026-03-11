import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, User, Check, X } from "lucide-react";
import PageLoader from "@/components/ui/page-loader";

interface Booking {
    _id: string;
    vehicle: {
        title: string;
        brand: string;
    };
    customer: {
        name: string;
        email: string;
    };
    bookingDate: string;
    timeSlot: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const BookingRequests = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const response = await apiClient.get("/bookings/received");
            setBookings(response.data);
        } catch (error) {
            console.error("Failed to fetch received bookings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await apiClient.patch(`/bookings/${id}`, { status: newStatus });
            toast.success(`Booking ${newStatus}`);
            fetchBookings();
        } catch (error) {
            toast.error("Failed to update booking");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-display font-bold mb-6">Test Drive Requests</h1>
            {loading ? (
                <PageLoader title="Loading requests" subtitle="Fetching test drive requests..." />
            ) : bookings.length === 0 ? (
                <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                    No test drive requests received yet.
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-card p-6 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-xl">{booking.vehicle.title}</h3>
                                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                                        {booking.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="w-4 h-4" />
                                        <span>{booking.customer.name} ({booking.customer.email})</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{booking.timeSlot}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {booking.status === 'pending' && (
                                    <>
                                        <Button variant="default" size="sm" onClick={() => handleStatusUpdate(booking._id, 'confirmed')} className="gap-2">
                                            <Check className="w-4 h-4" /> Confirm
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(booking._id, 'cancelled')} className="text-destructive border-destructive/20 hover:bg-destructive/10 gap-2">
                                            <X className="w-4 h-4" /> Reject
                                        </Button>
                                    </>
                                )}
                                {booking.status === 'confirmed' && (
                                    <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(booking._id, 'completed')} className="gap-2">
                                        <Check className="w-4 h-4" /> Mark Completed
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingRequests;
