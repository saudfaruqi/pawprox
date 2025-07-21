import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Check, Star, Search, Filter, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MedicalFacilities = () => {
  // State for dynamic veterinarian data
  const token = localStorage.getItem('token');
  const [vets, setVets] = useState([]);
  const [vetsLoading, setVetsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [petProfile, setPetProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Booking process states
  const [step, setStep] = useState(1);
  const [selectedVet, setSelectedVet] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [filters, setFilters] = useState({
    specialty: 'all',
    availability: 'all',
    experience: 'all',
    rating: 'all'
  });
  const [bookingDetails, setBookingDetails] = useState({
    petName: '',
    petType: '',
    reason: '',
    ownerName: '',
    phone: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [bookingStatus, setBookingStatus] = useState('');
  
  // 🔧 FIXED: Initialize booking history from localStorage immediately
  const [bookingHistory, setBookingHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem('bookingHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error parsing booking history from localStorage:', error);
      return [];
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Example time slots (organized by morning/afternoon for better UX)
  const timeSlots = {
    morning: ["09:00 AM", "10:00 AM", "11:00 AM"],
    afternoon: ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]
  };

  // Specialties for filtering
  const specialties = useMemo(() => {
    const list = vets.map(v => v.specialty);
    const unique = Array.from(new Set(list));
    return ["All", ...unique];
  }, [vets]);

  // Experience options
  const experienceOptions = [
    { value: 'all', label: 'Any Experience' },
    { value: '5+ years', label: '5+ years' },
    { value: '10+ years', label: '10+ years' },
    { value: '15+ years', label: '15+ years' }
  ];

  // Rating options
  const ratingOptions = [
    { value: 'all', label: 'Any Rating' },
    { value: '4+', label: '4+ Stars' },
    { value: '4.5+', label: '4.5+ Stars' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'experience', label: 'Most Experienced' },
    { value: 'reviews', label: 'Most Reviews' }
  ];

  // 🔧 FIXED: Separate useEffect for saving to localStorage
  useEffect(() => {
    if (bookingHistory.length > 0) {
      try {
        localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory));
        console.log('✅ Booking history saved to localStorage:', bookingHistory.length, 'items');
      } catch (error) {
        console.error('❌ Error saving booking history to localStorage:', error);
      }
    }
  }, [bookingHistory]);

  // 1️⃣ Load the first pet profile for the user
  useEffect(() => {
    const loadPetProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const { data } = await axios.get(
          'https://pawprox-6dd216fb1ef5.herokuapp.com/api/pets',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pets = data.pets || data;
        if (pets.length) {
          setPetProfile(pets[0]);
        }
      } catch (err) {
        if (err.response?.status !== 401) console.error('Pets load error:', err);
      }
    };

    loadPetProfile();
  }, []);

  // 2️⃣ When petProfile arrives, seed bookingDetails
  useEffect(() => {
    if (!petProfile) return;

    setBookingDetails(fd => ({
      ...fd,
      petName: petProfile.name || fd.petName,
      petType: petProfile.type || fd.petType,
    }));
  }, [petProfile]);

  // 3️⃣ Load the authenticated user's profile
  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const { data } = await axios.get(
          'https://pawprox-6dd216fb1ef5.herokuapp.com/api/users/profile',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserProfile(data.user);
      } catch (err) {
        if (err.response?.status !== 401) console.error('User load error:', err);
      }
    };

    loadUserProfile();
  }, []);

  // 4️⃣ When userProfile arrives, seed emergency contact fields
  useEffect(() => {
    if (!userProfile) return;

    setBookingDetails(fd => ({
      ...fd,
      ownerName: userProfile.name || fd.ownerName,
      phone: userProfile.phone || fd.phone,
      email: userProfile.email || fd.email,
    }));
  }, [userProfile]);

  // Fetch veterinarian data and booking history
  useEffect(() => {
    const fetchVets = async () => {
      setVetsLoading(true);
      setError(null);
      try {
        const response = await axios.get("https://pawprox-6dd216fb1ef5.herokuapp.com/api/veterinarians");
        console.log("Fetched vets:", response.data);
        const fetchedVets = response.data.items || response.data;
        setVets(fetchedVets);
      } catch (error) {
        console.error("Error fetching veterinarians:", error);
        setError("Failed to load veterinarians. Please try again later.");
      } finally {
        setVetsLoading(false);
      }
    };

    // 🔧 FIXED: Better booking history fetching and merging
    const fetchBookingHistory = async () => {
      try {
        const userId = localStorage.getItem('userId');
        let serverHistory = [];
        
        if (userId && token) {
          const response = await axios.get(
            `https://pawprox-6dd216fb1ef5.herokuapp.com/api/medical-bookings?userId=${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          serverHistory = response.data || [];
        }

        // Get local history (already initialized in state)
        const localHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
        
        // Merge and deduplicate based on booking_identifier
        const mergedHistory = [...localHistory, ...serverHistory].reduce((acc, curr) => {
          const exists = acc.find(item => 
            item.booking_identifier === curr.booking_identifier ||
            (item.vet_id === curr.vet_id && item.date === curr.date && item.time === curr.time)
          );
          
          if (!exists) {
            acc.push(curr);
          }
          return acc;
        }, []);

        // Sort by booking_date (most recent first)
        mergedHistory.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
        
        setBookingHistory(mergedHistory);
        console.log('📋 Loaded booking history:', mergedHistory.length, 'items');
      } catch (error) {
        console.error("Error fetching booking history:", error);
      }
    };

    fetchVets();
    fetchBookingHistory();
  }, [token]);

  // Filter and sort veterinarians
  const filteredAndSortedVets = useMemo(() => {
    const filtered = vets.filter(vet => {
      const matchesSearch = vet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vet.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vet.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty = filters.specialty === 'all' || vet.specialty === filters.specialty;
      const matchesAvailability = filters.availability === 'all' || vet.availability === filters.availability;
      const matchesExperience = filters.experience === 'all' ||
        (filters.experience === '5+ years' && parseInt(vet.experience) >= 5) ||
        (filters.experience === '10+ years' && parseInt(vet.experience) >= 10) ||
        (filters.experience === '15+ years' && parseInt(vet.experience) >= 15);

      const matchesRating = filters.rating === 'all' ||
        (filters.rating === '4+' && parseFloat(vet.rating) >= 4.0) ||
        (filters.rating === '4.5+' && parseFloat(vet.rating) >= 4.5);

      return matchesSearch && matchesSpecialty && matchesAvailability && matchesExperience && matchesRating;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating') {
        return parseFloat(b.rating) - parseFloat(a.rating);
      } else if (sortBy === 'experience') {
        return parseInt(b.experience) - parseInt(a.experience);
      } else if (sortBy === 'reviews') {
        return parseInt(b.reviews) - parseInt(a.reviews);
      }
      return 0;
    });
  }, [searchQuery, filters, vets, sortBy]);

  // Handle changes in booking details inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    if (!bookingDetails.petName.trim()) errors.petName = "Pet name is required";
    if (!bookingDetails.petType) errors.petType = "Please select a pet type";
    if (!bookingDetails.reason.trim()) errors.reason = "Reason for visit is required";
    if (!bookingDetails.ownerName.trim()) errors.ownerName = "Your name is required";
    
    if (!bookingDetails.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^(?:\+92|0)?3\d{9}$/.test(bookingDetails.phone)) {
      errors.phone = "Enter a valid Pakistan mobile: e.g. +923XXXXXXXXX, 03XXXXXXXXX, or 3XXXXXXXXX";
    }

    if (!bookingDetails.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(bookingDetails.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Convert 12-hour time to 24-hour SQL format
  function toSqlTime(twelveHour) {
    const [timePart, modifier] = twelveHour.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}:00`;
  }

  const handleSubmit = async () => {
    console.log("🔔 handleSubmit called");
    console.log("▶️ selectedVet:", selectedVet);
    console.log("▶️ selectedDate:", selectedDate);
    console.log("▶️ selectedTime:", selectedTime);
    console.log("▶️ bookingDetails:", bookingDetails);

    // Validation checks
    if (!selectedVet) {
      console.error("❌ No vet selected!");
      return;
    }
    if (!selectedDate || !selectedTime) {
      console.error("❌ Date or time missing!");
      return;
    }
    if (!validateForm()) {
      console.error("❌ Validation failed", formErrors);
      return;
    }

    setIsSubmitting(true);

    const bookingData = {
      vet_id: selectedVet.id,
      petName: bookingDetails.petName,
      petType: bookingDetails.petType,
      reason: bookingDetails.reason,
      ownerName: bookingDetails.ownerName,
      phone: bookingDetails.phone,
      email: bookingDetails.email,
      date: selectedDate,
      time: toSqlTime(selectedTime),
      status: 'Confirmed',
      booking_identifier: Math.random().toString(36).substr(2, 9),
      booking_date: new Date().toISOString(),
    };

    console.log("➡️ POST /medical-bookings", {
      data: bookingData,
      headers: { Authorization: `Bearer ${token}` }
    });

    try {
      const response = await axios.post(
        "https://pawprox-6dd216fb1ef5.herokuapp.com/api/medical-bookings",
        bookingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Booking response:", response.status, response.data);
      setBookingStatus('confirmed');
      
      // 🔧 FIXED: Add new booking to history and trigger localStorage save
      setBookingHistory(prev => {
        const newHistory = [bookingData, ...prev];
        // Save immediately to localStorage as backup
        try {
          localStorage.setItem('bookingHistory', JSON.stringify(newHistory));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
        return newHistory;
      });
      
      setStep(4);
    } catch (error) {
      console.error("❌ Booking error:", error.response || error.message);
      setBookingStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset booking when returning to first step
  const resetBooking = () => {
    setSelectedVet(null);
    setSelectedDate('');
    setSelectedTime('');
    setBookingDetails({
      petName: '',
      petType: '',
      reason: '',
      ownerName: '',
      phone: '',
      email: ''
    });
    setFormErrors({});
    setBookingStatus('');
    setStep(1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // VetCard displays a single veterinarian's details
  const VetCard = ({ vet }) => {
    let certifications = [];
    if (Array.isArray(vet.certifications)) {
      certifications = vet.certifications;
    } else if (typeof vet.certifications === 'string' && vet.certifications.trim() !== '') {
      try {
        const parsed = JSON.parse(vet.certifications);
        certifications = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        try {
          certifications = vet.certifications.split(',').map(cert => cert.trim());
        } catch (e) {
          certifications = [];
        }
      }
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{vet.name}</h3>
            <p className="text-blue-600 font-semibold">{vet.specialty}</p>
          </div>
          <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-yellow-700 font-semibold">{vet.rating}</span>
            <span className="text-gray-600 ml-1">({vet.reviews})</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{vet.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{vet.experience} experience</span>
          </div>
        </div>

        {certifications.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Certifications:</p>
            <div className="flex flex-wrap gap-1">
              {certifications.slice(0, 3).map((cert, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {cert}
                </span>
              ))}
              {certifications.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{certifications.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setSelectedVet(vet);
            setStep(2);
          }}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Book Appointment
        </button>
      </div>
    );
  };

  // 🔧 ADDED: Function to display booking history
  const BookingHistorySection = () => {
    if (bookingHistory.length === 0) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No booking history found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Booking History</h3>
        {bookingHistory.slice(0, 5).map((booking, index) => (
          <div key={booking.booking_identifier || index} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-800">{booking.petName}</p>
                <p className="text-sm text-gray-600">Booking ID: {booking.booking_identifier}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                booking.status === 'Confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                <p><strong>Time:</strong> {booking.time}</p>
              </div>
              <div>
                <p><strong>Pet Type:</strong> {booking.petType}</p>
                <p><strong>Reason:</strong> {booking.reason}</p>
              </div>
            </div>
          </div>
        ))}
        {bookingHistory.length > 5 && (
          <p className="text-sm text-gray-600 text-center">
            Showing 5 of {bookingHistory.length} bookings
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-[100px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Book Your Pet's Appointment</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find and book appointments with certified veterinarians in your area. 
            Your pet's health is our priority.
          </p>
        </div>

        {/* Progress indicator */}
        {step <= 3 && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= stepNum 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-0.5 ${
                      step > stepNum ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Choose Veterinarian */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Search and filters */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, specialty, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Advanced filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                    <select
                      value={filters.specialty}
                      onChange={(e) => handleFilterChange('specialty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Specialties</option>
                      {specialties.slice(1).map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <select
                      value={filters.experience}
                      onChange={(e) => handleFilterChange('experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {experienceOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {ratingOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      value={filters.availability}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Any Availability</option>
                      <option value="Available Today">Available Today</option>
                      <option value="Available This Week">Available This Week</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Booking History Section */}
            {bookingHistory.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <BookingHistorySection />
              </div>
            )}

            {/* Veterinarians grid */}
            <div className="space-y-6">
              {vetsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading veterinarians...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredAndSortedVets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No veterinarians found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        specialty: 'all',
                        availability: 'all',
                        experience: 'all',
                        rating: 'all'
                      });
                    }}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAndSortedVets.map((vet) => (
                    <VetCard key={vet.id} vet={vet} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && selectedVet && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Veterinarians
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Date & Time</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedVet.name}</h3>
                      <p className="text-blue-600">{selectedVet.specialty}</p>
                    </div>
                    <div className="ml-auto flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-yellow-700 font-semibold">{selectedVet.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {selectedDate && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {formatDate(selectedDate)}
                    </p>
                  )}
                </div>

                {/* Time Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Time</h3>
                  
                  <div className="space-y-4">
                    {/* Morning slots */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Morning</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.morning.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 text-sm border rounded-lg transition-colors ${
                              selectedTime === time
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Afternoon slots */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Afternoon</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.afternoon.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 text-sm border rounded-lg transition-colors ${
                              selectedTime === time
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    selectedDate && selectedTime
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue to Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Booking Details */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Date & Time
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Details</h2>

              {/* Appointment Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Appointment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Veterinarian:</span>
                    <p className="font-semibold">{selectedVet?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-semibold">{formatDate(selectedDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <p className="font-semibold">{selectedTime}</p>
                  </div>
                </div>
              </div>

              <form className="space-y-6">
                {/* Pet Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      name="petName"
                      value={bookingDetails.petName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.petName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your pet's name"
                    />
                    {formErrors.petName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.petName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Type *
                    </label>
                    <select
                      name="petType"
                      value={bookingDetails.petType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.petType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select pet type</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Fish">Fish</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.petType && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.petType}</p>
                    )}
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit *
                  </label>
                  <textarea
                    name="reason"
                    value={bookingDetails.reason}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.reason ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Please describe your pet's symptoms or reason for the visit..."
                  />
                  {formErrors.reason && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.reason}</p>
                  )}
                </div>

                {/* Owner Information */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        value={bookingDetails.ownerName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.ownerName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your name"
                      />
                      {formErrors.ownerName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.ownerName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={bookingDetails.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+923XXXXXXXXX or 03XXXXXXXXX"
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={bookingDetails.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                </div>
              </form>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              {bookingStatus === 'confirmed' ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
                  <p className="text-gray-700 mb-6">
                    Your appointment with {selectedVet?.name} has been confirmed for {formatDate(selectedDate)} at {selectedTime}.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg text-left mb-6">
                    <h3 className="font-semibold mb-2">Booking Details</h3>
                    <p><strong>Booking ID:</strong> {bookingHistory[0]?.booking_identifier}</p>
                    <p><strong>Pet Name:</strong> {bookingDetails.petName}</p>
                    <p><strong>Pet Type:</strong> {bookingDetails.petType}</p>
                    <p><strong>Owner Name:</strong> {bookingDetails.ownerName}</p>
                    <p><strong>Contact:</strong> {bookingDetails.phone} | {bookingDetails.email}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={resetBooking}
                    >
                      Book Another Appointment
                    </button>
                    <button
                      className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => setStep(1)}
                    >
                      View All Veterinarians
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-red-600">×</span>
                  </div>
                  <h2 className="text-2xl font-bold text-red-600 mb-4">Booking Failed</h2>
                  <p className="text-gray-700 mb-6">
                    There was an error processing your booking. Please try again later.
                  </p>
                  <button
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setStep(3)}
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MedicalFacilities;