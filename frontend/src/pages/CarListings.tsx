import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CarCard from "@/components/cars/CarCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/api/apiClient";

const fuelTypes = ["All", "Petrol", "Diesel", "Hybrid", "Electric", "CNG"];
const transmissions = ["All", "Automatic", "Manual"];
const sortOptions = [
  { label: "Latest First", value: "latest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

const CarListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "All");
  const [fuel, setFuel] = useState("All");
  const [transmission, setTransmission] = useState("All");
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    fetchVehicles();
  }, [brand, fuel, transmission, sort]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (brand !== "All") params.brand = brand;
      if (fuel !== "All") params.fuelType = fuel;
      if (transmission !== "All") params.transmission = transmission;

      const response = await apiClient.get("/vehicles", { params });
      let data = response.data;

      // Client side search and sort (backend has simple filtering)
      if (search) {
        const q = search.toLowerCase();
        data = data.filter((v: any) => v.title.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q));
      }

      if (sort === "price-asc") data.sort((a: any, b: any) => a.price - b.price);
      if (sort === "price-desc") data.sort((a: any, b: any) => b.price - a.price);

      setVehicles(data);
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const clearFilters = () => {
    setSearch(""); setBrand("All"); setFuel("All"); setTransmission("All"); setSort("latest");
    setSearchParams({});
  };

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen pb-20">
        <div className="hero-gradient py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Browse Inventory</h1>
            <p className="text-white/70">{vehicles.length} vehicles matching your criteria</p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-card rounded-xl border border-border/50 p-4 shadow-lg mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by model or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="w-full md:w-44 h-11"><SelectValue placeholder="Brand" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Brands</SelectItem>
                  <SelectItem value="Tesla">Tesla</SelectItem>
                  <SelectItem value="BMW">BMW</SelectItem>
                  <SelectItem value="Audi">Audi</SelectItem>
                  <SelectItem value="Mercedes">Mercedes</SelectItem>
                  <SelectItem value="Toyota">Toyota</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="h-11 px-8">Search</Button>
              <Button variant="outline" type="button" onClick={() => setShowFilters(!showFilters)} className="h-11 gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </Button>
            </form>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                    <Select value={fuel} onValueChange={setFuel}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Fuel Type" /></SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((f) => <SelectItem key={f} value={f}>{f === "All" ? "All Fuel Types" : f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={transmission} onValueChange={setTransmission}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Transmission" /></SelectTrigger>
                      <SelectContent>
                        {transmissions.map((t) => <SelectItem key={t} value={t}>{t === "All" ? "All Transmissions" : t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Sort By" /></SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Searching our high-performance inventory...</div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((car, i) => (
                <CarCard key={(car as any)._id} car={car} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
              <p className="text-xl font-display font-semibold mb-2">No matching vehicles</p>
              <p className="text-muted-foreground mb-6">Try broadening your search or clearing filters</p>
              <Button onClick={clearFilters} variant="outline" className="gap-2">
                <X className="w-4 h-4" /> Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CarListings;
