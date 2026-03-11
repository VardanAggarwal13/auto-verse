import { useEffect, useMemo, useState } from "react";
import apiClient from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PageLoader from "@/components/ui/page-loader";
import { toast } from "sonner";
import { Calendar, Car, DollarSign, ExternalLink, ImageUp, Loader2, Pencil, Plus, Search, Trash2, User as UserIcon, X } from "lucide-react";
import { Link } from "react-router-dom";

type Role = "customer" | "dealer" | "admin" | "staff";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

interface Vehicle {
  _id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: "Petrol" | "Diesel" | "Electric" | "Hybrid" | "CNG";
  transmission: "Manual" | "Automatic";
  bodyType: string;
  color: string;
  description: string;
  images: string[];
  features: string[];
  status: "available" | "sold" | "pending";
  isFeatured: boolean;
  seller: {
    _id?: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const statusClass = (status: Vehicle["status"]) => {
  switch (status) {
    case "available":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "sold":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [dealers, setDealers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [sellerId, setSellerId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [mileage, setMileage] = useState<number | "">("");
  const [fuelType, setFuelType] = useState<Vehicle["fuelType"]>("Petrol");
  const [transmission, setTransmission] = useState<Vehicle["transmission"]>("Manual");
  const [bodyType, setBodyType] = useState("");
  const [color, setColor] = useState("");
  const [status, setStatus] = useState<Vehicle["status"]>("available");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imagesCsv, setImagesCsv] = useState("");
  const [featuresCsv, setFeaturesCsv] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get("/admin/vehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const fetchDealers = async () => {
    try {
      const response = await apiClient.get("/admin/users");
      const all: AdminUser[] = response.data;
      setDealers(all.filter((u) => u.role === "dealer"));
    } catch (error) {
      // Not fatal; form will still work without assigning seller.
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchDealers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setSellerId("");
    setTitle("");
    setBrand("");
    setModel("");
    setYear("");
    setPrice("");
    setMileage("");
    setFuelType("Petrol");
    setTransmission("Manual");
    setBodyType("");
    setColor("");
    setStatus("available");
    setIsFeatured(false);
    setImagesCsv("");
    setFeaturesCsv("");
    setDescription("");
    setEditingId(null);
    setFormMode("create");
  };

  const openCreate = () => {
    resetForm();
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    resetForm();
    setFormMode("edit");
    setEditingId(v._id);
    setSellerId((v.seller as any)?._id || "");
    setTitle(v.title || "");
    setBrand(v.brand || "");
    setModel(v.model || "");
    setYear(v.year || "");
    setPrice(v.price || "");
    setMileage(v.mileage || "");
    setFuelType(v.fuelType);
    setTransmission(v.transmission);
    setBodyType(v.bodyType || "");
    setColor(v.color || "");
    setStatus(v.status);
    setIsFeatured(Boolean(v.isFeatured));
    setImagesCsv((v.images || []).join(", "));
    setFeaturesCsv((v.features || []).join(", "));
    setDescription(v.description || "");
    setFormOpen(true);
  };

  const parseCsv = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const currentImages = useMemo(() => parseCsv(imagesCsv), [imagesCsv]);

  const removeImage = (url: string) => {
    const next = currentImages.filter((x) => x !== url);
    setImagesCsv(next.join(", "));
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setImageUploading(true);
    try {
      const fd = new FormData();
      const batch = Array.from(files).slice(0, 6);
      batch.forEach((f) => fd.append("images", f));

      const res = await apiClient.post("/uploads/images", fd);
      const urls: string[] = Array.isArray(res.data?.urls) ? res.data.urls : [];

      if (!urls.length) {
        toast.error("Upload failed: no URLs returned");
        return;
      }

      setImagesCsv((prev) => {
        const existing = prev ? prev.split(",").map((s) => s.trim()).filter(Boolean) : [];
        const merged: string[] = [];
        for (const u of [...existing, ...urls]) {
          if (!merged.includes(u)) merged.push(u);
        }
        return merged.join(", ");
      });

      toast.success(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded`);
      if (files.length > batch.length) {
        toast.message("Only the first 6 images were uploaded.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload images");
    } finally {
      setImageUploading(false);
    }
  };

  const saveVehicle = async () => {
    if (!title.trim() || !brand.trim() || !model.trim() || !year || !price || !mileage || !bodyType.trim() || !color.trim() || !description.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload: any = {
      sellerId: sellerId || undefined,
      title: title.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      fuelType,
      transmission,
      bodyType: bodyType.trim(),
      color: color.trim(),
      status,
      isFeatured,
      images: parseCsv(imagesCsv),
      features: parseCsv(featuresCsv),
      description: description.trim(),
    };

    setSaving(true);
    try {
      if (formMode === "create") {
        const res = await apiClient.post("/admin/vehicles", payload);
        toast.success("Vehicle created");
        setVehicles((prev) => [res.data, ...prev]);
      } else if (editingId) {
        const res = await apiClient.patch(`/admin/vehicles/${editingId}`, payload);
        toast.success("Vehicle updated");
        setVehicles((prev) => prev.map((x) => (x._id === editingId ? res.data : x)));
      }
      setFormOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!window.confirm("Remove this vehicle listing?")) return;
    try {
      await apiClient.delete(`/admin/vehicles/${id}`);
      toast.success("Vehicle removed");
      setVehicles((prev) => prev.filter((v) => v._id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const filteredVehicles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) => {
      const sellerName = v.seller?.name || "";
      const sellerEmail = v.seller?.email || "";
      return (
        v.title.toLowerCase().includes(q) ||
        `${v.brand} ${v.model}`.toLowerCase().includes(q) ||
        v.status.toLowerCase().includes(q) ||
        sellerName.toLowerCase().includes(q) ||
        sellerEmail.toLowerCase().includes(q)
      );
    });
  }, [vehicles, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Vehicle Management</h1>
          <p className="text-muted-foreground">Monitor and manage all vehicle listings across the platform.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vehicle, seller, status..." className="pl-9 w-full sm:w-80" />
          </div>

          <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{formMode === "create" ? "Add vehicle" : "Edit vehicle"}</DialogTitle>
                <DialogDescription>
                  Create or update a vehicle listing. Assign it to a dealer if needed.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Seller (Dealer)</label>
                  {/* Radix Select does not allow empty string values. */}
                  <Select
                    value={sellerId || "__none__"}
                    onValueChange={(v) => setSellerId(v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional: assign to a dealer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No assignment</SelectItem>
                      {dealers.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.name} ({d.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as Vehicle["status"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2022 Honda City ZX CVT" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Brand *</label>
                  <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Honda" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Model *</label>
                  <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. City" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Year *</label>
                  <Input value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")} inputMode="numeric" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Price *</label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")} inputMode="numeric" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Mileage *</label>
                  <Input value={mileage} onChange={(e) => setMileage(e.target.value ? Number(e.target.value) : "")} inputMode="numeric" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Fuel type *</label>
                  <Select value={fuelType} onValueChange={(v) => setFuelType(v as Vehicle["fuelType"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="CNG">CNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Transmission *</label>
                  <Select value={transmission} onValueChange={(v) => setTransmission(v as Vehicle["transmission"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Body type *</label>
                  <Input value={bodyType} onChange={(e) => setBodyType(e.target.value)} placeholder="e.g. Sedan" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Color *</label>
                  <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. White" />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-medium">Images</label>
                    <span className="text-xs text-muted-foreground">Upload or paste URLs (optional)</span>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                      <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <ImageUp className="h-4 w-4" />
                        <span>Upload images</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            uploadImages(e.target.files);
                            e.currentTarget.value = "";
                          }}
                          disabled={imageUploading}
                        />
                      </label>

                      {imageUploading && (
                        <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                        </div>
                      )}
                    </div>

                    <Input
                      value={imagesCsv}
                      onChange={(e) => setImagesCsv(e.target.value)}
                      placeholder="Or paste image URLs, comma-separated"
                    />

                    {currentImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {currentImages.map((url, idx) => (
                          <div key={`${url}-${idx}`} className="relative overflow-hidden rounded-lg border bg-background">
                            <img
                              src={url}
                              alt="Vehicle"
                              className="h-16 w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 rounded-md bg-background/80 hover:bg-background border p-1"
                              title="Remove image"
                              onClick={() => removeImage(url)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <label className="text-sm font-medium">Features (comma-separated)</label>
                  <Input value={featuresCsv} onChange={(e) => setFeaturesCsv(e.target.value)} placeholder="ABS, Airbags, Sunroof..." />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Write a clear description..." />
                </div>

              </div>

              <div className="sticky bottom-0 -mx-6 mt-4 border-t bg-background/95 backdrop-blur px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="featured" className="flex items-center gap-2 text-sm text-muted-foreground select-none">
                  <input
                    id="featured"
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  Featured listing
                </label>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button onClick={saveVehicle} disabled={saving}>
                    {saving ? "Saving..." : formMode === "create" ? "Create vehicle" : "Save changes"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <PageLoader title="Loading vehicles" subtitle="Fetching listings..." />
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Seller</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVehicles.map((v) => (
                <tr key={v._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Car className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">{v.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.brand} {v.model} - {v.year}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" /> {new Date(v.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-3 h-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{v.seller?.name || "Unknown"}</p>
                        <p className="text-[10px] text-muted-foreground">{v.seller?.email || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 font-bold">
                      <DollarSign className="w-3 h-3" />
                      {Number(v.price).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={`capitalize ${statusClass(v.status)}`}>
                      {v.status}
                    </Badge>
                    {v.isFeatured && <span className="ml-2 text-[10px] text-muted-foreground">Featured</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button asChild size="icon" variant="ghost" className="h-8 w-8" title="View on site">
                        <Link to={`/cars/${v._id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(v)} className="h-8 w-8" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteVehicle(v._id)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredVehicles.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">No vehicles found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
