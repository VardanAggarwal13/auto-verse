import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Shield, Award, Headphones, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import CarCard from "@/components/cars/CarCard";
import { cars, brands, testimonials, stats, formatPrice } from "@/data/mockData";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const featuredCars = cars.filter((c) => c.isFeatured);

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-surface-dark-foreground leading-tight mb-6">
              Find Your <br />
              <span className="text-gradient">Perfect Drive</span>
            </h1>
            <p className="text-lg md:text-xl text-surface-dark-foreground/60 mb-8 max-w-xl">
              Explore thousands of premium vehicles from trusted dealers. Your dream car is just a click away.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by brand, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Link to={`/cars${searchQuery ? `?q=${searchQuery}` : ""}`}>
                <Button size="lg" className="h-12 px-8 w-full sm:w-auto">
                  Search <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-2xl"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-display font-bold text-surface-dark-foreground">
                  {stat.value.toLocaleString()}+
                </p>
                <p className="text-sm text-surface-dark-foreground/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Popular Brands</h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link
                  to={`/cars?brand=${brand.name}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <span className="text-3xl">{brand.logo}</span>
                  <span className="text-xs font-medium text-muted-foreground">{brand.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Featured Cars</h2>
              <p className="text-muted-foreground mt-1">Hand-picked premium vehicles</p>
            </div>
            <Link to="/cars" className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car, i) => (
              <CarCard key={car.id} car={car} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Why Choose AutoVerse</h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">We deliver an unmatched car buying experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Verified Vehicles", desc: "Every car goes through a 200-point inspection to ensure quality and reliability." },
              { icon: Award, title: "Best Price Guarantee", desc: "We ensure competitive pricing with transparent cost breakdowns, no hidden charges." },
              { icon: Headphones, title: "24/7 Support", desc: "Our dedicated team is always available to assist you throughout your journey." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center p-8 rounded-2xl bg-card border border-border/50 card-elevated"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="p-6 rounded-2xl bg-card border border-border/50"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-sm text-card-foreground mb-4 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-dark-foreground mb-4">
              Ready to Find Your Dream Car?
            </h2>
            <p className="text-surface-dark-foreground/60 mb-8 max-w-lg mx-auto">
              Join thousands of happy customers who found their perfect vehicle through AutoVerse.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/cars">
                <Button variant="hero" size="lg">
                  Browse Cars <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="hero-outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
