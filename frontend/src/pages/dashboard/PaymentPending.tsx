import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Phone, Mail, Clock } from "lucide-react";

const PaymentPending = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="bg-card p-10 rounded-2xl border shadow-xl max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-display font-bold">Order Placed Successfully!</h1>
                    <p className="text-muted-foreground text-lg">
                        Thank you for choosing Auto Hub. We have received your order request.
                    </p>
                </div>

                <div className="bg-muted/40 p-6 rounded-xl border border-dashed space-y-4">
                    <div className="flex items-center gap-3 text-left">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold">Next Steps</p>
                            <p className="text-sm text-muted-foreground">Our team will verify your details and contact you within 24 hours to finalize the payment and documentation.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <Button className="flex-1 h-12 text-lg" onClick={() => navigate("/dashboard/orders")}>
                            View My Orders
                        </Button>
                        <Button variant="outline" className="flex-1 h-12 text-lg" onClick={() => navigate("/cars")}>
                            Browse More Cars
                        </Button>
                    </div>

                    <div className="flex justify-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" /> <span>+1 (555) 000-0000</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" /> <span>support@autohub.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPending;
