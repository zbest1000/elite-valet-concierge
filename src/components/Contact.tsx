import { Button } from "@/components/ui/enhanced-button"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-luxury-navy mb-4">
              Ready to Experience Elite Service?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join luxury communities nationwide who trust EliteValet for their waste management needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-luxury-navy mb-6">
                  Get Started Today
                </h3>
                <div className="space-y-4">
                  <Button variant="luxury" size="xl" className="w-full">
                    Schedule Your First Pickup
                  </Button>
                  <Button variant="premium" size="xl" className="w-full">
                    Request a Quote
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-luxury-navy">Elite Support Line</div>
                    <div className="text-muted-foreground">1-555-ELITE-SERVICE</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-luxury-navy">Email Support</div>
                    <div className="text-muted-foreground">concierge@elitevalet.com</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-luxury-navy">Available 24/7</div>
                    <div className="text-muted-foreground">Customer support around the clock</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-subtle p-8 rounded-2xl border border-border">
              <h4 className="text-xl font-semibold text-luxury-navy mb-6">
                Service Areas
              </h4>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-luxury-gold mt-1" />
                  <div>
                    <div className="font-medium text-luxury-navy">Luxury Residential Complexes</div>
                    <div className="text-sm text-muted-foreground">High-end apartments and condominiums</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-luxury-gold mt-1" />
                  <div>
                    <div className="font-medium text-luxury-navy">Premium Commercial Spaces</div>
                    <div className="text-sm text-muted-foreground">Executive offices and boutique buildings</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-luxury-gold mt-1" />
                  <div>
                    <div className="font-medium text-luxury-navy">Gated Communities</div>
                    <div className="text-sm text-muted-foreground">Exclusive neighborhoods and HOAs</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Currently serving major metropolitan areas nationwide. 
                  Contact us to confirm service availability in your location.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact