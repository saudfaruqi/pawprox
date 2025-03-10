import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { ShoppingBag, AlertTriangle, ArrowRight, Heart, MapPin, Users } from 'lucide-react';

const HeroSection = ({ containerRef }) => {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  // Parallax effect for scrolling
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <section className="relative overflow-hidden pt-[0px] sm:pt-[0px] h-auto lg:min-h-[90vh] flex items-center">
      {/* 3D Background */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden" />
      
      {/* Improved gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white via-emerald-600/10 to-white"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-10 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl" />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-20 py-16 lg:py-24">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-3">
            <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              The Ultimate Pet Companion
            </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900"
          >
            Your One-Stop
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent inline-block ml-2">
              Pet Care
            </span>
            <span className="block mt-1">Platform</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Connect, care, and create memorable moments with your furry friends.
            Everything your pet needs, all in one place.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/Marketplace">
              <button className="group relative bg-emerald-500 hover:bg-emerald-600 text-white lg:px-8 lg:py-4 lg:text-lg text-base px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 w-full sm:w-auto">
                <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Explore Marketplace</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300" />
              </button>
            </Link>

            <Link to="/lostfound">
              <button className="group relative bg-black hover:bg-gray-800 text-white lg:px-8 lg:py-4 lg:text-lg text-base px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 w-full sm:w-auto">
                <AlertTriangle className="w-5 h-5 group-hover:animate-pulse" />
                <span className="relative z-10">Report Lost Pet</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-700 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300" />
              </button>
            </Link>
          </motion.div>
          
          {/* Added quick links section */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto"
          >
            {[
              { title: "Pet Resources", icon: <Heart className="text-emerald-500" />, link: "/resources" },
              { title: "Find a Vet", icon: <MapPin className="text-emerald-500" />, link: "/medicalfacilities" },
              { title: "Pet Community", icon: <Users className="text-emerald-500" />, link: "/community" },
            ].map((item, index) => (
              <Link key={index} to={item.link}>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center gap-3 group">
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </motion.div>
          
          {/* Added visual indicator for scrolling */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:block"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-8 h-12 border-2 border-gray-400 rounded-full flex justify-center pt-2">
              <div className="w-1 h-3 bg-gray-400 rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;