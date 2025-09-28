import { Clock, Shield, Sparkles, Leaf, Bell, Users } from "lucide-react"

const services = [
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Pickup times tailored to your convenience—morning, evening, or late night. Your schedule, your way."
  },
  {
    icon: Shield,
    title: "Discreet & Respectful",
    description: "Quiet, non-intrusive service that blends seamlessly with your building's operations and aesthetic."
  },
  {
    icon: Bell,
    title: "Reliable Communication",
    description: "Customer support to address any concerns or schedule changes. We're here when you need us."
  },
  {
    icon: Sparkles,
    title: "Quality Handling",
    description: "Professional bins, clean service, and careful attention to detail when handling your property."
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Options",
    description: "Sustainable disposal methods for communities committed to environmental responsibility."
  },
  {
    icon: Users,
    title: "Property Coordination",
    description: "We work directly with HOAs, property managers, and building staff to ensure smooth operations."
  }
]

const Services = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl lg:text-5xl font-bold text-luxury-navy mb-4 animate-scale-in">
            Professional Service Standards
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Every detail focused on your comfort, convenience, and maintaining high service standards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div 
                key={index}
                className="group p-6 bg-card rounded-xl border border-border hover:shadow-elegant transition-all duration-300 hover:border-luxury-gold/30 hover:-translate-y-1 animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon className="w-6 h-6 text-luxury-navy" />
                </div>
                <h3 className="text-xl font-semibold text-luxury-navy mb-3 group-hover:text-luxury-gold transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Services