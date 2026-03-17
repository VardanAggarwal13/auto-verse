import { useMemo, useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit, ImageUp, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageLoader from "@/components/ui/page-loader";

interface Vehicle {
    _id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    bodyType: string;
    color: string;
    description: string;
    status: 'available' | 'sold' | 'pending';
    images: string[];
}

type InventoryFormState = {
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number | "";
    mileage: number | "";
    fuelType: string;
    transmission: string;
    bodyType: string;
    color: string;
    description: string;
    images: string; // Comma separated URLs
};

const ManageInventory = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const emptyForm = useMemo(
        (): InventoryFormState => ({
            title: "",
            brand: "",
            model: "",
            year: new Date().getFullYear(),
            price: "",
            mileage: "",
            fuelType: "Petrol",
            transmission: "Manual",
            bodyType: "Sedan",
            color: "",
            description: "",
            images: "", // Comma separated URLs
        }),
        []
    );

    const [formData, setFormData] = useState(emptyForm);

    const openCreateDialog = () => {
        setEditingVehicleId(null);
        setFormData(emptyForm);
        setIsDialogOpen(true);
    };

    const openEditDialog = (vehicle: Vehicle) => {
        setEditingVehicleId(vehicle._id);
        setFormData({
            title: vehicle.title || "",
            brand: vehicle.brand || "",
            model: vehicle.model || "",
            year: vehicle.year || new Date().getFullYear(),
            price: typeof vehicle.price === "number" ? vehicle.price : Number(vehicle.price) || "",
            mileage: typeof vehicle.mileage === "number" ? vehicle.mileage : Number(vehicle.mileage) || "",
            fuelType: vehicle.fuelType || "Petrol",
            transmission: vehicle.transmission || "Manual",
            bodyType: vehicle.bodyType || "Sedan",
            color: vehicle.color || "",
            description: vehicle.description || "",
            images: Array.isArray(vehicle.images) ? vehicle.images.join(", ") : "",
        });
        setIsDialogOpen(true);
    };

    const currentImages = useMemo(() => {
        return formData.images
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }, [formData.images]);

    const removeImage = (url: string) => {
        const next = currentImages.filter((x) => x !== url);
        setFormData((prev) => ({ ...prev, images: next.join(", ") }));
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

            setFormData((prev) => {
                const existing = prev.images
                    ? prev.images.split(",").map((s) => s.trim()).filter(Boolean)
                    : [];
                const merged: string[] = [];
                for (const u of [...existing, ...urls]) {
                    if (!merged.includes(u)) merged.push(u);
                }
                return { ...prev, images: merged.join(", ") };
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

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await apiClient.get("/vehicles/dealer");
            setVehicles(response.data);
        } catch (error) {
            console.error("Failed to fetch vehicles", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this vehicle?")) {
            try {
                await apiClient.delete(`/vehicles/${id}`);
                toast.success("Vehicle deleted successfully");
                fetchVehicles();
            } catch (error) {
                toast.error("Failed to delete vehicle");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                mileage: Number(formData.mileage),
                images: formData.images.split(',').map(url => url.trim()).filter(url => url !== "")
            };

            if (formData.price === "" || formData.mileage === "") {
                toast.error("Please enter price and mileage");
                return;
            }

            if (!Number.isFinite(payload.price) || !Number.isFinite(payload.mileage)) {
                toast.error("Please enter a valid price and mileage");
                return;
            }

            if (editingVehicleId) {
                await apiClient.patch(`/vehicles/${editingVehicleId}`, payload);
                toast.success("Vehicle updated successfully");
            } else {
                await apiClient.post("/vehicles", payload);
                toast.success("Vehicle added successfully");
            }

            setIsDialogOpen(false);
            fetchVehicles();
            setEditingVehicleId(null);
            setFormData(emptyForm);
        } catch (error) {
            console.error("Failed to save vehicle", error);
            toast.error((error as any)?.response?.data?.message || "Failed to save vehicle");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]:
                name === "year"
                    ? Number(value)
                    : name === "price" || name === "mileage"
                      ? value === ""
                          ? ""
                          : Number(value)
                      : value
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold">Manage Inventory</h1>
                    <p className="text-muted-foreground">Add, edit, or remove vehicles from your listings.</p>
                </div>

                <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setEditingVehicleId(null);
                            setFormData(emptyForm);
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={openCreateDialog}>
                            <Plus className="w-4 h-4" /> Add Vehicle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingVehicleId ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="model">Model</Label>
                                    <Input id="model" name="model" value={formData.model} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mileage">Mileage (km)</Label>
                                    <Input id="mileage" name="mileage" type="number" value={formData.mileage} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">Color</Label>
                                    <Input id="color" name="color" value={formData.color} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fuelType">Fuel Type</Label>
                                    <Input id="fuelType" name="fuelType" value={formData.fuelType} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <Label htmlFor="images">Images</Label>
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
                                            id="images"
                                            name="images"
                                            value={formData.images}
                                            onChange={handleChange}
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
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={saving}>
                                {saving ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </span>
                                ) : editingVehicleId ? (
                                    "Update Vehicle"
                                ) : (
                                    "Save Vehicle"
                                )}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <PageLoader title="Loading inventory" subtitle="Fetching your listings..." />
            ) : vehicles.length === 0 ? (
                <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                    No vehicles listed yet.
                </div>
            ) : (
                <div className="bg-card rounded-xl border overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/50 text-sm">
                                <th className="p-4 font-medium">Vehicle</th>
                                <th className="p-4 font-medium">Price</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle._id} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                                                {vehicle.images && vehicle.images.length > 0 ? (
                                                    <img src={vehicle.images[0]} alt={vehicle.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Img</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold">{vehicle.title}</p>
                                                <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">${vehicle.price.toLocaleString()}</td>
                                    <td className="p-4 capitalize text-sm">{vehicle.status}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditDialog(vehicle)}
                                                title="Edit vehicle"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle._id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
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

export default ManageInventory;
