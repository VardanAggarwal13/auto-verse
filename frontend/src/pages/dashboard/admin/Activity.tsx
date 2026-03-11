import { useEffect, useMemo, useState } from "react";
import apiClient from "@/api/apiClient";
import PageLoader from "@/components/ui/page-loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type InquiryStatus = "pending" | "responded" | "closed";
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed";

const AdminActivity = () => {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"inquiries" | "bookings" | "orders">("inquiries");

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inq, bok, ord] = await Promise.all([
        apiClient.get("/admin/inquiries"),
        apiClient.get("/admin/bookings"),
        apiClient.get("/admin/orders"),
      ]);
      setInquiries(Array.isArray(inq.data) ? inq.data : []);
      setBookings(Array.isArray(bok.data) ? bok.data : []);
      setOrders(Array.isArray(ord.data) ? ord.data : []);
    } catch (error: any) {
      console.error("Failed to fetch admin activity", error);
      toast.error(error?.response?.data?.message || "Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(
    () => ({
      inquiries: inquiries.length,
      bookings: bookings.length,
      orders: orders.length,
    }),
    [inquiries.length, bookings.length, orders.length],
  );

  if (loading) return <PageLoader title="Loading activity" subtitle="Fetching inquiries, bookings, and orders..." variant="spinner" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Activity</h1>
        <p className="text-muted-foreground">View platform-wide inquiries, test drives, and orders.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inquiries" className="gap-2">
            Inquiries <Badge variant="secondary">{counts.inquiries}</Badge>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-2">
            Test Drives <Badge variant="secondary">{counts.bookings}</Badge>
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            Orders <Badge variant="secondary">{counts.orders}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inquiries">
          {inquiries.length === 0 ? (
            <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">No inquiries yet.</div>
          ) : (
            <div className="grid gap-4">
              {inquiries.map((i) => (
                <div key={i._id} className="bg-card p-5 rounded-xl border shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold">{i?.vehicle?.title || "Vehicle"}</p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {i?.customer?.name || "-"} ({i?.customer?.email || "-"})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dealer: {i?.dealer?.name || "-"} ({i?.dealer?.email || "-"})
                      </p>
                      <p className="text-xs text-muted-foreground">{i?.createdAt ? new Date(i.createdAt).toLocaleString() : ""}</p>
                    </div>
                    <Badge variant="outline" className="capitalize w-fit">
                      {String(i?.status || "pending") as InquiryStatus}
                    </Badge>
                  </div>
                  <div className="mt-3 bg-muted/40 rounded-lg p-3 text-sm italic">"{i?.message || ""}"</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          {bookings.length === 0 ? (
            <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">No test drive requests yet.</div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((b) => (
                <div key={b._id} className="bg-card p-5 rounded-xl border shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold">{b?.vehicle?.title || "Vehicle"}</p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {b?.customer?.name || "-"} ({b?.customer?.email || "-"})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dealer: {b?.dealer?.name || "-"} ({b?.dealer?.email || "-"})
                      </p>
                      <p className="text-sm">
                        {b?.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : "-"} • {b?.timeSlot || "-"}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize w-fit">
                      {String(b?.status || "pending") as BookingStatus}
                    </Badge>
                  </div>
                  {b?.message ? <div className="mt-3 bg-muted/40 rounded-lg p-3 text-sm italic">"{b.message}"</div> : null}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          {orders.length === 0 ? (
            <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">No orders yet.</div>
          ) : (
            <div className="grid gap-4">
              {orders.map((o) => (
                <div key={o._id} className="bg-card p-5 rounded-xl border shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold">{o?.vehicle?.title || "Vehicle"}</p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {o?.customer?.name || "-"} ({o?.customer?.email || "-"})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dealer: {o?.dealer?.name || "-"} ({o?.dealer?.email || "-"})
                      </p>
                      <p className="text-xs text-muted-foreground">{o?.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</p>
                      <p className="text-sm font-semibold">${Number(o?.amount || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="capitalize">
                        {String(o?.orderStatus || "pending") as OrderStatus}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {String(o?.paymentStatus || "pending") as PaymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminActivity;

