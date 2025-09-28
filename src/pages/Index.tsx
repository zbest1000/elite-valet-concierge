import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Services from "@/components/Services"
import HowItWorks from "@/components/HowItWorks"
import Features from "@/components/Features"
import Contact from "@/components/Contact"
import Footer from "@/components/Footer"

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <HowItWorks />
      <Features />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
