import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import apiClient from "@/api/apiClient";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = useMemo(() => params.get("email") || "", [params]);
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token) {
      toast.error("Reset link is missing required parameters.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/reset-password", { email, token, password });
      toast.success(response.data?.message || "Password reset successful.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Reset password</h1>
        <p className="text-muted-foreground mb-6">
          Set a new password for <span className="font-medium text-foreground">{email || "your account"}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="New password"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

