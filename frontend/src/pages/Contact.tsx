import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <Layout>
      <section className="hero-gradient py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-surface-dark-foreground mb-4">Get In Touch</h1>
            <p className="text-lg text-surface-dark-foreground/60 max-w-xl">Have questions? We'd love to hear from you.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: MapPin, title: "Address", lines: ["123 Auto Street", "Mumbai, Maharashtra 400001"] },
                { icon: Phone, title: "Phone", lines: ["+91 98765 43210", "+91 98765 43211"] },
                { icon: Mail, title: "Email", lines: ["info@autoverse.com", "support@autoverse.com"] },
                { icon: Clock, title: "Working Hours", lines: ["Mon - Sat: 9:00 AM - 8:00 PM", "Sunday: 10:00 AM - 5:00 PM"] },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-5 rounded-xl bg-card border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-card-foreground mb-1">{item.title}</h3>
                    {item.lines.map((line) => <p key={line} className="text-sm text-muted-foreground">{line}</p>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-8">
              <h2 className="text-xl font-display font-bold text-card-foreground mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                    <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buying a Car</SelectItem>
                      <SelectItem value="sell">Selling a Car</SelectItem>
                      <SelectItem value="service">Car Service</SelectItem>
                      <SelectItem value="test-drive">Test Drive</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Your message..." rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                <Button type="submit" size="lg" className="w-full sm:w-auto">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
