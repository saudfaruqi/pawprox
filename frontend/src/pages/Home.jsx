import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import '../../src/index.css';
import PetProfileWizard from '../components/PetProfileWizard';
import Header from '../components/Header';
import TestimonialsCard from '../components/TestimonialsCard';

import grid1 from '../images/three.jpg';
import grid2 from '../images/two.jpg';
import grid3 from '../images/one.jpg';
import grid4 from '../images/four.jpg';

import { 
  ChevronUp, 
  ShoppingBag, 
  Users, 
  MessageCircle, 
  Pizza, 
  MapPin, 
  AlertTriangle, 
  Dog, 
  Cat, 
  Star
} from 'lucide-react';
import Footer from '../components/Footer';
import BlogsAndUi from "../components/BlogsAndUi";
import HeroSection from '../components/HeroSection';
import PetCareEssentials from '../components/PetCareEssentials';

const WebsiteLayout = () => {

    // Authentication state with proper context management (would be better with React Context)
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [user, setUser] = useState(null);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    // UI State
    const [activeTab, setActiveTab] = useState('all');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Theme state - can be expanded with a proper theme context
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Combined useEffect for authentication and user data
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                // Simulate API fetch for user data
                const token = localStorage.getItem('token');
                if (token) {
                    // This would be a real API call in production
                    setTimeout(() => {
                        setUser({ name: 'Pet Lover', pets: [] });
                        setIsLoggedIn(true);
                        setIsLoading(false);
                    }, 800);
                } else {
                    setIsLoggedIn(false);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setIsLoggedIn(false);
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Modal management based on user state
    useEffect(() => {
        if (isLoggedIn && user) {
            const submitted = localStorage.getItem('petModalSubmitted');
            const skipTimeStr = localStorage.getItem('petModalSkippedTime');
            
            if (submitted) {
                setIsModalOpen(false);
            } else if (skipTimeStr) {
                const skipTime = parseInt(skipTimeStr, 10);
                const now = Date.now();
                // If less than 24 hours have passed since skipping, don't show the modal.
                if (now - skipTime < 86400000) {
                    setIsModalOpen(false);
                } else {
                    localStorage.removeItem('petModalSkippedTime');
                    setIsModalOpen(true);
                    setActiveModal('petProfile');
                }
            } else if (user.pets.length === 0) {
                setIsModalOpen(true);
                setActiveModal('petProfile');
            }
        }
    }, [isLoggedIn, user]);

    // Theme effect
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Scroll-to-top logic with throttling for performance
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        
        // Throttle scroll event for better performance
        let timeoutId;
        const throttledScroll = () => {
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    handleScroll();
                    timeoutId = null;
                }, 100);
            }
        };
        
        window.addEventListener('scroll', throttledScroll);
        return () => {
            window.removeEventListener('scroll', throttledScroll);
            clearTimeout(timeoutId);
        };
    }, []);
    
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Toggle theme function
    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('theme', newMode ? 'dark' : 'light');
            
            if (newMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            
            return newMode;
        });
    };

    // UI Data with improved organization
    const themeColors = {
        primary: isDarkMode ? 'bg-teal-700' : 'bg-[#2E6166]',
        primaryHover: isDarkMode ? 'hover:bg-teal-600' : 'hover:bg-[#19897F]',
        secondary: isDarkMode ? 'bg-zinc-800' : 'bg-emerald-50',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        cardBg: isDarkMode ? 'bg-zinc-900' : 'bg-white',
    };

    // Enhanced box data with more meta information
    const boxData = [
        { 
            id: 1, 
            title: "Activity and Training", 
            description: "Monitor exercise, set training goals, and track progress with our interactive tools.",
            image: grid1,
            category: "health" 
        },
        { 
            id: 2, 
            title: "Pet Profiles", 
            description: "Create detailed profiles with medical history, preferences, and memorable moments.",
            image: grid2,
            category: "health" 
        },
        { 
            id: 3, 
            title: "Health Tracker", 
            description: "Track vaccinations, medications, and vet appointments with smart reminders.",
            image: grid3,
            category: "training" 
        },
        { 
            id: 4, 
            title: "Diet and Nutrition", 
            description: "Get personalized diet recommendations based on your pet's breed, age, and health conditions.",
            image: grid4,
            category: "community" 
        },
    ];

    // Enhanced features with better organization
    const features = [
        {
            icon: ShoppingBag,
            title: "Pet Marketplace",
            description: "Browse verified listings for adoption, pet supplies, and accessories with secure transactions.",
            category: "shop",
            isNew: false
        },
        {
            icon: AlertTriangle,
            title: "Lost & Found",
            description: "Instant alerts to local community members and shelters with GPS mapping for lost pets.",
            category: "emergency",
            isNew: true
        },
        {
            icon: Users,
            title: "Pet Community",
            description: "Join breed-specific groups, participate in events, and share advice with fellow pet owners.",
            category: "community",
            isNew: false
        },
        {
            icon: Pizza,
            title: "Food & Supplies",
            description: "Auto-ordering system for your pet's favorite food with nutrition tracking and analysis.",
            category: "shop",
            isNew: false
        },
        {
            icon: MessageCircle,
            title: "AI Pet Assistant",
            description: "Get instant advice for common issues and emergency triage from our veterinarian-trained AI.",
            category: "emergency",
            isNew: true
        },
        {
            icon: MapPin,
            title: "Local Services",
            description: "Find and book appointments with top-rated vets, groomers, and pet sitters in your area.",
            category: "services",
            isNew: false
        }
    ];

    // Expanded training topics with better structure
    const topics = [
        {
            title: "Obedience Training",
            description: "Comprehensive guides to teach your dog basic commands and establish good behavior.",
            icon: <Dog size={32} className="text-emerald-600 dark:text-emerald-400" />,
            category: "Dogs",
            subcategories: ["Sit, Stay, Come", "Leash Walking", "Crate Training"],
            timeCommitment: "4-6 weeks, 15 minutes daily",
            difficulty: "Beginner to Intermediate",
            details: "Step-by-step instructions using positive reinforcement techniques with video demonstrations.",
            progress: 0
        },
        {
            title: "Behavioral Training",
            description: "Expert resources to address unwanted behaviors and develop positive habits.",
            icon: <Cat size={32} className="text-emerald-600 dark:text-emerald-400" />,
            category: "Cats",
            subcategories: ["Aggression Management", "Separation Anxiety", "Socialization"],
            timeCommitment: "2-3 months",
            difficulty: "Intermediate to Advanced",
            details: "Personalized plans based on your cat's temperament and behavioral history.",
            progress: 25
        },
        {
            title: "Special Tricks",
            description: "Tutorials to teach your pets fun and interactive tricks that strengthen your bond.",
            icon: <Star size={32} className="text-emerald-600 dark:text-emerald-400" />,
            category: "Dogs",
            subcategories: ["Roll Over", "Play Dead", "Fetch"],
            timeCommitment: "2-4 weeks, 10 minutes daily",
            difficulty: "Beginner to Intermediate",
            details: "Using positive reinforcement methods with reward tracking system.",
            progress: 50
        },
    ];

    // Statistics with animations for more impact
    const statistics = [
        { value: "50K+", label: "Happy Pets", icon: "🐾", animationDelay: "0s" },
        { value: "1000+", label: "Reunited Pets", icon: "🏠", animationDelay: "0.2s" },
        { value: "100K+", label: "Community Members", icon: "👥", animationDelay: "0.4s" },
        { value: "500+", label: "Verified Sellers", icon: "✅", animationDelay: "0.6s" }
    ];

    // When the modal is completed or skipped, update localStorage accordingly with better error handling
    const handleComplete = async (petData) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Authentication required");
            }
            
            const response = await fetch('https://pawprox-6dd216fb1ef5.herokuapp.com/savePetProfile', { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(petData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error saving pet profile');
            }
            
            const data = await response.json();
            console.log('Pet profile saved successfully:', data);
            
            // Update local user data
            setUser(prevUser => ({
                ...prevUser,
                pets: [...(prevUser.pets || []), {...petData, id: data.petId}]
            }));
            
            localStorage.setItem('petModalSubmitted', 'true');
            setIsModalOpen(false);
            setActiveModal(null);
            
            // Show success notification (could be implemented with a toast system)
            alert('Pet profile created successfully!');
        } catch (error) {
            console.error('Error saving pet profile:', error);
            alert(`Failed to save pet profile: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        console.log('Pet profile skipped');
        // Store the current timestamp so the modal is not shown for 24 hours.
        localStorage.setItem('petModalSkippedTime', Date.now().toString());
        setIsModalOpen(false);
        setActiveModal(null);
    };

    // Filter functionality for features
    const filterFeatures = (category) => {
        setActiveTab(category);
    };

    const filteredFeatures = activeTab === 'all' 
        ? features 
        : features.filter(feature => feature.category === activeTab);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300`}>
            <Header 
                isLoggedIn={isLoggedIn} 
                user={user} 
                isDarkMode={isDarkMode} 
                onToggleTheme={toggleTheme} 
            />

            <main className="pt-[100px] p-0 m-0">
                {/* Hero Section with improved messaging */}
                <HeroSection isDarkMode={isDarkMode} />

                {/* Pet Profile Modal with loading state */}
                {isModalOpen && activeModal === 'petProfile' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-8 flex flex-col items-center">
                                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-4 text-lg">Loading...</p>
                                </div>
                            ) : (
                                <PetProfileWizard 
                                    onComplete={handleComplete} 
                                    onSkip={handleSkip} 
                                    onClose={handleSkip} 
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Features Section with category filtering */}
                <section className="lg:py-20 py-8">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Everything Your Pet Needs
                            </h2>
                            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                                Discover all the tools and resources to make pet parenting easier and more enjoyable.
                            </p>
                            
                            {/* Category filter tabs */}
                            <div className="flex flex-wrap justify-center gap-2 mt-8">
                                {['all', 'shop', 'community', 'emergency', 'services'].map(category => (
                                    <button
                                        key={category}
                                        onClick={() => filterFeatures(category)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                            activeTab === category 
                                            ? `${themeColors.primary} text-white` 
                                            : `bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200`
                                        }`}
                                    >
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`group p-8 ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden`}
                                >
                                    {feature.isNew && (
                                        <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            NEW
                                        </span>
                                    )}
                                    <div className={`w-14 h-14 rounded-xl ${isDarkMode ? 'bg-teal-900' : 'bg-emerald-50'} flex items-center justify-center mb-6 group-hover:${themeColors.primaryHover.replace('hover:', '')} transition-colors duration-300`}>
                                        <feature.icon className={`w-7 h-7 ${isDarkMode ? 'text-teal-400' : 'text-[#19897F]'} group-hover:text-white transition-colors duration-300`} />
                                    </div>
                                    <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Statistics Section with animations */}
                <section className={`py-20 ${isDarkMode ? 'bg-gradient-to-r from-teal-900 to-emerald-900' : 'bg-gradient-to-r from-emerald-50 to-teal-50'}`}>
                    <div className="container mx-auto px-4">
                        <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Our Growing Impact</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {statistics.map((stat, index) => (
                                <div 
                                    key={index} 
                                    className={`text-center p-6 ${isDarkMode ? 'bg-zinc-800' : 'bg-white'} rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                                >
                                    <div className="text-4xl mb-3">{stat.icon}</div>
                                    <div className={`text-2xl md:text-3xl lg:text-4xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-[#19897F]'} mb-2`}>
                                        {stat.value}
                                    </div>
                                    <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Enhanced grid layout with filter tabs */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-8">
                            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Essential Pet Care Tools
                            </h2>
                            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                                Everything you need to provide the best care for your furry friends.
                            </p>
                            
                            {/* Category filter tabs */}
                            <div className="flex flex-wrap justify-center gap-2 mt-6">
                                {['all', 'health', 'training', 'community'].map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveTab(category)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                            activeTab === category 
                                            ? `${themeColors.primary} text-white` 
                                            : `bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200`
                                        }`}
                                    >
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 m-4 sm:m-8 lg:max-h-[120vh] h-fit overflow-hidden">
                            {boxData.filter(box => 
                                activeTab === 'all' || box.category === activeTab
                            ).map((box, index) => (
                                <div
                                    key={box.id}
                                    className={`relative group ${
                                        index === 2 ? "lg:row-span-2" : index === 3 ? "lg:col-span-2" : ""
                                    } rounded-3xl bg-gray-200 shadow-lg flex flex-col items-center overflow-hidden`}
                                >
                                    {/* Image with lazy loading */}
                                    <img
                                        src={box.image}
                                        alt={box.title}
                                        className="object-cover w-full h-full rounded-3xl transform transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />

                                    {/* Improved hover overlay with gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl">
                                        <div className="absolute bottom-0 p-6 text-white">
                                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2">
                                                {box.title}
                                            </h3>
                                            <p className="text-sm sm:text-base lg:text-lg mb-4">
                                                {box.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Improved CTA Section with animation */}
                <section className={`py-16 md:py-20 lg:py-24 ${isDarkMode ? 'bg-zinc-800' : 'bg-black'} text-white relative overflow-hidden`}>
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden opacity-20">
                        <div className="paw-print absolute top-1/4 left-1/4 text-6xl animate-float-slow">🐾</div>
                        <div className="paw-print absolute top-3/4 left-1/2 text-5xl animate-float-medium">🐾</div>
                        <div className="paw-print absolute top-1/3 right-1/4 text-7xl animate-float-fast">🐾</div>
                    </div>
                    
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8">Ready to Join the PawProx Family?</h2>
                        <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-8 md:mb-10 max-w-2xl mx-auto">
                            Start your journey towards better pet care today. Join thousands of happy pet owners in our community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/login">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                                Get Started Now
                            </button>
                            </Link>
                            <Link to="/">
                            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300">
                                Take a Tour
                            </button>
                            </Link>
                        </div>
                    </div>
                </section>

                <PetCareEssentials isDarkMode={isDarkMode} />


                <section id="training" className="py-20 bg-gradient-to-b from-[#E6F7F5] to-emerald-50">
                    <div className="container mx-auto px-4">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                            <h2 className="lg:text-4xl text-2xl font-bold text-emerald-800">Training Resources</h2>
                            <p className="text-lg text-gray-700">Enhance your pet's skills with expert guidance.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {topics.map((topic, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
                                >
                                    <div className="flex items-center justify-center mb-4">{topic.icon}</div>
                                    <h3 className="text-2xl font-semibold text-emerald-800 mb-2">{topic.title}</h3>
                                    <p className="text-gray-600 mb-4">{topic.description}</p>
                                    <ul className="mb-4">
                                        {topic.subcategories.map((sub, idx) => (
                                            <li key={idx} className="text-gray-500 text-sm">
                                                - {sub}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-sm text-gray-500">
                                        <strong>Time Commitment:</strong> {topic.timeCommitment}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        <strong>Difficulty:</strong> {topic.difficulty}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">{topic.details}</p>
                                    <button className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                                        Learn More
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <TestimonialsCard />

                <BlogsAndUi />
            </main>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="z-[999999] fixed bottom-1 right-1 p-2 lg:p-2 bg-[#19897F] text-white rounded-full shadow-lg hover:bg-[#2E6166] transition-all duration-300 transform hover:scale-110 animate-bounce"
                >
                    <ChevronUp className="h-6 w-6" />
                </button>
            )}

            {/* Global Styles for Animations */}
            <style jsx global>{`
                @keyframes float {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(15px, 15px) rotate(180deg); }
                    100% { transform: translate(0, 0) rotate(360deg); }
                }

                
            `}</style>

            <Footer />
        </div>
    );
};

export default WebsiteLayout;
