import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
    LayoutDashboard,
    Car,
    MessageSquare,
    Calendar,
    Heart,
    ShoppingBag,
    Bell,
    User,
    LogOut,
    Settings,
    Menu,
    X,
    PlusCircle,
    Users,
    BarChart3,
    ClipboardCheck,
    Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarItem {
    icon: React.ElementType;
    label: string;
    href: string;
    roles: string[];
}

const sidebarItems: SidebarItem[] = [
    // Common
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["customer", "admin", "staff"] },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/dealer", roles: ["dealer"] },

    // Customer
    { icon: User, label: "My Profile", href: "/dashboard/profile", roles: ["customer"] },
    { icon: MessageSquare, label: "My Inquiries", href: "/dashboard/inquiries", roles: ["customer"] },
    { icon: Calendar, label: "Test Drives", href: "/dashboard/bookings", roles: ["customer"] },
    { icon: Heart, label: "Wishlist", href: "/dashboard/wishlist", roles: ["customer"] },
    { icon: ShoppingBag, label: "My Orders", href: "/dashboard/orders", roles: ["customer"] },

    // Dealer
    { icon: PlusCircle, label: "Manage Inventory", href: "/dashboard/dealer/inventory", roles: ["dealer"] },
    { icon: MessageSquare, label: "Inquiries Received", href: "/dashboard/dealer/inquiries", roles: ["dealer"] },
    { icon: Calendar, label: "Drive Requests", href: "/dashboard/dealer/bookings", roles: ["dealer"] },
    { icon: ShoppingBag, label: "Orders Received", href: "/dashboard/dealer/orders", roles: ["dealer"] },
    { icon: BarChart3, label: "Sales History", href: "/dashboard/dealer/sales", roles: ["dealer"] },

    // Staff
    { icon: ClipboardCheck, label: "Service Requests", href: "/dashboard/staff/services", roles: ["staff"] },
    { icon: Wrench, label: "Inspection Reports", href: "/dashboard/staff/inspections", roles: ["staff"] },

    // Admin
    { icon: Users, label: "User Management", href: "/dashboard/admin/users", roles: ["admin"] },
    { icon: Car, label: "Vehicle Control", href: "/dashboard/admin/vehicles", roles: ["admin"] },
    { icon: BarChart3, label: "Activity", href: "/dashboard/admin/activity", roles: ["admin"] },
    { icon: BarChart3, label: "Reports", href: "/dashboard/admin/reports", roles: ["admin"] },

    // Common Bottom
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications", roles: ["customer", "dealer", "admin", "staff"] },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", roles: ["customer", "dealer", "admin", "staff"] },
];

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) {
        navigate("/login");
        return null;
    }

    const filteredItems = sidebarItems.filter(item => item.roles.includes(user.role));

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const NavContent = () => (
        <div className="flex flex-col h-full bg-card border-r">
            <div className="p-6 border-b">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Car className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-display font-bold text-foreground">Auto<span className="text-primary">Verse</span></span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {filteredItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t space-y-4">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {user.avatar ? <img src={user.avatar} alt={user.name} /> : <User className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-muted/30 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:block w-64 fixed inset-y-0 left-0">
                <NavContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                {/* Header Mobile */}
                <header className="lg:hidden h-16 bg-card border-b flex items-center justify-between px-4 sticky top-0 z-10">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Car className="w-4 h-4 text-primary-foreground" />
                        </div>
                    </Link>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <NavContent />
                        </SheetContent>
                    </Sheet>
                </header>

                <div className="flex-1 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
