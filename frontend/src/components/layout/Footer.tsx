import { Link } from "react-router-dom";
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-surface-dark text-surface-dark-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold">
                Auto<span className="text-primary">Verse</span>
              </span>
            </Link>
            <p className="text-sm text-surface-dark-foreground/60 mb-6 leading-relaxed">
              Your trusted destination for premium automobiles. We connect buyers with the finest vehicles across the country.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-surface-dark-foreground/10 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-surface-dark-foreground/60">
              {["Home", "Browse Cars", "About Us", "Contact"].map((l) => (
                <li key={l}><Link to={l === "Home" ? "/" : l === "Browse Cars" ? "/cars" : `/${l.toLowerCase().replace(" ", "-").replace("us", "")}`} className="hover:text-primary transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold mb-4">Services</h4>
            <ul className="space-y-3 text-sm text-surface-dark-foreground/60">
              {["Buy a Car", "Sell Your Car", "Test Drive", "Car Inspection", "EMI Calculator"].map((l) => (
                <li key={l}><a href="#" className="hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-surface-dark-foreground/60">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary shrink-0" /> 123 Auto Street, Mumbai, India</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary shrink-0" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary shrink-0" /> info@autoverse.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-dark-foreground/10 mt-12 pt-8 text-center text-sm text-surface-dark-foreground/40">
          © 2024 AutoVerse. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
