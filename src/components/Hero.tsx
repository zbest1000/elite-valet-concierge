import { Button } from "@/components/ui/enhanced-button"
import { CheckCircle, Star } from "lucide-react"
import heroImage from "@/assets/hero-luxury-service.jpg"

const Hero = () => {
  return (
    <section className="pt-16 min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-luxury-gold">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium text-luxury-charcoal">Rated Exceptional</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-luxury-navy leading-tight">
                Redefining
                <span className="block text-luxury-gold">Trash Concierge</span>
                Service
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Experience waste removal as seamless and refined as the luxury lifestyle you deserve. 
                White-glove service that goes beyond expectations.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-luxury-gold" />
                <span className="text-foreground">24/7 Customer Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-luxury-gold" />
                <span className="text-foreground">On-Time Service Guarantee</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-luxury-gold" />
                <span className="text-foreground">Discreet & Professional</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="luxury" size="xl" className="group">
                Start Your Service
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Button>
              <Button variant="premium" size="xl">
                Schedule Consultation
              </Button>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Trusted by luxury communities across the nation
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-luxury">
              <img
                src={heroImage}
                alt="Luxury concierge service"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy/20 to-transparent" />
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white p-6 rounded-xl shadow-elegant">
              <div className="text-center">
                <div className="text-2xl font-bold text-luxury-navy">100%</div>
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