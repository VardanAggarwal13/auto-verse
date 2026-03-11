import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import apiClient from "@/api/apiClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      toast.success(response.data?.message || "If an account exists, a reset link was sent.");
      if (response.data?.resetUrl) {
        // Helpful dev fallback if SMTP isn't configured.
        toast.message("Dev reset link generated. Open it from the response.");
        console.log("Reset URL:", response.data.resetUrl);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Forgot your password?</h1>
        <p className="text-muted-foreground mb-6">
          Enter your email and we’ll send you a reset link (or generate one in dev).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Remembered it?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

