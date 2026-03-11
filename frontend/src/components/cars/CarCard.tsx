import { Link } from "react-router-dom";
import { Heart, Fuel, Gauge, Settings2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, formatPrice } from "@/data/mockData";
import { motion } from "framer-motion";

interface CarCardProps {
  car: Car;
  index?: number;
}

const CarCard = ({ car, index = 0 }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/cars/${car._id}`} className="block group">
        <div className="bg-card rounded-xl overflow-hidden card-elevated border border-border/50">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={car.images && car.images.length > 0 ? car.images[0] : "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80"}
              alt={`${car.brand} ${car.title}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {car.status === 'available' && <Badge className="bg-green-500 text-white text-xs">Available</Badge>}
              {car.isFeatured && <Badge className="bg-gold text-surface-dark text-xs">Featured</Badge>}
            </div>
            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{car.brand}</p>
                <h3 className="font-display font-semibold text-card-foreground line-clamp-1">{car.title}</h3>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-primary text-lg">${car.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Fuel className="w-3.5 h-3.5" /> {car.fuelType}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Settings2 className="w-3.5 h-3.5" /> {car.transmission}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Gauge className="w-3.5 h-3.5" /> {car.mileage.toLocaleString()} km
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" /> {car.year}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CarCard;
