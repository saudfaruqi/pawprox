


import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, AlertCircle, Loader2, X, Filter, ChevronDown, Camera, Phone } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Import React-Leaflet components and Leaflet CSS
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const activeRole = localStorage.getItem("activeRole") || "user";
const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;


// Fix default icon issues with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * LocationAutocomplete Component
 * Fetches address suggestions from the Nominatim API as the user types.
 */
const LocationAutocomplete = ({ value, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (value && value.length > 3) {
      const timeoutId = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`)
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data);
            setShowSuggestions(true);
          })
          .catch((err) => console.error(err));
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const handleSelect = (suggestion) => {
    onSelect(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-blue-500 outline-none"
        placeholder="Neighborhood, street, landmark, etc."
        required
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
          {suggestions.map((sug) => (
            <li
              key={sug.place_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(sug)}
            >
              {sug.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Component to display a single pet alert with improved design and edit/delete options
const PetCard = ({ alert, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const statusColors = {
    lost: 'bg-red-100 text-red-800 border-red-200',
    found: 'bg-green-100 text-green-800 border-green-200'
  };

  // Calculate time since posting (e.g., "2 days ago")
  const getTimeSince = (date) => {
    const now = new Date();
    const lastSeen = new Date(date);
    const diffTime = Math.abs(now - lastSeen);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="relative">
        {alert.image ? (
          <img 
            src={`http://localhost:5001/${alert.image}`} 
            alt={alert.petName} 
            className="w-full h-48 object-cover" 
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-200">
            <Camera className="text-gray-400 w-8 h-8" />
          </div>
        )}
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[alert.status.toLowerCase()]}`}>
          {alert.status}
        </span>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-xl font-semibold">{alert.petName}</h4>
            <p className="text-sm text-gray-500 capitalize">{alert.species}</p>
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm truncate">{alert.location}</span>
          </div>
          
          {alert.lastSeen && (
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">
                Last seen: {getTimeSince(alert.lastSeen)}
              </span>
            </div>
          )}
          
          <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96' : 'max-h-16'}`}>
            <p className="text-gray-700 text-sm">{alert.description}</p>
          </div>
          
          {alert.description.length > 100 && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-teal-600 text-sm font-medium hover:text-teal-700 focus:outline-none flex items-center"
            >
              {expanded ? 'Show less' : 'Read more'}
              <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {alert.contactInfo && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">{alert.contactInfo}</p>
            <button className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-full">
              <Phone className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Edit and Delete buttons */}
        {(activeRole !== "user" || user?.id === alert.user_id) && (
        <div className="mt-4 flex justify-end space-x-2">
          <button 
            onClick={() => onEdit(alert)}
            className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(alert.id)}
            className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
          >
            Delete
          </button>
        </div>
        )}
      </div>
    </div>
  );
};

// Enhanced search and filter controls with collapsible filter panel
const SearchFilters = ({ filters, onChange, resetFilters }) => {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by pet name, description..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button 
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-lg border flex items-center gap-2 ${showFilters ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-gray-200 text-gray-700'}`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {(filters.status || filters.species || filters.dateRange) && 
            <span className="bg-teal-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
              {(!!filters.status + !!filters.species + !!filters.dateRange)}
            </span>
          }
        </button>
        
        {(filters.status || filters.species || filters.dateRange) && (
          <button 
            onClick={resetFilters}
            className="px-4 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>
      
      {showFilters && (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => onChange({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={filters.species}
              onChange={(e) => onChange({ ...filters, species: e.target.value })}
            >
              <option value="">All Species</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={filters.dateRange}
              onChange={(e) => onChange({ ...filters, dateRange: e.target.value })}
            >
              <option value="">Any Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// MapView component using react-leaflet to display pet alerts on a map
const MapView = ({ petAlerts }) => {
  // Use a default position if no alerts have coordinates
  const defaultPosition = [51.505, -0.09];

  // Filter alerts that have valid coordinates
  const alertsWithCoordinates = petAlerts.filter(alert => alert.latitude && alert.longitude);
  const center = alertsWithCoordinates.length > 0
    ? [alertsWithCoordinates[0].latitude, alertsWithCoordinates[0].longitude]
    : defaultPosition;

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {alertsWithCoordinates.map(alert => (
        <Marker key={alert.id} position={[alert.latitude, alert.longitude]}>
          <Popup>
            <div>
              <h4 className="font-semibold">{alert.petName}</h4>
              <p className="text-sm">{alert.location}</p>
              <p className="text-xs text-gray-500">{alert.status}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

// Enhanced notification component
const Notification = ({ type, message, onClose }) => {
  const bgColors = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  
  return message ? (
    <div className={`p-4 rounded-lg border ${bgColors[type]} flex items-start justify-between mb-6`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X className="w-4 h-4" />
      </button>
    </div>
  ) : null;
};

// Main enhanced LostFound component
const LostFound = () => {
  // Note: Added latitude and longitude to the form state.
  const [petAlerts, setPetAlerts] = useState([]);
  const [formData, setFormData] = useState({
    petName: '',
    species: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    status: 'lost',
    contactInfo: '',
    lastSeen: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ 
    search: '', 
    status: '', 
    species: '',
    dateRange: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState('grid'); // 'grid' or 'map'
  const [editingAlert, setEditingAlert] = useState(null);

  // Fetch alerts dynamically from backend
  useEffect(() => {
    const fetchPetAlerts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/lost-found');
        const data = await response.json();
        setPetAlerts(data);
      } catch (err) {
        setError('Failed to load pet alerts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPetAlerts();
  }, []);

  // Reset all filters
  const resetFilters = () => {
    setFilters({ search: '', status: '', species: '', dateRange: '' });
  };

  // Filter alerts based on search and filter criteria with date range
  const filteredAlerts = petAlerts.filter(alert => {
    const matchesSearch = !filters.search || 
      alert.petName.toLowerCase().includes(filters.search.toLowerCase()) ||
      alert.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || alert.status.toLowerCase() === filters.status;
    const matchesSpecies = !filters.species || alert.species.toLowerCase() === filters.species;
    
    // Date range filtering
    let matchesDateRange = true;
    if (filters.dateRange) {
      const now = new Date();
      const lastSeen = new Date(alert.lastSeen);
      const diffTime = Math.abs(now - lastSeen);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (filters.dateRange === 'today' && diffDays > 0) {
        matchesDateRange = false;
      } else if (filters.dateRange === 'week' && diffDays > 7) {
        matchesDateRange = false;
      } else if (filters.dateRange === 'month' && diffDays > 30) {
        matchesDateRange = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesSpecies && matchesDateRange;
  });

  // Update form data
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // File change handler with preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear file selection
  const clearFileSelection = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  // Handle deletion of an alert
  const handleDeleteAlert = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/lost-found/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete alert');
      setPetAlerts(petAlerts.filter(alert => alert.id !== id));
      setSuccess('Pet alert deleted successfully!');
    } catch (err) {
      setError('Failed to delete alert. Please try again.');
    }
  };

  // Handle editing: pre-fill the form with alert data and show the form
  const handleEditAlert = (alert) => {
    setEditingAlert(alert);
    setFormData({
      petName: alert.petName,
      species: alert.species,
      description: alert.description,
      location: alert.location,
      latitude: alert.latitude || '',
      longitude: alert.longitude || '',
      status: alert.status,
      contactInfo: alert.contactInfo,
      lastSeen: alert.lastSeen,
    });
    setImagePreview(alert.image ? `http://localhost:5001/${alert.image}` : null);
    setShowForm(true);
  };

  // Submit form: create a new alert or update an existing one
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // In your handleSubmit function (for creating a new alert)
      const data = new FormData();
      data.append('petName', formData.petName);
      data.append('species', formData.species);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      data.append('status', formData.status);
      data.append('contactInfo', formData.contactInfo);
      data.append('lastSeen', formData.lastSeen);
      if (selectedFile) {
        data.append('image', selectedFile);
      }
      // Append user_id from local storage
      if (user?.id) {
        data.append('user_id', user.id);
      }


      if (editingAlert) {
        // Update existing alert
        const response = await fetch(`http://localhost:5001/api/lost-found/${editingAlert.id}`, {
          method: 'PUT',
          body: data
        });
        if (!response.ok) throw new Error('Failed to update alert');
        const updatedAlert = await response.json();
        setPetAlerts(petAlerts.map(alert => alert.id === updatedAlert.id ? updatedAlert : alert));
        setSuccess('Pet alert updated successfully!');
        setEditingAlert(null);
      } else {
        // Create new alert
        const response = await fetch('http://localhost:5001/api/lost-found', {
          method: 'POST',
          body: data
        });
        if (!response.ok) throw new Error('Failed to submit alert');
        const newAlert = await response.json();
        setPetAlerts([newAlert, ...petAlerts]);
        setSuccess('Pet alert posted successfully!');
      }
      // Reset form and file state
      setFormData({
        petName: '',
        species: '',
        description: '',
        location: '',
        latitude: '',
        longitude: '',
        status: 'lost',
        contactInfo: '',
        lastSeen: '',
      });
      setSelectedFile(null);
      setImagePreview(null);
      setShowForm(false);
    } catch (err) {
      setError('Failed to post alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 mt-[100px]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Lost & Found Pets</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help reunite lost pets with their families or report found animals in your area.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                if (editingAlert) {
                  setEditingAlert(null);
                  setFormData({
                    petName: '',
                    species: '',
                    description: '',
                    location: '',
                    latitude: '',
                    longitude: '',
                    status: 'lost',
                    contactInfo: '',
                    lastSeen: '',
                  });
                  setSelectedFile(null);
                  setImagePreview(null);
                }
                setShowForm(!showForm);
              }}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors shadow-sm"
            >
              {showForm ? 'Hide Form' : (editingAlert ? 'Edit Pet' : 'Report Lost/Found Pet')}
            </button>
          </div>
        </div>

        <Notification 
          type="error" 
          message={error} 
          onClose={() => setError('')} 
        />
        <Notification 
          type="success" 
          message={success} 
          onClose={() => setSuccess('')} 
        />

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-12 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6">
              {editingAlert ? 'Edit Pet' : 'Report a Pet'}
            </h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pet Name</label>
                  <input
                    type="text"
                    name="petName"
                    value={formData.petName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
                  <select
                    name="species"
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Select species</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="rabbit">Rabbit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-blue-500 outline-none"
                    rows="4"
                    placeholder="Color, distinguishing features, collar details, temperament, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {/* Use LocationAutocomplete instead of a plain input */}
                  <LocationAutocomplete
                    value={formData.location}
                    onChange={(newValue) => setFormData({ ...formData, location: newValue })}
                    onSelect={(suggestion) => {
                      setFormData({
                        ...formData,
                        location: suggestion.display_name,
                        latitude: suggestion.lat,
                        longitude: suggestion.lon
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer ${formData.status === 'lost' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                      <input
                        type="radio"
                        name="status"
                        value="lost"
                        checked={formData.status === 'lost'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="sr-only"
                      />
                      <span>Lost Pet</span>
                    </label>
                    <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer ${formData.status === 'found' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                      <input
                        type="radio"
                        name="status"
                        value="found"
                        checked={formData.status === 'found'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="sr-only"
                      />
                      <span>Found Pet</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                  <input
                    type="text"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-blue-500 outline-none"
                    placeholder="Phone number, email, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Seen Date</label>
                  <input
                    type="date"
                    name="lastSeen"
                    value={formData.lastSeen}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Pet Image</label>
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors">
                      <span className="text-gray-700">Choose file</span>
                      <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    {selectedFile && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{selectedFile.name}</span>
                        <button 
                          type="button"
                          onClick={clearFileSelection}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <div className="mt-4 relative w-40 h-40 border rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={clearFileSelection}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm text-gray-700 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAlert(null);
                    // Reset form fields on cancel
                    setFormData({
                      petName: '',
                      species: '',
                      description: '',
                      location: '',
                      latitude: '',
                      longitude: '',
                      status: 'lost',
                      contactInfo: '',
                      lastSeen: '',
                    });
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                  className="mr-4 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? (editingAlert ? 'Updating...' : 'Submitting...') : (editingAlert ? 'Update Report' : 'Submit Report')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
              Active Pet Alerts
              {filteredAlerts.length > 0 && (
                <span className="ml-2 text-lg text-gray-500">({filteredAlerts.length})</span>
              )}
            </h2>
            
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button 
                className={`px-4 py-2 rounded-md ${activeView === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                onClick={() => setActiveView('grid')}
              >
                Grid View
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${activeView === 'map' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                onClick={() => setActiveView('map')}
              >
                Map View
              </button>
            </div>
          </div>
          
          <SearchFilters 
            filters={filters} 
            onChange={setFilters} 
            resetFilters={resetFilters} 
          />

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading pet alerts...</p>
              </div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Alerts Found</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                No pet alerts match your current filters. Try adjusting your search criteria or clear filters.
              </p>
              {filters.search || filters.status || filters.species || filters.dateRange ? (
                <button 
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50"
                >
                  Clear All Filters
                </button>
              ) : null}
            </div>
          ) : activeView === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAlerts.map((alert) => (
                <PetCard 
                  key={alert.id} 
                  alert={alert} 
                  onEdit={handleEditAlert} 
                  onDelete={handleDeleteAlert} 
                />
              ))}
            </div>
          ) : (
            // Render the MapView component when "Map View" is active
            <MapView petAlerts={filteredAlerts} />
          )}
          
          {filteredAlerts.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">Showing {filteredAlerts.length} of {petAlerts.length} total alerts</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LostFound;
