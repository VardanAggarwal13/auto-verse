export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  fuelType: string;
  mileage: number;
  transmission: string;
  bodyType: string;
  color: string;
  engine: string;
  horsepower: number;
  seats: number;
  image: string;
  images: string[];
  isFeatured: boolean;
  isNew: boolean;
  description: string;
  features: string[];
  dealer: string;
}

export const cars: Car[] = [
  {
    id: "1",
    brand: "BMW",
    model: "M4 Competition",
    year: 2024,
    price: 7890000,
    originalPrice: 8500000,
    fuelType: "Petrol",
    mileage: 1200,
    transmission: "Automatic",
    bodyType: "Coupe",
    color: "Isle of Man Green",
    engine: "3.0L Twin-Turbo I6",
    horsepower: 503,
    seats: 4,
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    ],
    isFeatured: true,
    isNew: true,
    description: "The BMW M4 Competition delivers breathtaking performance with its twin-turbocharged inline-six engine.",
    features: ["Adaptive M Suspension", "M Carbon Bucket Seats", "Head-Up Display", "Harman Kardon Sound", "360° Camera"],
    dealer: "AutoElite Motors",
  },
  {
    id: "2",
    brand: "Mercedes-Benz",
    model: "AMG GT 63 S",
    year: 2024,
    price: 15900000,
    fuelType: "Petrol",
    mileage: 800,
    transmission: "Automatic",
    bodyType: "Sedan",
    color: "Obsidian Black",
    engine: "4.0L V8 Biturbo",
    horsepower: 630,
    seats: 5,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    ],
    isFeatured: true,
    isNew: true,
    description: "The Mercedes-AMG GT 63 S is the ultimate expression of driving performance and luxury.",
    features: ["AMG Performance Exhaust", "MBUX Infotainment", "Burmester Sound", "Air Suspension", "Night Package"],
    dealer: "Star Motors",
  },
  {
    id: "3",
    brand: "Audi",
    model: "RS7 Sportback",
    year: 2023,
    price: 12500000,
    originalPrice: 13200000,
    fuelType: "Petrol",
    mileage: 5600,
    transmission: "Automatic",
    bodyType: "Sportback",
    color: "Nardo Grey",
    engine: "4.0L TFSI V8",
    horsepower: 591,
    seats: 5,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    ],
    isFeatured: true,
    isNew: false,
    description: "The Audi RS7 Sportback combines everyday usability with supercar performance.",
    features: ["Quattro AWD", "Matrix LED Headlights", "Bang & Olufsen Sound", "Sport Differential", "Panoramic Roof"],
    dealer: "Prestige Auto",
  },
  {
    id: "4",
    brand: "Porsche",
    model: "911 Turbo S",
    year: 2024,
    price: 23500000,
    fuelType: "Petrol",
    mileage: 300,
    transmission: "PDK",
    bodyType: "Coupe",
    color: "Guards Red",
    engine: "3.8L Twin-Turbo Flat-6",
    horsepower: 640,
    seats: 4,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    ],
    isFeatured: true,
    isNew: true,
    description: "The Porsche 911 Turbo S represents the pinnacle of sports car engineering.",
    features: ["PASM Sport Suspension", "Sport Chrono Package", "Bose Sound System", "Ceramic Brakes", "Sport Exhaust"],
    dealer: "AutoElite Motors",
  },
  {
    id: "5",
    brand: "Toyota",
    model: "Fortuner Legender",
    year: 2024,
    price: 4200000,
    fuelType: "Diesel",
    mileage: 3200,
    transmission: "Automatic",
    bodyType: "SUV",
    color: "Dual Tone White",
    engine: "2.8L Turbo Diesel",
    horsepower: 201,
    seats: 7,
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    ],
    isFeatured: false,
    isNew: true,
    description: "The Fortuner Legender combines rugged capability with premium comfort.",
    features: ["4x4 Drivetrain", "JBL Sound System", "Kickback Tailgate", "Wireless Charging", "LED Headlamps"],
    dealer: "City Auto Hub",
  },
  {
    id: "6",
    brand: "Hyundai",
    model: "Creta SX(O)",
    year: 2024,
    price: 1850000,
    fuelType: "Petrol",
    mileage: 8500,
    transmission: "Automatic",
    bodyType: "SUV",
    color: "Titan Grey",
    engine: "1.5L Turbo GDi",
    horsepower: 158,
    seats: 5,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800&q=80",
    ],
    isFeatured: false,
    isNew: false,
    description: "The Hyundai Creta offers a compelling package of style, features and value.",
    features: ["Panoramic Sunroof", "ADAS Level 2", "Bose Sound System", "Ventilated Seats", "BlueLink Connected"],
    dealer: "Star Motors",
  },
  {
    id: "7",
    brand: "Tata",
    model: "Harrier Fearless+",
    year: 2024,
    price: 2500000,
    fuelType: "Diesel",
    mileage: 4200,
    transmission: "Automatic",
    bodyType: "SUV",
    color: "Ash Grey",
    engine: "2.0L Kryotec Diesel",
    horsepower: 168,
    seats: 5,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    ],
    isFeatured: false,
    isNew: true,
    description: "Built on the legendary Land Rover D8 platform, the Harrier is bold and capable.",
    features: ["JBL 9-Speaker System", "Panoramic Sunroof", "ADAS Suite", "360° Camera", "Terrain Response"],
    dealer: "Prestige Auto",
  },
  {
    id: "8",
    brand: "Honda",
    model: "City Hybrid",
    year: 2023,
    price: 1950000,
    fuelType: "Hybrid",
    mileage: 12000,
    transmission: "eCVT",
    bodyType: "Sedan",
    color: "Platinum White",
    engine: "1.5L i-MMD Hybrid",
    horsepower: 126,
    seats: 5,
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
    ],
    isFeatured: false,
    isNew: false,
    description: "The Honda City Hybrid delivers exceptional fuel efficiency without compromising performance.",
    features: ["Lane Watch Camera", "Honda Sensing", "Wireless Charging", "LED Headlamps", "8-inch Touchscreen"],
    dealer: "City Auto Hub",
  },
];

export const brands = [
  { name: "BMW", logo: "🏎️" },
  { name: "Mercedes-Benz", logo: "⭐" },
  { name: "Audi", logo: "🔰" },
  { name: "Porsche", logo: "🏁" },
  { name: "Toyota", logo: "🚙" },
  { name: "Hyundai", logo: "🚗" },
  { name: "Tata", logo: "🚘" },
  { name: "Honda", logo: "🏍️" },
];

export const testimonials = [
  {
    id: "1",
    name: "Rajesh Kumar",
    role: "Business Owner",
    content: "Found my dream BMW M4 through AutoVerse. The whole process was seamless and transparent. Highly recommend!",
    rating: 5,
    avatar: "RK",
  },
  {
    id: "2",
    name: "Priya Sharma",
    role: "Software Engineer",
    content: "The test drive booking was incredibly convenient. I could schedule it online and the staff was very professional.",
    rating: 5,
    avatar: "PS",
  },
  {
    id: "3",
    name: "Amit Patel",
    role: "Doctor",
    content: "Best dealership experience ever. The vehicle inspection report gave me complete confidence in my purchase.",
    rating: 4,
    avatar: "AP",
  },
];

export const stats = [
  { label: "Cars Listed", value: 2500 },
  { label: "Happy Customers", value: 15000 },
  { label: "Dealers", value: 120 },
  { label: "Cities", value: 45 },
];

export const formatPrice = (price: number): string => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
};
