import { useEffect, useMemo, useState } from "react";
import apiClient from "@/api/apiClient";
import { AlertCircle, Calendar, Clock, Plus, Search, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ServiceType = "maintenance" | "repair" | "inspection" | "customization";
type ServiceStatus = "pending" | "in-progress" | "completed" | "cancelled";

interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface VehicleLite {
  _id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  status: string;
}

interface ServiceRequest {
  _id: string;
  customer: Customer;
  vehicle: { _id: string; title: string; brand: string };
  serviceType: ServiceType;
  description: string;
  status: ServiceStatus;
  scheduledDate?: string;
  createdAt: string;
}

const typeLabel: Record<ServiceType, string> = {
  maintenance: "Maintenance",
  repair: "Repair",
  inspection: "Inspection",
  customization: "Customization",
};

const statusLabel: Record<ServiceStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const StaffServices = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [query, setQuery] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<VehicleLite[]>([]);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("maintenance");
  const [scheduledDate, setScheduledDate] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setCustomerId("");
    setVehicleId("");
    setServiceType("maintenance");
    setScheduledDate("");
    setDescription("");
  };

  const fetchServices = async () => {
    try {
      const response = await apiClient.get("/staff/services");
      setServices(response.data);
    } catch (error) {
      console.error("Failed to fetch services", error);
      toast.error("Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [cRes, vRes] = await Promise.all([apiClient.get("/staff/customers"), apiClient.get("/staff/vehicles")]);
      setCustomers(cRes.data);
      setVehicles(vRes.data);
    } catch (error) {
      console.error("Failed to fetch lookup data", error);
      toast.error("Failed to load customers/vehicles");
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => {
      const customer = `${s.customer?.name || ""} ${s.customer?.email || ""}`.toLowerCase();
      const vehicle = `${s.vehicle?.title || ""} ${s.vehicle?.brand || ""}`.toLowerCase();
      return (
        customer.includes(q) ||
        vehicle.includes(q) ||
        s.serviceType.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
      );
    });
  }, [services, query]);

  const createService = async () => {
    if (!customerId || !vehicleId || !description.trim()) {
      toast.error("Customer, vehicle, and description are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.post("/staff/services", {
        customerId,
        vehicleId,
        serviceType,
        description: description.trim(),
        scheduledDate: scheduledDate || undefined,
      });
      toast.success("Service request created");
      setServices((prev) => [res.data, ...prev]);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create service request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Service Requests</h1>
          <p className="text-muted-foreground">Create and manage vehicle maintenance and service tasks.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services..." className="pl-10" />
          </div>

          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (v) fetchLookups();
              if (!v) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create service request</DialogTitle>
                <DialogDescription>Select the customer and vehicle, then describe the requested service.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Customer *</label>
                  <Select value={customerId || "__none__"} onValueChange={(v) => setCustomerId(v === "__none__" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Select customer</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name} ({c.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Vehicle *</label>
                  <Select value={vehicleId || "__none__"} onValueChange={(v) => setVehicleId(v === "__none__" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Select vehicle</SelectItem>
                      {vehicles.map((v) => (
                        <SelectItem key={v._id} value={v._id}>
                          {v.title} ({v.brand} {v.model} {v.year})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Service type *</label>
                  <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="customization">Customization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Scheduled date</label>
                  <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the service request..." />
                </div>
              </div>

              <div className="sticky bottom-0 -mx-6 mt-4 border-t bg-background/95 backdrop-blur px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={createService} disabled={saving}>
                  {saving ? "Creating..." : "Create service"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">Service Type</th>
                <th className="px-6 py-4 text-sm font-semibold">Vehicle</th>
                <th className="px-6 py-4 text-sm font-semibold">Customer</th>
                <th className="px-6 py-4 text-sm font-semibold">Scheduled</th>
                <th className="px-6 py-4 text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-sm">{typeLabel[s.serviceType]}</td>
                  <td className="px-6 py-4 text-sm">{s.vehicle?.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{s.customer?.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="inline-flex items-center gap-2">
                      {s.status === "completed" ? (
                        <Calendar className="w-4 h-4 text-green-600" />
                      ) : s.status === "in-progress" ? (
                        <Wrench className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-600" />
                      )}
                      <span>{statusLabel[s.status]}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No service requests found.</p>
          </div>
        )}
        {loading && <div className="p-6 text-sm text-muted-foreground">Loading service requests...</div>}
      </div>
    </div>
  );
};

export default StaffServices;

