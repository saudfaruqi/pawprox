import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Calendar, Utensils, Activity } from 'lucide-react';

import img from '../images/info1.png';

const PetCareEssentials = () => {
  const [activeCard, setActiveCard] = useState(0);
  
  const cards = [
    {
      icon: <Calendar className="h-6 w-6 text-emerald-400" />,
      title: "Regular Check-ups",
      description: "Schedule veterinary visits at least once a year for preventive care and early detection of health issues.",
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: <Utensils className="h-6 w-6 text-emerald-400" />,
      title: "Balanced Diet",
      description: "Choose high-quality food appropriate for your pet's age, size, and activity level to ensure optimal nutrition.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Activity className="h-6 w-6 text-emerald-400" />,
      title: "Daily Exercise",
      description: "Aim for at least 30 minutes of activity each day to keep your pet physically and mentally stimulated.",
      color: "from-rose-500 to-pink-600"
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row m-12 gap-8 p-4 max-w-7xl mx-auto bg-gradient-to-b from-emerald-50 to-teal-50 min-h-[90vh] items-center rounded-2xl shadow-lg">
      <div className="flex-1 space-y-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            className={`bg-gradient-to-r ${card.color} rounded-xl p-6 shadow-xl cursor-pointer`}
            whileHover={{ scale: 1.03, rotate: index % 2 === 0 ? 1 : -1 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => setActiveCard(index)}
            style={{
              opacity: activeCard === index ? 1 : 0.8,
              transform: `perspective(1000px) rotateX(${index % 2 === 0 ? 2 : -2}deg)`,
            }}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-3 rounded-full">
                {card.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white text-xl font-medium mb-2">{card.title}</h3>
                <p className="text-white/90 text-lg font-light">
                  {card.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 space-y-8">
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start mb-4">
            <Heart className="h-8 w-8 text-rose-500 mr-2 animate-pulse" />
            <span className="text-sm font-medium text-rose-600 uppercase tracking-wider">Expert Advice</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            Pet Care Essentials
          </h1>
          
          <h2 className="text-2xl lg:text-3xl mt-4 text-gray-700 font-light">
            Your Guide to Happy, Healthy Pets
          </h2>
          
          <p className="text-md lg:text-lg mt-6 text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Discover the fundamental aspects of responsible pet ownership and create a loving environment for your furry friend with our expert guidance.
          </p>
          
          <button className="mt-8 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-full inline-flex items-center transition-all shadow-lg hover:shadow-xl">
            Get Full Guide
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative overflow-hidden rounded-xl">
            <img 
              src={img} 
              alt="Pet Care" 
              className="w-full lg:h-64 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <p className="text-white p-6 text-lg font-medium">Learn from certified pet care experts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetCareEssentials;