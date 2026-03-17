import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/api/apiClient";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NOTIFICATIONS_KEY = "dashboard.settings.notifications";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw === "0") setNotificationsEnabled(false);
    if (raw === "1") setNotificationsEnabled(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, notificationsEnabled ? "1" : "0");
  }, [notificationsEnabled]);

  const themeValue = useMemo(() => {
    const v = String(theme || "system");
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  }, [theme]);

  const requestPasswordReset = async () => {
    const email = String(user?.email || "").trim();
    if (!email) {
      toast.error("Email not found for your account");
      return;
    }
    try {
      setResetLoading(true);
      const res = await apiClient.post("/auth/forgot-password", { email });
      toast.success(res?.data?.message || "Password reset requested");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to request password reset");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences, theme, and security.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how AutoVerse looks on this device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={themeValue} onValueChange={(v) => setTheme(v)} className="grid gap-3">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system">System</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light">Light</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark">Dark</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control in-app notification behavior.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Enable notifications</p>
              <p className="text-sm text-muted-foreground">Shows real-time updates in the dashboard.</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Password and sign-in options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">Reset password</p>
              <p className="text-sm text-muted-foreground">
                Sends a reset link to <span className="font-medium">{user?.email || "your email"}</span>.
              </p>
            </div>
            <Button variant="outline" onClick={requestPasswordReset} disabled={resetLoading}>
              {resetLoading ? "Sending..." : "Send reset link"}
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-medium text-destructive">Sign out</p>
              <p className="text-sm text-muted-foreground">Ends your current session on this device.</p>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;

