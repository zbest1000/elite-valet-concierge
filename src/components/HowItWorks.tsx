import { ArrowRight, Download, Calendar, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/enhanced-button"

const steps = [
  {
    number: "01",
    icon: Download,
    title: "Contact & Sign Up",
    description: "Reach out through our website or phone to create your account. We'll gather your property details and service preferences."
  },
  {
    number: "02", 
    icon: Calendar,
    title: "Schedule Your Service",
    description: "Select pickup times that work for your lifestyle. Morning, evening, or late night—we adapt to your schedule."
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Experience Professional Service",
    description: "Sit back and enjoy reliable service. Simple notifications keep you informed when pickups are complete."
  }
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-luxury-cream/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl lg:text-5xl font-bold text-luxury-navy mb-4 animate-scale-in">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Getting started with EliteValet is as refined as our service. Three simple steps to luxury convenience.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="bg-white p-8 rounded-2xl shadow-elegant text-center group hover:shadow-luxury hover:-translate-y-2 transition-all duration-500 hover-scale">
                  <div className="text-luxury-gold/20 text-6xl font-bold mb-4 group-hover:text-luxury-gold/40 transition-colors duration-300">
                    {step.number}
                  </div>
                  
                  <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <Icon className="w-8 h-8 text-luxury-navy" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-luxury-navy mb-4 group-hover:text-luxury-gold transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-luxury-gold animate-pulse hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <Button variant="luxury" size="xl" className="hover-scale group">
            Get Started Today
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks