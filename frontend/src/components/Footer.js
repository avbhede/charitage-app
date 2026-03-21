import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/logo.jpg" alt="Charitage Foundation Logo" className="h-20 w-auto object-contain bg-white p-2 rounded-xl" />
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Building bridges of hope across India through education, healthcare, and community empowerment.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-secondary transition-colors" data-testid="footer-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-secondary transition-colors" data-testid="footer-twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-secondary transition-colors" data-testid="footer-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-secondary transition-colors" data-testid="footer-linkedin">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm hover:text-secondary transition-colors" data-testid="footer-link-about">About Us</Link></li>
              <li><Link to="/programs" className="text-sm hover:text-secondary transition-colors" data-testid="footer-link-programs">Our Programs</Link></li>
              <li><Link to="/blog" className="text-sm hover:text-secondary transition-colors" data-testid="footer-link-blog">Blog</Link></li>
              <li><Link to="/reports" className="text-sm hover:text-secondary transition-colors" data-testid="footer-link-reports">Annual Reports</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Get Involved</h3>
            <ul className="space-y-3">
              <li><Link to="/get-involved" className="text-sm hover:text-secondary transition-colors" data-testid="footer-link-volunteer">Become a Volunteer</Link></li>
              <li><Link to="/get-involved" className="text-sm hover:text-secondary transition-colors" data-testid="footer-link-member">Become a Member</Link></li>
              <li><Link to="/programs" className="text-sm hover:text-secondary transition-colors" data-testid="footer-link-campaigns">Support a Campaign</Link></li>
              <li><Link to="/gallery" className="text-sm hover:text-secondary transition-colors" data-testid="footer-link-gallery">Photo Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>123 Service Lane, New Delhi, 110001</span>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Phone className="w-5 h-5 text-secondary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Mail className="w-5 h-5 text-secondary" />
                <span>info@sevasetu.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} Charitage Foundation. All rights reserved. | Registered under Section 80G & 12A
          </p>
        </div>
      </div>
    </footer>
  );
};
