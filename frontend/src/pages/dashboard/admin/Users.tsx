import { useEffect, useMemo, useState } from "react";
import apiClient from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Eye, EyeOff, Mail, MapPin, Phone, Plus, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import PageLoader from "@/components/ui/page-loader";

type Role = "customer" | "dealer" | "admin" | "staff";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  location?: string;
  createdAt: string;
}

const getRoleBadge = (role: Role) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-red-500 hover:bg-red-600">ADMIN</Badge>;
    case "dealer":
      return <Badge className="bg-blue-500 hover:bg-blue-600">DEALER</Badge>;
    case "staff":
      return <Badge className="bg-purple-500 hover:bg-purple-600">STAFF</Badge>;
    default:
      return <Badge variant="secondary">CUSTOMER</Badge>;
  }
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState<Role>("admin");
  const [createPassword, setCreatePassword] = useState("");
  const [createConfirm, setCreateConfirm] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q));
  }, [users, query]);

  const resetCreateForm = () => {
    setCreateName("");
    setCreateEmail("");
    setCreateRole("admin");
    setCreatePassword("");
    setCreateConfirm("");
    setShowPassword(false);
  };

  const createUser = async () => {
    const name = createName.trim();
    const email = createEmail.trim().toLowerCase();

    if (!name || !email || !createPassword) {
      toast.error("Name, email, and password are required.");
      return;
    }
    if (createPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (createPassword !== createConfirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setCreateLoading(true);
    try {
      await apiClient.post("/admin/users", { name, email, password: createPassword, role: createRole });
      toast.success("User created successfully");
      setCreateOpen(false);
      resetCreateForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  const updateRole = async (id: string, newRole: Role) => {
    try {
      await apiClient.patch(`/admin/users/${id}`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const isSelf = (id: string) => Boolean(currentUser?.id && String(currentUser.id) === String(id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">User Management</h1>
          <p className="text-muted-foreground">Create users, assign roles, and manage access.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, role..." className="pl-9 w-full sm:w-80" />
          </div>

          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) resetCreateForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create user</DialogTitle>
                <DialogDescription>Create a password-based account and assign a role.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Full name</label>
                  <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="e.g. Jane Doe" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} type="email" placeholder="user@company.com" />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={createRole} onValueChange={(v) => setCreateRole(v as Role)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="dealer">Dealer</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Confirm password</label>
                  <Input value={createConfirm} onChange={(e) => setCreateConfirm(e.target.value)} type="password" />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createLoading}>
                    Cancel
                  </Button>
                  <Button onClick={createUser} disabled={createLoading}>
                    {createLoading ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <PageLoader title="Loading users" subtitle="Fetching accounts..." />
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="bg-card p-6 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-border transition-colors"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{u.name}</h3>
                      {getRoleBadge(u.role)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Mail className="w-3 h-3" /> {u.email}
                      {u.phone && (
                        <>
                          <span className="mx-1">-</span> <Phone className="w-3 h-3" /> {u.phone}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {u.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {u.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Registered: {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="min-w-52">
                  <Select value={u.role} onValueChange={(v) => updateRole(u._id, v as Role)} disabled={isSelf(u._id)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="dealer">Dealer</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {isSelf(u._id) && <p className="mt-1 text-[11px] text-muted-foreground">You can’t change your own role.</p>}
                </div>

                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => deleteUser(u._id)}
                  className="h-9 w-9"
                  disabled={isSelf(u._id)}
                  title={isSelf(u._id) ? "You cannot delete your own account" : "Delete user"}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && <p className="text-sm text-muted-foreground">No users match your search.</p>}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
