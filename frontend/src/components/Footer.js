import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/logo-landscape.svg"
                alt="Charitage Foundation Logo"
                className="h-16 w-auto object-contain bg-white p-2.5 rounded-2xl shadow-md"
              />
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Leading with kindness. Building bridges of hope across India through education, healthcare, and community empowerment.
            </p>
<<<<<<< HEAD
            <div className="flex space-x-4 pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=61588498050844"
                target="_blank"
                rel="noreferrer"
                className="hover:text-secondary transition-colors"
                data-testid="footer-facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/charitage_foundation?igsh=c2ZndHlpdGZjNWx2"
                target="_blank"
                rel="noreferrer"
                className="hover:text-secondary transition-colors"
                data-testid="footer-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@charitagefoundationngo?si=hNQP2ruWtrQm1oVf"
                target="_blank"
                rel="noreferrer"
                className="hover:text-secondary transition-colors"
                data-testid="footer-youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
=======
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/people/Charitage-Foundation/61588498050844/" className="hover:text-secondary transition-colors" data-testid="footer-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@charitagefoundationngo?si=hNQP2ruWtrQm1oVf" className="hover:text-secondary transition-colors" data-testid="footer-youtube">
                <YouTube className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/charitage_foundation?igsh=c2ZndHlpdGZjNWx2" className="hover:text-secondary transition-colors" data-testid="footer-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              // <a href="#" className="hover:text-secondary transition-colors" data-testid="footer-linkedin">
              //   <Linkedin className="w-5 h-5" />
              // </a>
>>>>>>> c8cec4e5b4b4e633d5a8f0df826e096ea00b2d04
            </div>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-4 text-white">Explore</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-about">About Us</Link></li>
              <li><Link to="/programs" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-programs">Our Programs</Link></li>
              <li><Link to="/activities" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-activities">Activities</Link></li>
              <li><Link to="/blogs" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-blogs">Blogs</Link></li>
              <li><Link to="/stories" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-stories">Impact Stories</Link></li>
              <li><Link to="/news" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-news">News & Media</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-4 text-white">Get Involved</h3>
            <ul className="space-y-3">
              <li><Link to="/register" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-register">Donor Registration</Link></li>
              <li><Link to="/register?tab=volunteer" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-volunteer">Volunteer Registration</Link></li>
              <li><Link to="/register?tab=member" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-member">Foundation Membership</Link></li>
              <li><Link to="/register?tab=fundseeker" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-fundseeker">Fund Seeker Campaign</Link></li>
              <li><Link to="/reports" className="text-sm text-white/80 hover:text-secondary transition-colors" data-testid="footer-link-reports">80G / 12A Certificates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-4 text-white">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm text-white/80">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Plot number 01, H. No. 2368, Wathoda, Bagadganj, Nagpur, Maharashtra, India, 440008</span>
              </li>
<<<<<<< HEAD
              <li className="flex items-center space-x-3 text-sm text-white/80">
                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                <span>+91 7770093373</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-white/80">
                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
=======
              <li className="flex items-center space-x-3 text-sm">
                <Phone className="w-5 h-5 text-secondary" />
                <span>+91 77700 93373</span>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Mail className="w-5 h-5 text-secondary" />
>>>>>>> c8cec4e5b4b4e633d5a8f0df826e096ea00b2d04
                <span>info@charitage.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center space-y-2">
          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} Charitage Foundation. All rights reserved. | Registered under the Companies Act, 2013 as a Section 8 Company/NGO
          </p>
          <p className="text-sm text-primary-foreground/60">
            Donations are eligible for Tax Exemption under Section 12A & 80G of Income Tax
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
