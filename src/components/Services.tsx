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
    description: "Quiet, non-intrusive service that blends seamlessly with your luxury lifestyle and building aesthetic."
  },
  {
    icon: Bell,
    title: "Responsive Support",
    description: "24/7 customer care to address any concerns or schedule changes instantly. We're always here for you."
  },
  {
    icon: Sparkles,
    title: "White-Glove Handling",
    description: "Premium bins, odor-free guarantee, and meticulous care that treats your property like our own."
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Options",
    description: "Sustainable disposal methods for communities committed to environmental responsibility."
  },
  {
    icon: Users,
    title: "Seamless Integration",
    description: "Works flawlessly with HOAs, property managers, and building staff for effortless coordination."
  }
]

const Services = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-luxury-navy mb-4">
            Service Beyond Expectations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every detail crafted around your comfort, convenience, and the luxury standards you expect.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div 
                key={index}
                className="group p-6 bg-card rounded-xl border border-border hover:shadow-elegant transition-all duration-300 hover:border-luxury-gold/30"
              >
                <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-luxury-navy" />
                </div>
                <h3 className="text-xl font-semibold text-luxury-navy mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
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