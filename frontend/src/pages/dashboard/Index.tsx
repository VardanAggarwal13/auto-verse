import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/api/apiClient";
import { ArrowRight, Bell, Calendar, Heart, MessageSquare, Package, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type VehicleLite = { _id: string; title: string; brand?: string; images?: string[] };
type Inquiry = { _id: string; createdAt?: string; status?: string; vehicle?: VehicleLite };
type Booking = { _id: string; bookingDate?: string; timeSlot?: string; status?: string; vehicle?: VehicleLite };
type Order = { _id: string; createdAt?: string; orderStatus?: string; paymentStatus?: string; vehicle?: VehicleLite; amount?: number };
type Notification = { _id: string; createdAt?: string; read?: boolean; title?: string; message?: string; type?: string; link?: string };

const DashboardIndex = () => {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    if (!user) return null;

    if (user.role === "dealer") return <Navigate to="/dashboard/dealer" replace />;
    if (user.role === "admin") return <Navigate to="/dashboard/admin" replace />;
    if (user.role === "staff") return <Navigate to="/dashboard/staff" replace />;

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const results = await Promise.allSettled([
                    apiClient.get("/inquiries/my"),
                    apiClient.get("/bookings/my"),
                    apiClient.get("/orders/my"),
                    apiClient.get("/users/wishlist"),
                    apiClient.get("/notifications"),
                ]);

                if (cancelled) return;

                const [inq, bok, ord, wish, noti] = results;
                if (inq.status === "fulfilled") setInquiries(inq.value.data || []);
                if (bok.status === "fulfilled") setBookings(bok.value.data || []);
                if (ord.status === "fulfilled") setOrders(ord.value.data || []);
                if (wish.status === "fulfilled") setWishlist(wish.value.data || []);
                if (noti.status === "fulfilled") setNotifications(noti.value.data || []);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const unreadNotifications = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

    const upcomingBookings = useMemo(() => {
        const now = Date.now();
        return bookings
            .filter((b) => {
                if (!b.bookingDate) return false;
                const t = new Date(b.bookingDate).getTime();
                return Number.isFinite(t) && t >= now && b.status !== "cancelled";
            })
            .sort((a, b) => new Date(a.bookingDate || 0).getTime() - new Date(b.bookingDate || 0).getTime())
            .slice(0, 3);
    }, [bookings]);

    const recentActivity = useMemo(() => {
        const items: Array<{ key: string; when: number; label: string; href: string; badge?: string }> = [];

        for (const i of inquiries.slice(0, 5)) {
            const t = new Date((i as any).createdAt || 0).getTime();
            items.push({
                key: `inq:${i._id}`,
                when: Number.isFinite(t) ? t : 0,
                label: `Inquiry sent: ${i.vehicle?.title || "Vehicle"}`,
                href: "/dashboard/inquiries",
                badge: i.status ? String(i.status) : undefined,
            });
        }
        for (const b of bookings.slice(0, 5)) {
            const t = new Date((b as any).createdAt || b.bookingDate || 0).getTime();
            items.push({
                key: `bok:${b._id}`,
                when: Number.isFinite(t) ? t : 0,
                label: `Test drive: ${b.vehicle?.title || "Vehicle"}`,
                href: "/dashboard/bookings",
                badge: b.status ? String(b.status) : undefined,
            });
        }
        for (const o of orders.slice(0, 5)) {
            const t = new Date((o as any).createdAt || 0).getTime();
            items.push({
                key: `ord:${o._id}`,
                when: Number.isFinite(t) ? t : 0,
                label: `Order: ${o.vehicle?.title || "Vehicle"}`,
                href: "/dashboard/orders",
                badge: o.orderStatus ? String(o.orderStatus) : undefined,
            });
        }
        for (const n of notifications.slice(0, 5)) {
            const t = new Date((n as any).createdAt || 0).getTime();
            items.push({
                key: `not:${n._id}`,
                when: Number.isFinite(t) ? t : 0,
                label: n.title || n.message || "Notification",
                href: "/dashboard/notifications",
                badge: n.read ? "read" : "new",
            });
        }

        return items
            .sort((a, b) => b.when - a.when)
            .slice(0, 6);
    }, [inquiries, bookings, orders, notifications]);

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-2xl border bg-card">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.18),transparent_40%),radial-gradient(circle_at_90%_30%,hsl(var(--secondary)/0.22),transparent_45%),radial-gradient(circle_at_40%_90%,hsl(var(--primary)/0.10),transparent_40%)]" />
                <div className="relative p-6 sm:p-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        Your AutoVerse dashboard
                    </div>
                    <h1 className="mt-4 text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                        Welcome back, {user.name}!
                    </h1>
                    <p className="mt-2 text-muted-foreground max-w-2xl">
                        Pick up where you left off. Browse listings, track inquiries, and manage your profile in one place.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Button asChild className="sm:w-auto">
                            <Link to="/cars">
                                Explore cars <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="sm:w-auto">
                            <Link to="/dashboard/profile">Update profile</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Account</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end justify-between gap-3">
                        <div>
                            <div className="text-3xl font-bold text-primary">Active</div>
                            <div className="mt-1 text-xs text-muted-foreground">Role: <span className="capitalize text-foreground">{user.role}</span></div>
                        </div>
                        <div className="hidden sm:block text-right text-xs text-muted-foreground max-w-[16rem]">
                            Ready to book test drives and contact dealers.
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                            Inquiries
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? "…" : inquiries.length}</div>
                        <Button asChild variant="ghost" className="mt-2 px-0 justify-start">
                            <Link to="/dashboard/inquiries">View inquiries <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                            Test Drives
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? "…" : bookings.length}</div>
                        <Button asChild variant="ghost" className="mt-2 px-0 justify-start">
                            <Link to="/dashboard/bookings">View bookings <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                            Wishlist
                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? "…" : wishlist.length}</div>
                        <Button asChild variant="ghost" className="mt-2 px-0 justify-start">
                            <Link to="/dashboard/wishlist">View wishlist <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                            Recent Activity
                            <Button asChild variant="ghost" className="h-8 px-2">
                                <Link to="/dashboard/notifications">Notifications <Bell className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-10 rounded-md bg-muted animate-pulse" />
                                <div className="h-10 rounded-md bg-muted animate-pulse" />
                                <div className="h-10 rounded-md bg-muted animate-pulse" />
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground text-center">
                                No activity yet. Start by browsing cars or booking a test drive.
                            </div>
                        ) : (
                            <div className="divide-y rounded-xl border">
                                {recentActivity.map((item) => (
                                    <Link
                                        key={item.key}
                                        to={item.href}
                                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(item.when || Date.now()).toLocaleString()}</p>
                                        </div>
                                        {item.badge && (
                                            <Badge variant="outline" className="capitalize">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                            Next Up
                            <Badge variant="outline" className="gap-1">
                                <Bell className="h-3.5 w-3.5" />
                                {loading ? "…" : unreadNotifications}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-xl border p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Orders</p>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="mt-1 text-2xl font-bold">{loading ? "…" : orders.length}</p>
                            <Button asChild variant="ghost" className="mt-2 px-0 justify-start">
                                <Link to="/dashboard/orders">View orders <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>

                        <div className="rounded-xl border p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Upcoming test drives</p>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                            {loading ? (
                                <div className="mt-3 space-y-2">
                                    <div className="h-8 rounded-md bg-muted animate-pulse" />
                                    <div className="h-8 rounded-md bg-muted animate-pulse" />
                                </div>
                            ) : upcomingBookings.length === 0 ? (
                                <p className="mt-2 text-sm text-muted-foreground">No upcoming bookings.</p>
                            ) : (
                                <div className="mt-3 space-y-2">
                                    {upcomingBookings.map((b) => (
                                        <div key={b._id} className="flex items-center justify-between gap-3 text-sm">
                                            <span className="truncate">{b.vehicle?.title || "Vehicle"}</span>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(b.bookingDate || Date.now()).toLocaleDateString()}{b.timeSlot ? `, ${b.timeSlot}` : ""}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                            <Button asChild variant="secondary" className="justify-between">
                                <Link to="/cars">Browse listings <ArrowRight className="h-4 w-4" /></Link>
                            </Button>
                            <Button asChild variant="ghost" className="justify-between">
                                <Link to="/dashboard/notifications">View notifications <ArrowRight className="h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardIndex;
