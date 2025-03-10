import React from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  Shield, 
  Users, 
  Award, 
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle2
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const About = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stats = [
    { number: "10k+", label: "Happy Pets" },
    { number: "500+", label: "Partner Clinics" },
    { number: "50k+", label: "Community Members" },
    { number: "1k+", label: "Lost Pets Found" }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      title: "Compassionate Care",
      description: "We treat every pet as our own, ensuring they receive the love and attention they deserve."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "Trust & Safety",
      description: "Your pet's safety is our top priority, with verified partners and secure platforms."
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: "Community First",
      description: "Building a supportive network of pet lovers, owners, and care providers."
    },
    {
      icon: <Award className="w-8 h-8 text-purple-500" />,
      title: "Excellence",
      description: "Committed to providing the highest quality services and support for all pet needs."
    }
  ];

  const team = [
    {
      name: "Mr. Saud Ahmed Faruqi",
      role: "Founder & CTO",
      image: "/api/placeholder/300/300",
      description: "Veterinarian with 15 years of experience"
    },
    {
      name: "Mr Wali Hussain",
      role: "Head of Operations",
      image: "/api/placeholder/300/300",
      description: "Former tech executive & pet welfare advocate"
    },
    {
      name: "Ms Laiba",
      role: "Chief Veterinary Officer",
      image: "/api/placeholder/300/300",
      description: "Specialist in emergency pet care"
    },
    {
        name: "Mr Muneeb ur Rehman",
        role: "Chief Executive Officer",
        image: "/api/placeholder/300/300",
        description: "Specialist in emergency pet care"
      }
  ];

  const features = [
    "24/7 Emergency Support",
    "Verified Pet Care Professionals",
    "Secure Payment System",
    "Real-time Pet Tracking",
    "Video Consultations",
    "Community Support Network",
    "Lost Pet Alert System",
    "Digital Health Records"
  ];

  return (
    <div>

    <Header/>

    <div className="pt-24 bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[500px] bg-[#2E6166] text-white">
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <motion.div 
            className="max-w-2xl"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <h1 className="text-2xl lg:text-5xl font-bold mb-6">Bringing Pet Care Closer to You</h1>
            <p className="text-l lg:text-xl mb-8">
              PawProx is revolutionizing pet care by connecting pet owners with quality services,
              building communities, and ensuring every pet gets the care they deserve.
            </p>
            <div className="flex space-x-4">
              <button className="bg-white text-[#2E6166] px-4 py-1 lg:px-8 lg:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Join Our Community
              </button>
              <button className="border-2 border-white px-4 py-1 lg:px-8 lg:py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-2xl lg:text-4xl font-bold text-[#2E6166] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Founded in 2023, PawProx emerged from a simple yet powerful idea: every pet deserves
              access to quality care, and every pet owner deserves peace of mind. What started as
              a small community of passionate pet lovers has grown into a comprehensive platform
              that connects, supports, and empowers pet owners and care providers alike.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Today, we're proud to serve thousands of pets and their families, working tirelessly
              to create innovative solutions for pet care challenges and building stronger
              communities of pet lovers across the nation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-6 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-center mb-1">{member.name}</h3>
                <p className="text-[#2E6166] text-center mb-2">{member.role}</p>
                <p className="text-gray-600 text-center">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">What Sets Us Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CheckCircle2 className="w-5 h-5 text-[#2E6166]" />
                <span className="text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl lg:text-4xl font-bold text-center mb-12">Get in Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Phone className="w-8 h-8 text-[#2E6166] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                <p className="text-gray-600">1-800-PAW-PROX</p>
                <p className="text-gray-600">Mon-Sun 24/7</p>
              </motion.div>
              
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Mail className="w-8 h-8 text-[#2E6166] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                <p className="text-gray-600">support@pawprox.com</p>
                <p className="text-gray-600">Response within 24hrs</p>
              </motion.div>
              
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <MapPin className="w-8 h-8 text-[#2E6166] mb-4" />
                <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
                <p className="text-gray-600">123 Pet Street</p>
                <p className="text-gray-600">San Francisco, CA 94105</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#2E6166] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">Ready to Join Our Community?</h2>
            <p className="text-l lg:text-xl mb-8 max-w-2xl mx-auto">
              Start your journey with PawProx today and give your pet the care they deserve.
            </p>
            <button className="bg-white text-[#2E6166] lg:px-8 lg:py-3 px-4 py-1 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started Now
            </button>
          </motion.div>
        </div>
      </section>
    </div>

    <Footer/>

    </div>
  );
};

export default About;