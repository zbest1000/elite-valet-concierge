import { Award, Clock, Smartphone, Recycle, Building, Heart } from "lucide-react"

const features = [
  {
    icon: Clock,
    title: "On-Time Guarantee",
    description: "Every. Single. Time.",
    detail: "Backup teams and redundancy plans ensure zero missed pickups, even during weather disruptions."
  },
  {
    icon: Award,
    title: "Trained Professionals",
    description: "White-glove standards",
    detail: "Our valet professionals are trained in luxury service protocols and handle every interaction with care."
  },
  {
    icon: Smartphone,
    title: "Digital Convenience",
    description: "Mobile app control",
    detail: "Easy scheduling, real-time tracking, and instant support through our premium mobile experience."
  },
  {
    icon: Recycle,
    title: "Eco-Conscious",
    description: "Sustainable practices",
    detail: "Environmentally responsible disposal methods that align with your community's green initiatives."
  },
  {
    icon: Building,
    title: "Premium Integration",
    description: "Seamless coordination",
    detail: "Designed to work flawlessly with luxury building management and HOA requirements."
  },
  {
    icon: Heart,
    title: "Customer-Centric",
    description: "Personalized experience",
    detail: "Concierge perks, loyalty rewards, and service that makes you feel truly valued and heard."
  }
]

const Features = () => {
  return (
    <section id="features" className="py-20 bg-gradient-luxury text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            The Luxury Touch
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            What sets us apart is our unwavering attention to detail and commitment to excellence in every interaction.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index}
                className="group p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-luxury-gold rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-luxury-navy" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-luxury-gold font-medium mb-3">
                  {feature.description}
                </p>
                
                <p className="text-white/70 leading-relaxed">
                  {feature.detail}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <blockquote className="text-2xl lg:text-3xl font-light italic text-white/90 max-w-3xl mx-auto">
            "Because luxury isn't just about what we do—it's about how we make you feel: 
            <span className="text-luxury-gold"> Cared for. Heard. Respected.</span>"
          </blockquote>
        </div>
      </div>
    </section>
  )
}

export default Features