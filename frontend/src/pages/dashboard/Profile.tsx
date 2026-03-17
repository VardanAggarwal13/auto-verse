import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import apiClient from "@/api/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, User as UserIcon } from "lucide-react";

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [saving, setSaving] = useState(false);
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

    const initials = useMemo(() => {
        const name = String(user?.name || "").trim();
        if (!name) return "U";
        const parts = name.split(/\s+/).filter(Boolean);
        const first = parts[0]?.[0] || "U";
        const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
        return (first + second).toUpperCase();
    }, [user?.name]);

    const isDirty = useMemo(() => {
        const baseName = String(user?.name || "");
        const basePhone = String(user?.phone || "");
        return String(formData.name || "") !== baseName || String(formData.phone || "") !== basePhone;
    }, [formData.name, formData.phone, user?.name, user?.phone]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await apiClient.put("/auth/profile", formData);
            // Update user in context
            const token = localStorage.getItem('token');
            if (token) {
                login(response.data, token);
            }
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error((error as any)?.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-display font-bold">My Profile</h1>
                <p className="text-muted-foreground">Update your personal information.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="card-elevated lg:col-span-1 overflow-hidden">
                    <div className="hero-gradient h-20" />
                    <CardHeader className="-mt-10">
                        <div className="flex items-end justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 ring-4 ring-background">
                                    <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                                    <AvatarFallback className="bg-muted text-foreground">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <CardTitle className="truncate">{user?.name || "User"}</CardTitle>
                                    <CardDescription className="capitalize">
                                        <Badge variant="secondary" className="mt-1 capitalize">{user?.role || "customer"}</Badge>
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{user?.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span className="truncate">{user?.phone || "—"}</span>
                        </div>
                        <Separator />
                        <div className="text-xs text-muted-foreground leading-relaxed">
                            Your profile details are used for bookings, inquiries, and account communication.
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-elevated lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                        <CardDescription>Make changes and click save.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-9"
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" value={formData.email} disabled className="bg-muted pl-9" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="pl-9"
                                        placeholder="e.g. +1 555 123 4567"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={saving || !isDirty}>
                                    {saving ? "Saving..." : "Save changes"}
                                </Button>
                                {!isDirty ? (
                                    <p className="text-sm text-muted-foreground">No changes to save.</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">You have unsaved changes.</p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
