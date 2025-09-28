import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-luxury-navy text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center">
                <span className="text-luxury-navy font-bold">EV</span>
              </div>
              <span className="text-2xl font-bold">EliteValet</span>
            </div>
            <p className="text-white/80 max-w-md leading-relaxed mb-6">
              Redefining waste removal with white-glove service that matches your luxury lifestyle. 
              Experience the difference that true concierge care makes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-navy transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-navy transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-navy transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-navy transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-luxury-gold transition-colors">Residential Pickup</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors">Commercial Service</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors">Eco-Friendly Options</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors">24/7 Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-luxury-gold transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">
            © 2024 EliteValet. All rights reserved.
          </p>
          <p className="text-white/60 text-sm mt-4 md:mt-0">
            Luxury waste management redefined.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer