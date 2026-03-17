import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/ui/page-loader";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Booking {
    _id: string;
    vehicle: {
        title: string;
        brand: string;
    };
    dealer: {
        name: string;
    };
    bookingDate: string;
    timeSlot: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const BookingsPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
    const [nextDate, setNextDate] = useState<Date | undefined>(undefined);
    const [nextTimeSlot, setNextTimeSlot] = useState<string>("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await apiClient.get("/bookings/my");
                setBookings(response.data);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const refreshBookings = async () => {
        const response = await apiClient.get("/bookings/my");
        setBookings(response.data);
    };

    const openReschedule = (booking: Booking) => {
        setActiveBooking(booking);
        setNextDate(new Date(booking.bookingDate));
        setNextTimeSlot(booking.timeSlot || "");
        setRescheduleOpen(true);
    };

    const handleCancel = async (bookingId: string) => {
        try {
            setActionLoadingId(bookingId);
            await apiClient.patch(`/bookings/${bookingId}/cancel`);
            toast.success("Booking cancelled");
            await refreshBookings();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to cancel booking");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReschedule = async () => {
        if (!activeBooking?._id) return;
        if (!nextDate) {
            toast.error("Please select a date");
            return;
        }
        const slot = String(nextTimeSlot || "").trim();
        if (!slot) {
            toast.error("Please enter a time slot");
            return;
        }

        try {
            setActionLoadingId(activeBooking._id);
            await apiClient.patch(`/bookings/${activeBooking._id}/reschedule`, {
                bookingDate: nextDate.toISOString(),
                timeSlot: slot,
            });
            toast.success("Booking rescheduled (set to pending)");
            setRescheduleOpen(false);
            setActiveBooking(null);
            await refreshBookings();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to reschedule booking");
        } finally {
            setActionLoadingId(null);
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
            <h1 className="text-3xl font-display font-bold mb-6">Test Drive Bookings</h1>
            <Dialog
                open={rescheduleOpen}
                onOpenChange={(open) => {
                    setRescheduleOpen(open);
                    if (!open) {
                        setActiveBooking(null);
                        setNextDate(undefined);
                        setNextTimeSlot("");
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reschedule Test Drive</DialogTitle>
                        <DialogDescription>
                            Pick a new date and time slot. Your request will be marked as pending for dealer confirmation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("justify-start text-left font-normal", !nextDate && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {nextDate ? format(nextDate, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={nextDate}
                                        onSelect={setNextDate}
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="timeSlot">Time Slot</Label>
                            <Input
                                id="timeSlot"
                                placeholder="e.g. 10:00 AM"
                                value={nextTimeSlot}
                                onChange={(e) => setNextTimeSlot(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleReschedule}
                            disabled={!activeBooking?._id || actionLoadingId === activeBooking?._id}
                        >
                            {actionLoadingId === activeBooking?._id ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {loading ? (
                <PageLoader title="Loading bookings" subtitle="Fetching your test drives..." />
            ) : bookings.length === 0 ? (
                <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                    You haven't booked any test drives yet.
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-card p-6 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-xl">{booking.vehicle.title}</h3>
                                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                                        {booking.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{new Date(booking.bookingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{booking.timeSlot}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span>{booking.dealer.name}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => openReschedule(booking)}
                                    disabled={booking.status === "cancelled" || booking.status === "completed"}
                                >
                                    Reschedule
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            disabled={
                                                booking.status === "cancelled" ||
                                                booking.status === "completed" ||
                                                actionLoadingId === booking._id
                                            }
                                        >
                                            {actionLoadingId === booking._id ? "Cancelling..." : "Cancel"}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will mark your test drive as cancelled and notify the dealer.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Keep</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleCancel(booking._id)}>
                                                Cancel booking
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default BookingsPage;
