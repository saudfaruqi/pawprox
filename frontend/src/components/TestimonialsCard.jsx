import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight, Quote, Heart, User, Package, Pause, Play } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    text: "As a pet owner, I'm amazed by the comprehensive care my dogs receive. The attention to detail and genuine love for animals is evident in everything they do.",
    author: "Sarah Mitchell",
    role: "Pet Owner",
    type: "owner",
    pets: "2 Golden Retrievers"
  },
  {
    id: 2,
    text: "Being a partner veterinary clinic, we've seen countless success stories. Their commitment to maintaining high standards of pet care is truly commendable.",
    author: "Dr. James Wilson",
    role: "Veterinarian",
    type: "vet",
    credential: "DVM, 15 years experience"
  },
  {
    id: 3,
    text: "As a premium pet food supplier, we appreciate their dedication to providing only the best nutrition. They take the time to understand each product thoroughly.",
    author: "Emma Thompson",
    role: "Pet Supply Vendor",
    type: "vendor",
    company: "Natural Pet Nutrition Co."
  },
  {
    id: 4,
    text: "The holistic approach to pet healthcare is impressive. Their collaboration with vendors and vets ensures each pet gets personalized care.",
    author: "Dr. Lisa Chen",
    role: "Veterinary Specialist",
    type: "vet",
    credential: "Animal Behavior Expert"
  },
  {
    id: 5,
    text: "My cats have been clients for years. The staff remembers their preferences and always makes them feel comfortable during visits.",
    author: "Michael Brown",
    role: "Pet Owner",
    type: "owner",
    pets: "3 Persian Cats"
  },
  {
    id: 6,
    text: "Our partnership has been incredible. They maintain high standards in pet product selection and truly care about quality.",
    author: "Robert Garcia",
    role: "Pet Supply Vendor",
    type: "vendor",
    company: "Premium Pet Gear"
  }
];

const getIcon = (type) => {
  switch (type) {
    case 'owner':
      return <Heart className="text-rose-500" size={28} />;
    case 'vet':
      return <User className="text-emerald-500" size={28} />;
    case 'vendor':
      return <Package className="text-indigo-500" size={28} />;
    default:
      return <Quote className="text-gray-500" size={28} />;
  }
};

export default function TestimonialSlider() {
  // Responsive itemsPerPage state.
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Update itemsPerPage based on window size.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(1);
      }
    };

    // Call once to set initial state.
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredTestimonials = filterType === 'all'
    ? testimonials
    : testimonials.filter(item => item.type === filterType);

  const totalTestimonials = filteredTestimonials.length;
  // Maximum valid starting index is (totalTestimonials - itemsPerPage)
  const maxIndex = totalTestimonials - itemsPerPage;

  // Increment by one testimonial per navigation.
  const goToNext = useCallback(() => {
    if (isAnimating || totalTestimonials <= itemsPerPage) return;
    setIsAnimating(true);
    setCurrentIndex((prev) =>
      prev >= maxIndex ? 0 : prev + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, totalTestimonials, itemsPerPage, maxIndex]);

  const goToPrev = useCallback(() => {
    if (isAnimating || totalTestimonials <= itemsPerPage) return;
    setIsAnimating(true);
    setCurrentIndex((prev) =>
      prev === 0 ? maxIndex : prev - 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, totalTestimonials, itemsPerPage, maxIndex]);

  useEffect(() => {
    let timer;
    if (!isPaused && totalTestimonials > itemsPerPage) {
      timer = setTimeout(goToNext, 6000);
    }
    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, goToNext, totalTestimonials, itemsPerPage]);

  // Reset index when filter changes.
  useEffect(() => {
    setCurrentIndex(0);
  }, [filterType]);

  const handlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrev,
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const getBackgroundGradient = (type) => {
    switch (type) {
      case 'owner':
        return 'from-rose-50 to-rose-100/50';
      case 'vet':
        return 'from-emerald-50 to-emerald-100/50';
      case 'vendor':
        return 'from-indigo-50 to-indigo-100/50';
      default:
        return 'from-gray-50 to-gray-100/50';
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'owner':
        return 'border-rose-200';
      case 'vet':
        return 'border-emerald-200';
      case 'vendor':
        return 'border-indigo-200';
      default:
        return 'border-gray-200';
    }
  };

  // Each card takes 100% width on small screens and 50% on large screens.
  const TestimonialCard = ({ testimonial }) => (
    <div className="flex-none w-[100%] lg:w-[50%] px-2 py-4">
      <div
        className={`bg-gradient-to-br ${getBackgroundGradient(testimonial.type)}
          border ${getBorderColor(testimonial.type)} rounded-2xl p-6 lg:p-8 shadow-sm
          transform transition-all duration-500 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-full bg-white/80 shadow-sm">
            {getIcon(testimonial.type)}
          </div>
          <Quote className="text-gray-300" size={32} />
        </div>

        <p className="text-gray-700 text-base lg:text-lg mb-6 leading-relaxed flex-grow">
          "{testimonial.text}"
        </p>

        <div className={`border-t ${getBorderColor(testimonial.type)} pt-4 mt-auto`}>
          <h3 className="font-bold text-gray-900 text-lg">
            {testimonial.author}
          </h3>
          <p className="text-gray-600">{testimonial.role}</p>
          <p className="text-sm text-gray-500 mt-1 italic">
            {testimonial.pets || testimonial.credential || testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );

  // The number of pagination dots equals the number of possible starting indices.
  const totalDots = maxIndex + 1;
  const paginationDots = [];
  for (let i = 0; i < totalDots; i++) {
    const isActive = i === currentIndex;
    paginationDots.push(
      <button
        key={i}
        onClick={() => setCurrentIndex(i)}
        className={`h-2 rounded-full transition-all duration-300 ${
          isActive ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300'
        }`}
        aria-label={`Go to slide ${i + 1}`}
      />
    );
  }

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'owner', label: 'Pet Owners' },
    { value: 'vet', label: 'Veterinarians' },
    { value: 'vendor', label: 'Vendors' }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10 lg:p-16 rounded-lg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            What Our Community Says
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base lg:text-lg">
            Hear from our diverse community about their experiences with our pet care services
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filterButtons.map(button => (
            <button
              key={button.value}
              onClick={() => setFilterType(button.value)}
              className={`px-4 py-2 rounded-full text-sm md:text-base transition-all ${
                filterType === button.value
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>

        {filteredTestimonials.length > 0 ? (
          <div {...handlers} className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{
                  // Adjust translateX based on itemsPerPage.
                  transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                }}
              >
                {filteredTestimonials.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            </div>

            {totalTestimonials > itemsPerPage && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:translate-x-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all z-10"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all z-10"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={24} className="text-gray-700" />
                </button>

                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow hover:bg-gray-50 transition-all text-sm"
                    aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
                  >
                    {isPaused ? (
                      <>
                        <Play size={16} className="text-gray-700" />
                        <span>Play</span>
                      </>
                    ) : (
                      <>
                        <Pause size={16} className="text-gray-700" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    {paginationDots}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No testimonials found for this filter. Please try another category.</p>
          </div>
        )}
      </div>
    </div>
  );
}