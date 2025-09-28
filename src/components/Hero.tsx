import { Button } from "@/components/ui/enhanced-button"
import { CheckCircle, Star } from "lucide-react"
import heroImage from "@/assets/hero-luxury-service.jpg"

const Hero = () => {
  return (
    <section className="pt-16 min-h-screen bg-gradient-subtle animate-fade-in">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-in-left">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-luxury-gold animate-fade-in">
                <Star className="w-5 h-5 fill-current animate-pulse" />
                <Star className="w-5 h-5 fill-current animate-pulse" style={{ animationDelay: '0.1s' }} />
                <Star className="w-5 h-5 fill-current animate-pulse" style={{ animationDelay: '0.2s' }} />
                <Star className="w-5 h-5 fill-current animate-pulse" style={{ animationDelay: '0.3s' }} />
                <Star className="w-5 h-5 fill-current animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="text-sm font-medium text-luxury-charcoal">Professional Service</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-luxury-navy leading-tight animate-scale-in">
                Redefining
                <span className="block text-luxury-gold animate-fade-in" style={{ animationDelay: '0.3s' }}>Trash Concierge</span>
                Service
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed animate-fade-in" style={{ animationDelay: "0.5s" }}>
                Professional waste removal service designed to be seamless and convenient. 
                Quality service that aims to exceed your expectations.
              </p>
            </div>

            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <div className="flex items-center space-x-3 hover:translate-x-2 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-luxury-gold" />
                <span className="text-foreground">Responsive Customer Support</span>
              </div>
              <div className="flex items-center space-x-3 hover:translate-x-2 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-luxury-gold" />
                <span className="text-foreground">Reliable & Consistent Service</span>
              </div>
              <div className="flex items-center space-x-3 hover:translate-x-2 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-luxury-gold" />
                <span className="text-foreground">Discreet & Professional</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.9s' }}>
              <Button variant="luxury" size="xl" className="group hover-scale">
                Start Your Service
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Button>
              <Button variant="premium" size="xl" className="hover-scale">
                Schedule Consultation
              </Button>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Serving communities across the nation with professional waste management
              </p>
            </div>
          </div>

          <div className="relative animate-slide-in-right">
            <div className="relative overflow-hidden rounded-2xl shadow-luxury hover:shadow-glow transition-all duration-500 hover:scale-[1.02]">
              <img
                src={heroImage}
                alt="Luxury concierge service"
                className="w-full h-[600px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy/20 to-transparent" />
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white p-6 rounded-xl shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-110 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="text-center">
                <div className="text-2xl font-bold text-luxury-navy">99%+</div>
                <div className="text-sm text-muted-foreground">Service Reliability</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero