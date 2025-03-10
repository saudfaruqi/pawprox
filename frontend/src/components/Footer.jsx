import React from "react";
import { Link } from "react-router-dom";
import pawprox from "../images/pawprox.png";
import { 
  ArrowRight, Mail, Phone, Globe, Facebook, Twitter, Linkedin, Instagram 
} from "lucide-react";

const Footer = () => {
  const primaryColor = "bg-[#2E6166]";
  const primaryHover = "hover:bg-[#19897F]";

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Lost & Found", href: "/lostfound" },
    { name: "Community", href: "/community" },
  ];

  const socialIcons = {
    Facebook: <Facebook className="w-5 h-5 text-white" />,
    Twitter: <Twitter className="w-5 h-5 text-white" />,
    LinkedIn: <Linkedin className="w-5 h-5 text-white" />,
    Instagram: <Instagram className="w-5 h-5 text-white" />,
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10">
                <img src={pawprox} alt="Pawprox Logo" className="object-contain" />
              </div>
              <span className="text-xl font-bold">Pawprox</span>
            </div>
            <p className="text-gray-400">
              Transforming ideas into digital reality. Building the future of web experiences.
            </p>
            <div className="flex space-x-4">
              {["Facebook", "Twitter", "LinkedIn", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center transition-colors duration-300 hover:bg-[#2E6166]"
                >
                  <span className="sr-only">{social}</span>
                  {socialIcons[social]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="flex items-center space-x-2 text-gray-400 transition-colors duration-300 group hover:text-white"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="w-6 h-6 text-[#2E6166] flex-shrink-0" />
                <span className="text-gray-400">info@pawprox.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-6 h-6 text-[#2E6166] flex-shrink-0" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <Globe className="w-6 h-6 text-[#2E6166] flex-shrink-0" />
                <span className="text-gray-400">
                  123 Innovation Street<br />Tech City, TC 12345
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Stay updated with our latest news and updates.</p>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-[#2E6166] transition-colors"
              />
              <button
                type="submit"
                className={`${primaryColor} ${primaryHover} w-full text-white px-6 py-2 rounded-lg flex items-center justify-center group`}
              >
                Subscribe
                <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 PawProx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
