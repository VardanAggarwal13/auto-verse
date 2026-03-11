import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/api/apiClient";
import { Wrench, ShieldCheck, Clipboard, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const StaffInspections = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [inspections, setInspections] = useState<any[]>([]);

    useEffect(() => {
        const fetchInspections = async () => {
            try {
                // Mock fetching inspections
                const response = await apiClient.get("/staff/inspections");
                setInspections(response.data);
            } catch (error) {
                console.error("Failed to fetch inspections", error);
                // Use dummy data if backend is not yet ready
                setInspections([
                    { id: "INS-101", vehicle: "Ferrari F8", result: "Pass", date: "2024-03-15", inspector: "John Smith" },
                    { id: "INS-102", vehicle: "Tesla Model S Plaid", result: "Requires Maintenance", date: "2024-03-17", inspector: "Sarah Lee" },
                    { id: "INS-103", vehicle: "BMW M4 Competition", result: "Pass", date: "2024-03-19", inspector: "Mike Ross" },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchInspections();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Inspection Reports</h1>
                <p className="text-muted-foreground">Comprehensive vehicle health checks and detailed quality assurance reports.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><Clipboard className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Reports</p>
                        <p className="text-2xl font-bold">128</p>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-lg"><ShieldCheck className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-muted-foreground">Approved List</p>
                        <p className="text-2xl font-bold">92</p>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-lg"><Wrench className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-muted-foreground">Needs Repair</p>
                        <p className="text-2xl font-bold">36</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {inspections.map((inspection) => (
                    <div key={inspection.id} className="bg-card p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <FileText className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-bold flex items-center gap-2">
                                    {inspection.vehicle}
                                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${inspection.result === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {inspection.result}
                                    </span>
                                </h3>
                                <p className="text-xs text-muted-foreground">Report ID: {inspection.id} • Date: {inspection.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-4 md:pt-0">
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Inspector</p>
                                <p className="text-sm font-medium">{inspection.inspector}</p>
                            </div>
                            <Button variant="outline" size="sm">View Detailed Report</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StaffInspections;
