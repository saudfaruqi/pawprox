import React, { useState, useEffect } from 'react';
import { UserCircle2, Store, Stethoscope, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

import blog1 from '../images/blog1.png';
import blog2 from '../images/blog2.jpg';
import blog3 from '../images/blog3.webp';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-lg transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const PlatformSections = () => {
    const userTypes = [
        {
            title: 'Pet Owners',
            icon: UserCircle2,
            description:
                'Find trusted veterinarians, book appointments, and access pet care resources all in one place. Track your pet\'s health records and get reminders for vaccinations and checkups.',
            color: 'from-blue-400 to-blue-600',
            textColor: 'text-blue-600',
            link: '/for-pet-owners'
        },
        {
            title: 'Vendors',
            icon: Store,
            description:
                'Expand your pet business reach. Manage appointments, showcase products and services, and connect with pet owners in your area.',
            color: 'from-emerald-400 to-emerald-600',
            textColor: 'text-emerald-600',
            link: '/for-vendors'
        },
        {
            title: 'Veterinarians',
            icon: Stethoscope,
            description:
                'Streamline your practice with digital health records, appointment management, and seamless communication with pet owners.',
            color: 'from-violet-400 to-violet-600',
            textColor: 'text-violet-600',
            link: '/for-veterinarians'
        },
    ];

    const newsItems = [
        {
            title: 'Pet Care Tips: Keeping Your Pet Healthy & Happy',
            image: blog1,
            date: new Date('2025-01-05').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            preview: 'Discover essential tips for maintaining your pet\'s health and happiness with expert advice from leading veterinarians.',
            author: 'Dr. Jane Smith',
            category: 'Pet Care',
            tags: ['Health', 'Tips', 'Wellness'],
            readMoreLink: '/blog/pet-care-tips',
        },
        {
            title: 'Latest Breakthroughs in Veterinary Medicine',
            image: blog2,
            date: new Date('2025-01-04').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            preview: 'Stay informed about the latest advancements in veterinary medicine and how they\'re improving pet healthcare.',
            author: 'Dr. Michael Turner',
            category: 'Veterinary Medicine',
            tags: ['Research', 'Innovation'],
            readMoreLink: '/blog/latest-veterinary-breakthroughs',
        },
        {
            title: 'Pet Industry Trends: What to Expect in 2025',
            image: blog3,
            date: new Date('2025-01-03').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            preview: 'Explore the emerging trends shaping the future of pet care and what they mean for pet owners and businesses.',
            author: 'Sarah Johnson',
            category: 'Industry Trends',
            tags: ['Trends', 'Industry'],
            readMoreLink: '/blog/pet-industry-trends-2025',
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoplay, setAutoplay] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    // Autoplay functionality for carousel
    useEffect(() => {
        let interval;
        if (autoplay && !isHovering) {
            interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [autoplay, isHovering, newsItems.length]);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
            setAutoplay(false);
        },
        onSwipedRight: () => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + newsItems.length) % newsItems.length);
            setAutoplay(false);
        },
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + newsItems.length) % newsItems.length);
        setAutoplay(false);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
        setAutoplay(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 bg-gradient-to-b from-white to-gray-50">
            {/* User Types Section */}
            <section>
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4">Our Platform</span>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Who We Serve</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Connecting pet care professionals with pet owners for better health outcomes</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {userTypes.map((type, index) => (
                        <Card 
                            key={index} 
                            className="group hover:shadow-xl transform transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className="p-8">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                                    <type.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className={`text-2xl font-bold mb-4 ${type.textColor}`}>{type.title}</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">{type.description}</p>
                                <Link 
                                    to={type.link}
                                    className={`inline-flex items-center font-semibold ${type.textColor} hover:opacity-80 transition-opacity`}
                                >
                                    Learn More
                                    <svg
                                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* News and Blogs Section */}
            <section className="relative">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium text-sm mb-4">Stay Informed</span>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Pet News & Insights</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Stay informed with the latest updates in pet care and veterinary medicine</p>
                </div>
                
                {/* Mobile Swipeable Carousel */}
                <div 
                    className="lg:hidden" 
                    {...handlers}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <div className="flex justify-center items-center">
                        <Card className="group hover:shadow-xl w-full overflow-hidden">
                            <div className="h-full">
                                <div className="relative">
                                    <img
                                        src={newsItems[currentIndex].image}
                                        alt={newsItems[currentIndex].title}
                                        className="w-full h-64 object-cover rounded-t-xl transform transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 text-sm font-medium bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                                            {newsItems[currentIndex].category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center mb-4 text-gray-500">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span className="text-sm">{newsItems[currentIndex].date}</span>
                                        <span className="mx-2 text-gray-300">•</span>
                                        <User className="w-4 h-4 mr-1" />
                                        <span className="text-sm">{newsItems[currentIndex].author}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        {newsItems[currentIndex].title}
                                    </h3>
                                    <p className="text-gray-600 mb-6 line-clamp-3">{newsItems[currentIndex].preview}</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {newsItems[currentIndex].tags.map((tag, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-700">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={newsItems[currentIndex].readMoreLink}
                                            className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                                        >
                                            Read More
                                            <svg
                                                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                    
                    {/* Carousel navigation dots */}
                    <div className="flex justify-center mt-6 space-x-2">
                        {newsItems.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setAutoplay(false);
                                }}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    currentIndex === index ? 'bg-blue-600 w-6' : 'bg-gray-300'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                    
                    {/* Navigation buttons */}
                    <button
                        onClick={handlePrevious}
                        className="absolute top-2/3 -left-2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg text-gray-800 hover:text-blue-600 transition-colors z-10"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute top-2/3 -right-2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg text-gray-800 hover:text-blue-600 transition-colors z-10"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Desktop Grid Layout for 3 Items */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                    {newsItems.map((item, index) => (
                        <Card 
                            key={index} 
                            className="group hover:shadow-xl transform transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                        >
                            <div className="h-full">
                                <div className="relative overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full min-h-64 object-cover rounded-t-xl transform transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 text-sm font-medium bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center mb-4 text-gray-500">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span className="text-sm">{item.date}</span>
                                        <span className="mx-2 text-gray-300">•</span>
                                        <User className="w-4 h-4 mr-1" />
                                        <span className="text-sm">{item.author}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6 line-clamp-3">{item.preview}</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {item.tags.map((tag, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-700">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={item.readMoreLink}
                                            className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                                        >
                                            Read More
                                            <svg
                                                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PlatformSections;