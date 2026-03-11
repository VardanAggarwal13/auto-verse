import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/api/apiClient";

import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

const getPostLoginPath = (role?: string) => {
  switch (role) {
    case "dealer":
      return "/dashboard/dealer";
    case "admin":
      return "/dashboard/admin";
    case "staff":
      return "/dashboard/staff";
    default:
      return "/dashboard";
  }
};

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) {
      toast.error("Please select a role");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        role: form.role === 'buyer' ? 'customer' : form.role
      };
      const response = await apiClient.post('/auth/register', payload);
      login(response.data.user, response.data.token);
      toast.success("Account created successfully!");
      navigate(getPostLoginPath(response.data?.user?.role));
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await apiClient.post('/auth/google-login', { token: idToken });
      login(response.data.user, response.data.token);
      toast.success("Signed in with Google successfully!");
      navigate(getPostLoginPath(response.data?.user?.role));
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Google login failed";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Visual */}
      <div className="hidden lg:block lg:w-1/2 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80')] bg-cover bg-center opacity-30" />
        <div className="relative flex items-center justify-center h-full p-12">
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-display font-bold text-surface-dark-foreground mb-4">Join AutoVerse Today</h2>
            <p className="text-surface-dark-foreground/60">Create your account and explore thousands of premium vehicles.</p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">Auto<span className="text-primary">Verse</span></span>
          </Link>

          <h1 className="text-2xl font-display font-bold text-foreground mb-1">Create Account</h1>
          <p className="text-muted-foreground mb-8">Get started with AutoVerse</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Full Name" className="pl-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="Email" className="pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <Input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type={showPassword ? "text" : "password"} placeholder="Password" className="pl-10 pr-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue placeholder="I want to..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buy a Car (Customer)</SelectItem>
                <SelectItem value="dealer">List & Sell Cars (Dealer)</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">OR</span></div>
          </div>

          <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleLogin}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
