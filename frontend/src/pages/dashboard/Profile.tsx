import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import apiClient from "@/api/apiClient";

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiClient.put("/auth/profile", formData);
            // Update user in context
            const token = localStorage.getItem('token');
            if (token) {
                login(response.data, token);
            }
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("Failed to update profile");
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-display font-bold mb-6">My Profile</h1>
            <div className="bg-card p-6 rounded-xl border">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Full Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Email</label>
                        <Input
                            value={formData.email}
                            disabled
                            className="bg-muted"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Phone Number</label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <Button type="submit">Save Changes</Button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
