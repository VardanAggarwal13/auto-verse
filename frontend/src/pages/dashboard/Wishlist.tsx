import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { toast } from "sonner";
import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/ui/page-loader";

interface Vehicle {
    _id: string;
    title: string;
    brand: string;
    model: string;
    price: number;
    images: string[];
}

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const response = await apiClient.get("/users/wishlist");
            setWishlist(response.data);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
            toast.error("Failed to load wishlist");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (id: string) => {
        try {
            await apiClient.delete(`/users/wishlist/${id}`);
            toast.success("Removed from wishlist");
            setWishlist(prev => prev.filter(v => v._id !== id));
        } catch (error) {
            toast.error("Failed to remove item");
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-display font-bold mb-6">My Wishlist</h1>
            {loading ? (
                <PageLoader title="Loading wishlist" subtitle="Fetching saved vehicles..." />
            ) : wishlist.length === 0 ? (
                <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">
                    Your wishlist is empty.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((vehicle) => (
                        <div key={vehicle._id} className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-video bg-muted relative">
                                {vehicle.images?.[0] ? (
                                    <img src={vehicle.images[0]} alt={vehicle.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg">{vehicle.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{vehicle.brand} {vehicle.model}</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-display font-bold text-xl">${vehicle.price.toLocaleString()}</span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={() => removeFromWishlist(vehicle._id)} className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        <Button className="gap-2">
                                            <ShoppingCart className="w-4 h-4" /> View
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
