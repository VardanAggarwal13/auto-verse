import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Share2, Fuel, Gauge, Settings2, Calendar, Users, Palette, Zap, MapPin, Phone, Mail, Check, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/hooks/useAuth";

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryForm, setInquiryForm] = useState({ message: "" });

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await apiClient.get(`/vehicles/${id}`);
        setCar(response.data);
      } catch (error) {
        console.error("Failed to fetch car", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to send an inquiry");
      return;
    }
    if (user.role !== "customer") {
      toast.error("Only customers can send inquiries");
      return;
    }
    try {
      await apiClient.post("/inquiries", {
        vehicleId: id,
        message: inquiryForm.message,
        dealerId: car?.seller?._id
      });
      toast.success("Inquiry sent successfully!");
      setInquiryForm({ message: "" });
    } catch (error) {
      toast.error((error as any)?.response?.data?.message || "Failed to send inquiry");
    }
  };

  const handleTestDrive = async () => {
    if (!user) {
      toast.error("Please login to book a test drive");
      return;
    }
    if (user.role !== "customer") {
      toast.error("Only customers can book test drives");
      return;
    }
    try {
      await apiClient.post("/bookings", {
        vehicleId: id,
        dealerId: car?.seller?._id,
        bookingDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        timeSlot: "10:00 AM"
      });
      toast.success("Test drive request submitted!");
      navigate("/dashboard/bookings");
    } catch (error) {
      toast.error("Failed to book test drive");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      return;
    }
    if (user.role !== "customer") {
      toast.error("Only customers can place orders");
      return;
    }
    try {
      await apiClient.post("/orders", {
        vehicleId: id,
        amount: car.price
      });
      navigate("/dashboard/payment-pending");
    } catch (error) {
      toast.error((error as any)?.response?.data?.message || "Failed to place order");
    }
  };

  if (loading) return <div className="p-20 text-center">Loading car details...</div>;
  if (!car) return <div className="p-20 text-center">Car not found.</div>;

  const specs = [
    { icon: Fuel, label: "Fuel Type", value: car.fuelType },
    { icon: Settings2, label: "Transmission", value: car.transmission },
    { icon: Gauge, label: "Mileage", value: `${car.mileage.toLocaleString()} km` },
    { icon: Calendar, label: "Year", value: car.year },
    { icon: Zap, label: "Horsepower", value: `${car.horsepower || 'N/A'} hp` },
    { icon: Users, label: "Seats", value: car.seats || '5' },
    { icon: Palette, label: "Color", value: car.color },
    { icon: MapPin, label: "Dealer", value: car.seller.name },
  ];

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen">
        <div className="container mx-auto px-4 py-4">
          <Link to="/cars" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Listings
          </Link>
        </div>

        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden aspect-video relative">
                <img src={car.images && car.images.length > 0 ? car.images[0] : "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80"} alt={car.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  {car.status === 'available' && <Badge className="bg-green-500">Available</Badge>}
                </div>
              </motion.div>

              <div className="bg-card rounded-xl border border-border/50 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{car.brand}</p>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-card-foreground">{car.title}</h1>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-bold text-primary">${car.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border/50 p-6">
                <h2 className="font-display font-semibold text-lg mb-4 text-card-foreground">Specifications</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <spec.icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">{spec.label}</p>
                        <p className="text-sm font-medium text-card-foreground">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border/50 p-6">
                <h2 className="font-display font-semibold text-lg mb-3 text-card-foreground">About this car</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{car.description}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border/50 p-6 sticky top-24 space-y-4">
                <Button className="w-full h-12" size="lg" onClick={handleBuyNow} variant="outline">
                  <ShoppingCart className="w-5 h-5 mr-2" /> Buy Now
                </Button>
                <Button className="w-full h-12" size="lg" onClick={handleTestDrive}>
                  Book Test Drive
                </Button>

                <div className="pt-6 border-t">
                  <h3 className="font-display font-semibold mb-4 text-card-foreground">Quick Inquiry</h3>
                  <form onSubmit={handleInquiry} className="space-y-3">
                    <Textarea
                      placeholder="I'm interested in this car..."
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      rows={4}
                      required
                    />
                    <Button type="submit" className="w-full" variant="secondary">
                      <Mail className="w-4 h-4 mr-2" /> Send Message
                    </Button>
                  </form>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dealer Info</p>
                  <p className="font-bold text-sm">{car.seller.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" /> {car.seller.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CarDetail;
