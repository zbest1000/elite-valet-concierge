import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Phone, Mail, MapPin, Clock, Building2 } from "lucide-react"
import { useState } from "react"

const Contact = () => {
  const [formData, setFormData] = useState({
    propertyName: "",
    contactName: "",
    email: "",
    phone: "",
    units: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-luxury-navy mb-4">
              Partner with EliteValet
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your property's waste management with our premium valet service designed for luxury apartment complexes.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-gradient-subtle p-8 rounded-2xl border border-border">
              <h3 className="text-2xl font-semibold text-luxury-navy mb-6">
                Request Property Assessment
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyName">Property Name</Label>
                    <Input
                      id="propertyName"
                      name="propertyName"
                      value={formData.propertyName}
                      onChange={handleInputChange}
                      placeholder="Luxury Heights Apartments"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="Property Manager Name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="manager@property.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Number of Units</Label>
                  <Input
                    id="units"
                    name="units"
                    value={formData.units}
                    onChange={handleInputChange}
                    placeholder="150 units"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tell us about your property's needs</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Current waste management challenges, desired service level, special requirements..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button type="submit" variant="luxury" size="xl" className="w-full">
                  Request Custom Quote
                </Button>
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-luxury-navy mb-6">
                  Standard Service Schedule
                </h3>
                <div className="bg-white/50 p-6 rounded-xl border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-luxury-navy">Evening Collection</span>
                    <span className="text-muted-foreground">7:00 PM - 10:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-luxury-navy">Frequency</span>
                    <span className="text-muted-foreground">Sunday - Thursday</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-luxury-navy">Weekend Service</span>
                    <span className="text-muted-foreground">Available upon request</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-luxury-navy">Holiday Coverage</span>
                    <span className="text-muted-foreground">Maintained schedule</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  * Schedules can be customized based on your property's specific needs and resident preferences.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-luxury-navy">Property Management Line</div>
                    <div className="text-muted-foreground">1-555-ELITE-PROPERTY</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-luxury-navy">Partnership Inquiries</div>
                    <div className="text-muted-foreground">partnerships@elitevalet.com</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-luxury-gold/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-luxury-gold" />
                  </div>
                  <div>
                    <div className="font-semibold text-luxury-navy">Response Time</div>
                    <div className="text-muted-foreground">24-hour quote turnaround</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-white/30 rounded-xl border border-border">
                <h4 className="text-lg font-semibold text-luxury-navy mb-4">
                  Why Property Managers Choose Us
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Reduces resident complaints by 95%</li>
                  <li>• Eliminates hallway odors and spills</li>
                  <li>• Flexible billing and payment options</li>
                  <li>• Detailed service reporting</li>
                  <li>• Emergency cleanup available</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-subtle p-8 rounded-2xl border border-border">
              <h4 className="text-xl font-semibold text-luxury-navy mb-6">
                Perfect For Your Property Type
              </h4>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-luxury-gold mt-1" />
                  <div>
                    <div className="font-medium text-luxury-navy">Luxury Apartment Complexes</div>
                    <div className="text-sm text-muted-foreground">50+ units, premium amenities</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-luxury-gold mt-1" />
                  <div>
                    <div className="font-medium text-luxury-navy">High-Rise Condominiums</div>
                    <div className="text-sm text-muted-foreground">Multi-floor buildings, concierge service</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-luxury-gold mt-1" />
                  <div>
                    <div className="font-medium text-luxury-navy">Mixed-Use Developments</div>
                    <div className="text-sm text-muted-foreground">Residential and commercial spaces</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Serving metropolitan areas nationwide with plans for rapid expansion. 
                  Ask about our pilot program for new markets.
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