import { useEffect, useMemo, useState } from "react";
import apiClient from "@/api/apiClient";
import PageLoader from "@/components/ui/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed";

const OrdersReceived = () => {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/orders/received");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error("Failed to fetch received orders", error);
      toast.error(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === "paid").reduce((acc, o) => acc + Number(o.amount || 0), 0);
    return { count: orders.length, paidRevenue: paid };
  }, [orders]);

  const updateOrder = async (id: string, patch: Partial<{ orderStatus: OrderStatus; paymentStatus: PaymentStatus }>) => {
    setUpdatingId(id);
    try {
      await apiClient.patch(`/orders/${id}`, patch);
      toast.success("Order updated");
      await fetchOrders();
    } catch (error: any) {
      console.error("Failed to update order", error);
      toast.error(error?.response?.data?.message || "Failed to update order");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <PageLoader title="Loading orders" subtitle="Fetching customer orders..." variant="spinner" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold">Orders Received</h1>
          <p className="text-muted-foreground">Track and update customer orders for your inventory.</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Paid revenue</p>
          <p className="text-2xl font-bold">${totals.paidRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{totals.count} total order(s)</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">No orders received yet.</div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{o?.vehicle?.title || "Vehicle"}</p>
                    <Badge variant="outline" className="capitalize">
                      {String(o?.orderStatus || "pending")}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {String(o?.paymentStatus || "pending")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customer: {o?.customer?.name || "-"} ({o?.customer?.email || "-"})
                  </p>
                  <p className="text-xs text-muted-foreground">{o?.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Amount</p>
                  <p className="text-2xl font-bold">${Number(o?.amount || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Order status</p>
                  <Select
                    value={String(o?.orderStatus || "pending")}
                    onValueChange={(value) => updateOrder(o._id, { orderStatus: value as OrderStatus })}
                    disabled={updatingId === o._id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Order status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Payment status</p>
                  <Select
                    value={String(o?.paymentStatus || "pending")}
                    onValueChange={(value) => updateOrder(o._id, { paymentStatus: value as PaymentStatus })}
                    disabled={updatingId === o._id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 md:justify-end">
                  <Button variant="outline" onClick={fetchOrders} disabled={updatingId === o._id}>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersReceived;

