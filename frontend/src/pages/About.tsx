import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Shield, Users, Award, Target, CheckCircle } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const team = [
  { name: "Arjun Mehta", role: "Founder & CEO", initials: "AM" },
  { name: "Sneha Reddy", role: "Head of Operations", initials: "SR" },
  { name: "Vikram Singh", role: "Chief Technology Officer", initials: "VS" },
  { name: "Neha Gupta", role: "Head of Sales", initials: "NG" },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-surface-dark-foreground mb-4">
              About <span className="text-gradient">AutoVerse</span>
            </h1>
            <p className="text-lg text-surface-dark-foreground/60">
              We're on a mission to make car buying transparent, convenient, and delightful for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Target, title: "Our Mission", desc: "To revolutionize the automobile industry by connecting buyers with verified dealers through a transparent, technology-driven platform that ensures trust and value at every step." },
              { icon: Award, title: "Our Vision", desc: "To become India's most trusted automobile marketplace, where every customer finds their perfect vehicle with confidence, backed by unmatched service and expertise." },
            ].map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="p-8 rounded-2xl bg-card border border-border/50 card-elevated">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-xl mb-3 text-card-foreground">{item.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-10">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Transparency", desc: "No hidden charges, no surprises. Complete honesty in every deal." },
              { title: "Quality", desc: "Every vehicle undergoes rigorous 200-point inspection." },
              { title: "Customer First", desc: "Your satisfaction drives every decision we make." },
              { title: "Innovation", desc: "Leveraging technology for a seamless experience." },
            ].map((v, i) => (
              <motion.div key={v.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="p-6 rounded-xl bg-card border border-border/50 text-center">
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-display font-semibold mb-2 text-card-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-10">Our Leadership</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div key={member.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center p-6 rounded-xl bg-card border border-border/50 card-elevated">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-display font-bold text-lg">
                  {member.initials}
                </div>
                <h3 className="font-display font-semibold text-card-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
