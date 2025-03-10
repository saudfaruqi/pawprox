import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, Check, Star, Search, X, Filter, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MedicalFacilities = () => {
  // State for dynamic veterinarian data
  const [vets, setVets] = useState([]);
  const [vetsLoading, setVetsLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Example time slots (organized by morning/afternoon for better UX)
  const timeSlots = {
    morning: ["09:00 AM", "10:00 AM", "11:00 AM"],
    afternoon: ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]
  };
  
  // Specialties for filtering
  const specialties = [
    "General Veterinary Care", 
    "Surgery & Emergency Care", 
    "Preventive Care & Dental",
    "Exotic Animal Care",
    "Feline Specialist"
  ];

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

  // Fetch veterinarian data
  useEffect(() => {
    const fetchVets = async () => {
      setVetsLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:5001/api/veterinarians");
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
    
    fetchVets();
    
    // Fetch booking history (if user is logged in)
    const fetchBookingHistory = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const response = await axios.get(`http://localhost:5001/api/medical-bookings?userId=${userId}`);
          setBookingHistory(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching booking history:", error);
      }
    };
    
    fetchBookingHistory();
  }, []);

  // Filter and sort veterinarians
  const filteredAndSortedVets = useMemo(() => {
    const filtered = vets.filter(vet => {
      const matchesSearch =
        vet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vet.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vet.location.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesSpecialty =
        filters.specialty === 'all' || vet.specialty === filters.specialty;
        
      const matchesAvailability =
        filters.availability === 'all' || vet.availability === filters.availability;
        
      const matchesExperience =
        filters.experience === 'all' ||
        (filters.experience === '5+ years' && parseInt(vet.experience) >= 5) ||
        (filters.experience === '10+ years' && parseInt(vet.experience) >= 10) ||
        (filters.experience === '15+ years' && parseInt(vet.experience) >= 15);
        
      const matchesRating =
        filters.rating === 'all' ||
        (filters.rating === '4+' && parseFloat(vet.rating) >= 4.0) ||
        (filters.rating === '4.5+' && parseFloat(vet.rating) >= 4.5);
        
      return matchesSearch && matchesSpecialty && matchesAvailability && 
             matchesExperience && matchesRating;
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
      setFormErrors(prev => ({ ...prev, [name]: '' }));
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
    } else if (!/^\d{10}$/.test(bookingDetails.phone.replace(/\D/g, ''))) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }
    
    if (!bookingDetails.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(bookingDetails.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit booking
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
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
      time: selectedTime,
      status: 'Confirmed',
      booking_identifier: Math.random().toString(36).substr(2, 9),
      booking_date: new Date().toISOString()
    };

    try {
      const response = await axios.post("http://localhost:5001/api/medical-bookings", bookingData);
      console.log("Booking response:", response.data);
      setBookingHistory([bookingData, ...bookingHistory]);
      setBookingStatus('confirmed');
      setStep(4);
    } catch (error) {
      console.error("Booking error:", error);
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
      <div
        className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all duration-200 ${
          selectedVet?.id === vet.id ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md' : 'hover:shadow-lg'
        }`}
        onClick={() => setSelectedVet(vet)}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0">
            <img
              src={vet.image || "/api/placeholder/80/80"}
              alt={vet.name}
              className="w-20 h-20 rounded-full object-cover mx-auto sm:mx-0"
            />
            <div className="mt-2 flex justify-center sm:justify-start items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{vet.rating}</span>
              <span className="text-gray-500 text-sm">({vet.reviews})</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{vet.name}</h3>
                <p className="text-gray-600">{vet.specialty}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {certifications.slice(0, 3).map((cert, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {cert}
                </span>
              ))}
              {certifications.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                  +{certifications.length - 3} more
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {vet.experience} years experience
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {vet.location}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calendar component for date selection
  const DateSelector = () => {
    const today = new Date();
    const nextTwoWeeks = [];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      nextTwoWeeks.push(date);
    }
    
    return (
      <div className="space-y-4">
        <h3 className="font-medium">Select Date</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {nextTwoWeeks.map((date) => {
            const dateString = date.toISOString().split('T')[0];
            const isSelected = dateString === selectedDate;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            return (
              <button
                key={dateString}
                className={`p-2 rounded-lg text-center transition-colors ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : isWeekend
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedDate(dateString)}
                disabled={isWeekend}
              >
                <div className="text-xs font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm font-bold">
                  {date.getDate()}
                </div>
                <div className="text-xs">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50 mt-[100px] py-10">
        <div className="container mx-auto px-4 max-w-5xl overflow-hidden">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
            Book Vet Consultation
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Find and book appointments with top veterinarians
          </p>

          {/* Progress Steps */}
          <div className="flex justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
            <div className="relative z-10 flex justify-between w-full">
              {[
                { num: 1, label: "Select Vet" },
                { num: 2, label: "Choose Time" },
                { num: 3, label: "Enter Details" },
                { num: 4, label: "Confirmation" }
              ].map(({ num, label }) => (
                <div key={num} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step >= num 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    } transition-colors duration-300`}
                  >
                    {step > num ? <Check className="w-5 h-5" /> : num}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Select Vet with Search and Filters */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 overflow-hidden">
                  <div className="md:col-span-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by name, specialty, or location..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-1 px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filters</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialty
                      </label>
                      <select
                        value={filters.specialty}
                        onChange={(e) => handleFilterChange('specialty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="all">All Specialties</option>
                        {specialties.map((specialty) => (
                          <option key={specialty} value={specialty}>
                            {specialty}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience
                      </label>
                      <select
                        value={filters.experience}
                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {experienceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <select
                        value={filters.rating}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {ratingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Results count */}
              {!vetsLoading && (
                <div className="text-sm text-gray-600">
                  Showing {filteredAndSortedVets.length} veterinarians
                </div>
              )}

              {/* Veterinarians List */}
              <div className="space-y-4">
                {vetsLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin h-12 w-12 border-4 border-t-blue-500 border-blue-200 rounded-full"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                    {error}
                    <button 
                      className="block mx-auto mt-2 text-sm underline"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredAndSortedVets.length === 0 ? (
                  <div className="w-full text-center py-10 bg-white rounded-lg shadow-sm">
                    <div className="text-gray-500 mb-2">No veterinarians found.</div>
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({
                          specialty: 'all',
                          availability: 'all',
                          experience: 'all',
                          rating: 'all'
                        });
                      }}
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  filteredAndSortedVets.map((vet) => (
                    <VetCard key={vet.id} vet={vet} />
                  ))
                )}
              </div>

              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                disabled={!selectedVet}
                onClick={() => setStep(2)}
              >
                Continue with {selectedVet ? selectedVet.name : 'Selected Vet'}
              </button>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0">
                  <img
                    src={selectedVet?.image || "/api/placeholder/60/60"}
                    alt={selectedVet?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedVet?.name}</h2>
                  <p className="text-gray-600">{selectedVet?.specialty}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <DateSelector />
                
                {selectedDate && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="font-medium">Select Time</h3>
                    
                    <div>
                      <h4 className="text-sm text-gray-500 mb-2">Morning</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {timeSlots.morning.map((time) => (
                          <button
                            key={time}
                            className={`p-2 text-sm rounded-lg transition-colors ${
                              selectedTime === time
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-gray-500 mb-2">Afternoon</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {timeSlots.afternoon.map((time) => (
                          <button
                            key={time}
                            className={`p-2 text-sm rounded-lg transition-colors ${
                              selectedTime === time
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedDate && selectedTime && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Your Selection</h3>
                  <div className="text-sm text-blue-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedTime}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 mt-6">
                <button
                  className="flex-1 py-2 px-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pet & Owner Details */}
          {step === 3 && (
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <div className="flex-shrink-0">
                  <img
                    src={selectedVet?.image || "/api/placeholder/60/60"}
                    alt={selectedVet?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{selectedVet?.name}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pet Name</label>
                  <input
                    type="text"
                    name="petName"
                    value={bookingDetails.petName}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 border ${formErrors.petName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your pet's name"
                  />
                  {formErrors.petName && <p className="text-red-500 text-xs mt-1">{formErrors.petName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pet Type</label>
                  <select
                    name="petType"
                    value={bookingDetails.petType}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 border ${formErrors.petType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select pet type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.petType && <p className="text-red-500 text-xs mt-1">{formErrors.petType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                  <textarea
                    name="reason"
                    value={bookingDetails.reason}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 border ${formErrors.reason ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                    placeholder="Describe the reason for the visit"
                  />
                  {formErrors.reason && <p className="text-red-500 text-xs mt-1">{formErrors.reason}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={bookingDetails.ownerName}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 border ${formErrors.ownerName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your name"
                  />
                  {formErrors.ownerName && <p className="text-red-500 text-xs mt-1">{formErrors.ownerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={bookingDetails.phone}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={bookingDetails.email}
                    onChange={handleInputChange}
                    className={`w-full mt-1 px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your email address"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  className="flex-1 py-2 px-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              {bookingStatus === 'confirmed' ? (
                <>
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
                  <button
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={resetBooking}
                  >
                    Book Another Appointment
                  </button>
                </>
              ) : (
                <>
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
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MedicalFacilities;
