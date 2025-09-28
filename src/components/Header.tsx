import { Button } from "@/components/ui/enhanced-button"
import { Phone, Menu } from "lucide-react"
import { Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50 animate-fade-in">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 animate-slide-in-left">
          <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
            <span className="text-luxury-navy font-bold text-sm">EV</span>
          </div>
          <span className="text-xl font-bold text-luxury-navy">EliteValet</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 animate-fade-in">
          <a href="#services" className="text-foreground hover:text-luxury-gold transition-all duration-300 hover:scale-105 story-link">Services</a>
          <a href="#how-it-works" className="text-foreground hover:text-luxury-gold transition-all duration-300 hover:scale-105 story-link">How It Works</a>
          <a href="#features" className="text-foreground hover:text-luxury-gold transition-all duration-300 hover:scale-105 story-link">Features</a>
          <a href="#contact" className="text-foreground hover:text-luxury-gold transition-all duration-300 hover:scale-105 story-link">Contact</a>
        </nav>

        <div className="flex items-center space-x-4 animate-slide-in-right">
          <a href="tel:+1-555-ELITE" className="hidden sm:flex items-center space-x-2 text-luxury-navy hover:text-luxury-gold transition-all duration-300 hover:scale-105">
            <Phone className="w-4 h-4" />
            <span className="font-medium">Call Elite Support</span>
          </a>
          <Button variant="gold" size="sm" asChild className="hover-scale"><Link to="/dashboard">Property Dashboard</Link></Button>
          <button className="md:hidden hover:scale-110 transition-transform duration-300">
            <Menu className="w-6 h-6 text-luxury-navy" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header