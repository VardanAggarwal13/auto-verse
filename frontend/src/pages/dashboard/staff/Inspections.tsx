import { useEffect, useMemo, useState } from "react";
import apiClient from "@/api/apiClient";
import { Clipboard, FileText, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/ui/page-loader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type InspectionRow = {
  id: string;
  vehicle: string;
  result: string;
  date: string;
  inspector: string;
};

const StaffInspections = () => {
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchInspections = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiClient.get("/staff/inspections");
      setInspections(Array.isArray(response.data) ? response.data : []);
    } catch (e: any) {
      console.error("Failed to fetch inspections", e);
      setError(e?.response?.data?.message || "Failed to fetch inspection reports");
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const stats = useMemo(() => {
    const total = inspections.length;
    const passed = inspections.filter((i) => String(i?.result || "").toLowerCase() === "pass").length;
    const needsRepair = total - passed;
    return { total, passed, needsRepair };
  }, [inspections]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Inspection Reports</h1>
        <p className="text-muted-foreground">
          Comprehensive vehicle health checks and detailed quality assurance reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-elevated">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Clipboard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reports</p>
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{stats.passed.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Needs Repair</p>
              <p className="text-2xl font-bold">{stats.needsRepair.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <PageLoader title="Loading inspections" subtitle="Fetching inspection reports..." />
      ) : error ? (
        <Card className="card-elevated">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Couldn’t load inspection reports</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" onClick={fetchInspections}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : inspections.length === 0 ? (
        <div className="bg-card p-12 text-center rounded-xl border border-dashed text-muted-foreground">
          No inspection reports found yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {inspections.map((inspection) => {
            const isPass = String(inspection?.result || "").toLowerCase() === "pass";
            return (
              <div
                key={inspection.id}
                className="bg-card p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      {inspection.vehicle}
                      <Badge
                        variant="outline"
                        className={
                          isPass
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }
                      >
                        {inspection.result}
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Report ID: {inspection.id} • Date: {inspection.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-4 md:pt-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Inspector</p>
                    <p className="text-sm font-medium">{inspection.inspector}</p>
                  </div>
                  <Button variant="outline" size="sm" disabled title="Detailed view coming soon">
                    View Detailed Report
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffInspections;

