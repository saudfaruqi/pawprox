import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Phone, Mail, Check, Search, X, AlertCircle, Info, Award } from 'lucide-react';
import axios from "axios";
import Header from '../components/Header';
import Footer from '../components/Footer';

const PetCareServices = () => {
  const bookingFormRef = useRef(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingHistory, setBookingHistory] = useState(() => {
  const saved = localStorage.getItem("petcare_bookingHistory");
  return saved ? JSON.parse(saved) : [];
});

  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);

  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    date: '',
    time: '',
    notes: '',
    petWeight: '',
    emergencyContact: '',
    vaccination: 'unknown'
  });

  useEffect(() => {
  localStorage.setItem(
    "petcare_bookingHistory",
    JSON.stringify(bookingHistory)
  );
}, [bookingHistory]);


  const [petProfile, setPetProfile]     = useState(null);
  const [userProfile, setUserProfile]   = useState(null);

  // 1️⃣ Load pet profile (as you already have)
  useEffect(() => {
    const loadPetProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get(
          "https://pawprox-6dd216fb1ef5.herokuapp.com/api/pets", 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pets = data.pets || data;
        if (pets.length) setPetProfile(pets[0]);
      } catch (err) {
        if (err.response?.status !== 401) console.error(err);
      }
    };
    loadPetProfile();
  }, []);

  // 2️⃣ Seed formData when petProfile arrives
  useEffect(() => {
    if (!petProfile) return;
    setFormData(fd => ({
      ...fd,
      petName:     petProfile.name
                      ? petProfile.name 
                      : fd.petName,
      petType:     petProfile.type,
      petWeight:   petProfile.weight,
      vaccination: petProfile.vaccinations?.length 
                      ? "up-to-date" 
                      : fd.vaccination
    }));
  }, [petProfile]);

  // 3️⃣ Load user profile (for emergencyContact)
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get(
          "https://pawprox-6dd216fb1ef5.herokuapp.com/api/users/profile", 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // assuming your endpoint returns { user: { phone, email, ... } }
        setUserProfile(data.user);
      } catch (err) {
        if (err.response?.status !== 401) console.error(err);
      }
    };
    loadUserProfile();
  }, []);

  // 4️⃣ Seed formData when userProfile arrives
  useEffect(() => {
    if (!userProfile) return;
    setFormData(fd => ({
      ...fd,
      emergencyContact: userProfile.phone || fd.emergencyContact
    }));
  }, [userProfile]);


  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch pet care services dynamically from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setError('');
        const response = await axios.get("https://pawprox-6dd216fb1ef5.herokuapp.com/api/petcare"); 
        // Use response.data.items if exists; otherwise, assume the response is an array
        const fetchedServices = response.data.items || response.data;
        setServices(fetchedServices);
      } catch (error) {
        console.error("Error fetching pet care services:", error);
        setError('Unable to load services. Please try again later.');
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Filter booking history based on search query
  const filteredHistory = bookingHistory.filter(booking => 
    booking.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter services by category and search query
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
                          (activeFilter === 'grooming' && service.category === 'grooming') ||
                          (activeFilter === 'walking' && service.category === 'walking') ||
                          (activeFilter === 'boarding' && service.category === 'boarding') ||
                          (activeFilter === 'veterinary' && service.category === 'veterinary');
    
    return matchesSearch && matchesFilter;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: 'smooth' });
    }
  };
  

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedService) return;

  const payload = {
    service_id:      selectedService.id,
    pet_name:        formData.petName,
    pet_type:        formData.petType,
    pet_weight:      formData.petWeight,
    date:            formData.date,
    time:            formData.time,
    notes:           formData.notes,
    emergency_contact: formData.emergencyContact,
    vaccination:     formData.vaccination,
  };

  try {
    // 1️⃣ Send to backend (this will trigger your createBooking email)
    const { data } = await axios.post(
      "https://pawprox-6dd216fb1ef5.herokuapp.com/api/bookings",
      payload,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } } 
    );

    // 2️⃣ Grab the bookingId from response
    const bookingIdentifier = data.bookingId;

    // 3️⃣ Now update local history
    const newBooking = {
      ...formData,
      service:       selectedService.name,
      bookingId:     bookingIdentifier,
      status:        'Confirmed',
      bookingDate:   new Date().toLocaleString(),
    };
    setBookingHistory([newBooking, ...bookingHistory]);
    setBookingStatus('confirmed');

    // 4️⃣ Reset form & scroll
    setFormData({
      petName: '',
      petType: '',
      date: '',
      time: '',
      notes: '',
      petWeight: '',
      emergencyContact: '',
      vaccination: 'unknown'
    });
    setTimeout(() => {
      document.getElementById('confirmation-message')
        .scrollIntoView({ behavior: 'smooth' });
    }, 100);

  } catch (err) {
    console.error("Booking API error:", err);
    setError("Sorry, we couldn't complete your booking. Please try again.");
  }
};




// Cancel: simply mark the booking as cancelled
const handleCancel = async (bookingId) => {
  try {
    // call your cancel endpoint
    await axios.delete(
      `https://pawprox-6dd216fb1ef5.herokuapp.com/api/bookings/${bookingId}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } } 
    );
    // if HTTP 200, update local list
    setBookingHistory(prev =>
      prev.map(b =>
        b.bookingId === bookingId
          ? { ...b, status: 'Cancelled' }
          : b
      )
    );
  } catch (err) {
    console.error("Cancel API error:", err);
    setError("Sorry, we couldn't cancel your booking. Please try again.");
  }
};

// Reschedule: open the booking form with this booking’s data
const handleReschedule = async (bookingId) => {
  const booking = bookingHistory.find(b => b.bookingId === bookingId);
  if (!booking) return;

  // pre-fill the form
  setSelectedService(services.find(s => s.name === booking.service));
  setFormData({
    petName: booking.petName,
    petType: booking.petType,
    petWeight: booking.petWeight,
    vaccination: booking.vaccination,
    date: booking.date,
    time: booking.time,
    emergencyContact: booking.emergencyContact,
    notes: booking.notes,
  });

  try {
    // call your update endpoint
    await axios.put(
      `https://pawprox-6dd216fb1ef5.herokuapp.com/api/bookings/${bookingId}`, 
      { date: booking.date, time: booking.time, status: 'Confirmed' },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    // update local history
    setBookingHistory(prev =>
      prev.map(b =>
        b.bookingId === bookingId
          ? { ...b, date: booking.date, time: booking.time, status: 'Confirmed' }
          : b
      )
    );
    // scroll to the form
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error("Reschedule API error:", err);
    setError("Sorry, we couldn't reschedule your booking. Please try again.");
  }
};



  const getServiceIcon = (category) => {
    switch(category) {
      case 'grooming':
        return <Award className="w-12 h-12 text-purple-500" />;
      case 'walking':
        return <MapPin className="w-12 h-12 text-green-500" />;
      case 'boarding':
        return <Calendar className="w-12 h-12 text-blue-500" />;
      case 'veterinary':
        return <Info className="w-12 h-12 text-red-500" />;
      default:
        return <Info className="w-12 h-12 text-gray-500" />;
    }
  };

  const calculateAvailableTimeSlots = () => {
    if (!selectedService || !formData.date) return [];
    
    // This would normally be calculated based on the selected service and date
    // For now, we'll return some dummy time slots
    return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  };


  useEffect(() => {
    if (selectedService && bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedService]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-6 mt-[100px]">
        {/* Hero Section */}
        <div className="bg-[#2E6166] rounded-2xl p-6 sm:p-10 mb-8 text-white shadow-xl">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Professional Pet Care Services</h1>
            <p className="text-lg opacity-90 mb-6">We treat your pets like family - professional and reliable care for your beloved companions</p>
            <button 
              onClick={() => document.getElementById('services-section').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-lg"
            >
              Explore Services
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search services or bookings..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeFilter === 'all' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Services
                </button>
                <button
                  onClick={() => setActiveFilter('grooming')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeFilter === 'grooming' 
                      ? 'bg-purple-100 text-purple-700 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Grooming
                </button>
                <button
                  onClick={() => setActiveFilter('walking')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeFilter === 'walking' 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dog Walking
                </button>
                <button
                  onClick={() => setActiveFilter('boarding')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeFilter === 'boarding' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Boarding
                </button>
                <button
                  onClick={() => setActiveFilter('veterinary')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeFilter === 'veterinary' 
                      ? 'bg-red-100 text-red-700 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Veterinary
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div id="services-section" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Services</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}
          
          {servicesLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin h-16 w-16 border-4 border-t-blue-500 border-gray-300 rounded-full"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No services found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredServices.map((service) => (
                <div 
                  key={service.id}
                  className={`cursor-pointer p-6 rounded-xl shadow-md transition-all transform hover:-translate-y-1 hover:shadow-lg ${
                    selectedService?.id === service.id 
                      ? 'bg-blue-50 border-2 border-blue-500' 
                      : 'bg-white border border-gray-100'
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      {getServiceIcon(service.category)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{service.name}</h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        service.category === 'grooming' ? 'bg-purple-100 text-purple-800' :
                        service.category === 'walking' ? 'bg-green-100 text-green-800' :
                        service.category === 'boarding' ? 'bg-blue-100 text-blue-800' :
                        service.category === 'veterinary' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {service.category?.charAt(0).toUpperCase() + service.category?.slice(1) || 'Service'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{service.availability}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <span className="text-lg font-bold text-blue-600">{service.price}</span>
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <p className="font-medium text-sm text-gray-700 mb-2">Features:</p>
                    <ul className="text-sm text-gray-600">
                      {service.features?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 mb-1">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceSelect(service);
                    }}
                    className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Form */}
        {selectedService && (
          <div
            key={petProfile ? petProfile.id : "no-profile"}
            ref={bookingFormRef}
            id="booking-form"
            className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Book {selectedService.name}</h2>
            <form id="booking-form" ref={bookingFormRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Name*
                  </label>
                  <input
                    type="text"
                    name="petName"
                    value={formData.petName}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Type*
                  </label>
                  <select name="petType" value={formData.petType} onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="">Select pet type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Reptile">Reptile</option>
                    <option value="Fish">Fish</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Weight (lbs)*
                  </label>
                  <input
                    type="number"
                    name="petWeight"
                    value={formData.petWeight}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vaccination Status*
                  </label>
                  <select
                    name="vaccination"
                    value={formData.vaccination}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="unknown">Unknown</option>
                    <option value="up-to-date">Up to date</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time*
                  </label>
                  {formData.date ? (
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    >
                      <option value="">Select a time</option>
                      {calculateAvailableTimeSlots().map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full p-3 border rounded-lg bg-gray-50 text-gray-500">
                      Please select a date first
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact*
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={e =>
                    setFormData(fd => ({
                      ...fd,
                      emergencyContact: e.target.value
                    }))
                  }
                  placeholder="92 3456789026"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Notes or Instructions
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special requirements, allergies, or instructions for our staff"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows="3"
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Service Details</p>
                    <p className="text-sm text-blue-600 mt-1">
                      {selectedService.description}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      Price: <span className="font-bold">{selectedService.price}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        )}

        {/* Confirmation Message */}
        {bookingStatus === 'confirmed' && (
          <div id="confirmation-message" className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Booking Confirmed!</h3>
                <p className="text-green-700">
                  Your booking for {selectedService.name} has been confirmed. We'll contact you shortly with additional details.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-green-700">
                  <div>
                    <span className="font-medium" value={formData.petName}>Pet:</span> {formData.petName}
                  </div>
                  <div>
                    <span className="font-medium">Service:</span> {selectedService.name}
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setShowHistory(true);
                      setTimeout(() => {
                        document.getElementById('booking-history').scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="text-green-700 hover:text-green-900 font-medium underline"
                  >
                    View in Booking History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking History Toggle */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            {showHistory ? (
              <>
                <X className="w-4 h-4" />
                Hide Booking History
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Show Booking History
              </>
            )}
          </button>
          
          {showHistory && bookingHistory.length > 0 && (
            <span className="text-sm text-gray-500">
              {filteredHistory.length} of {bookingHistory.length} bookings
            </span>
          )}
        </div>

        {/* Booking History */}
        {showHistory && (
          <div id="booking-history" className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6">Booking History</h2>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No bookings found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredHistory.map((booking) => (
                  <div 
                    key={booking.bookingId}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{booking.service}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Pet:</span> {booking.petName} ({booking.petType})
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Booked on:</span>
                            <span>{booking.bookingDate}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleReschedule(booking.bookingId)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                        >
                          Reschedule
                        </button>

                        <button
                          onClick={() => handleCancel(booking.bookingId)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Why Choose Us Section */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6">Why Choose Our Pet Care Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Certified Professionals</h3>
              <p className="text-gray-600">Our team consists of certified pet care professionals with years of experience</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Personalized Care</h3>
              <p className="text-gray-600">We create customized care plans based on your pet's specific needs and preferences</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">Easy online booking with flexible scheduling options to fit your busy lifestyle</p>
            </div>
          </div>
        </div>

        {/* Contact and FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Contact Information */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Need Help?</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Call us</p>
                  <a href="tel:(555)123-4567" className="text-lg font-medium hover:text-blue-600 transition-colors">+92 3408355962</a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email us</p>
                  <a href="mailto:pawprox2025@gmail.com" className="text-lg font-medium hover:text-blue-600 transition-colors">pawprox2025@gmail.com</a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Find us</p>
                  <p className="text-lg font-medium">DHA Phase 7, Karachi, Pakistan</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium text-lg mb-4">Business Hours</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday:</span>
                  <span className="font-medium">8:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday:</span>
                  <span className="font-medium">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday:</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">What should I bring for my pet's first visit?</h3>
                <p className="text-gray-600">
                  For your pet's first visit, please bring vaccination records, any medication they're taking, and their favorite toy or comfort item if needed.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">How far in advance should I book services?</h3>
                <p className="text-gray-600">
                  We recommend booking at least 48 hours in advance, but for holidays and peak seasons, earlier booking (1-2 weeks) is advised.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">What is your cancellation policy?</h3>
                <p className="text-gray-600">
                  Cancellations made 24+ hours before appointment will receive a full refund. Cancellations within 24 hours may be subject to a 50% fee.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Do you offer emergency services?</h3>
                <p className="text-gray-600">
                  For medical emergencies, please contact your veterinarian or animal emergency hospital. We offer same-day boarding in emergency situations when possible.
                </p>
              </div>
            </div>
            
            <Link to="/contact">
            <button className="mt-6 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors font-medium">
              More Questions?
            </button>
            </Link>
          </div>
        </div>

      </div>
      <Footer/>
    </div>
  );
};

export default PetCareServices;