import React, { useState, useEffect } from 'react';
import { Send, Phone, Mail, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram, Upload, CheckCircle, XCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// fix default marker icon paths (optional but recommended)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    subject: '',
    message: '',
    file: null
  });

  const officePosition = [24.814598610454212, 67.07980603961614]; 

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState('');

  const departments = [
    'Customer Support',
    'Sales & Marketing',
    'Technical Support',
    'Business Development',
    'Human Resources'
  ];

  const socialLinks = [
    { icon: Facebook, url: 'https://facebook.com', color: 'bg-blue-600' },
    { icon: Twitter, url: 'https://twitter.com', color: 'bg-sky-500' },
    { icon: Linkedin, url: 'https://linkedin.com', color: 'bg-blue-700' },
    { icon: Instagram, url: 'https://instagram.com', color: 'bg-pink-600' }
  ];

  // Real-time validation
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address' : '';
      case 'department':
        return !value ? 'Please select a department' : '';
      case 'subject':
        return value.length < 3 ? 'Subject must be at least 3 characters' : '';
      case 'message':
        return value.length < 10 ? 'Message must be at least 10 characters' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, file: 'File size must be less than 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, file }));
      setFileName(file.name);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // 1) Validate all fields (except file)
  const newErrors = {};
  Object.keys(formData).forEach(key => {
    if (key !== 'file') {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    }
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // 2) Build FormData payload
  const payload = new FormData();
  payload.append("name",       formData.name);
  payload.append("email",      formData.email);
  payload.append("department", formData.department);
  payload.append("subject",    formData.subject);
  payload.append("message",    formData.message);
  if (formData.file) {
    payload.append("file", formData.file);
  }

  // 3) Submit
  setIsSubmitting(true);
  setErrors({});  // clear any form‑level error

  try {
    await axios.post(
      "https://pawprox-6dd216fb1ef5.herokuapp.com/api/contact",
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    // 4) On success
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      department: "",
      subject: "",
      message: "",
      file: null
    });
    setFileName("");
  } catch (err) {
    console.error("Contact submit failed:", err);
    setErrors({ form: "Failed to send your message. Please try again later." });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div>
    <Header/>
    
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 mt-[100px]">
      

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-blue-600 mt-1" />
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Phone</p>
                  <p className="text-gray-600">+92 3408355962</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="w-6 h-6 text-blue-600 mt-1" />
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">pawprox2025@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-600">DHA Phase 7<br/> Karachi, Pakistan</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="w-6 h-6 text-blue-600 mt-1" />
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Business Hours</p>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Integration */}
          <div className="bg-white rounded-xl shadow-lg p-3 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Location</h2>
            <MapContainer
              center={officePosition}
              zoom={15}
              scrollWheelZoom={false}
              className="w-full h-64 rounded-lg overflow-hidden"
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={officePosition}>
                <Popup>
                  Our Office<br />123 Business Street, DHA Phase 7.
                </Popup>
              </Marker>
            </MapContainer>
          </div>

        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Send us a Message</h2>
            
            {submitted ? (
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold text-green-800">Thank you for your message!</h3>
                    <p className="text-green-700 mt-1">We'll be in touch with you shortly.</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border ${errors.department ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2`}
                  >
                    <option value="">Select a department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-lg border ${errors.subject ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2`}
                  />
                  {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`mt-1 block w-full rounded-lg border ${errors.message ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2`}
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Attachment (Optional)</label>
                  <div className="mt-1 flex items-center">
                    <label className="w-full flex justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <span>Drop a file or click to upload</span>
                        </div>
                        <p className="text-xs text-gray-500">Up to 5MB</p>
                        {fileName && <p className="text-sm text-blue-600">{fileName}</p>}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt"
                      />
                    </label>
                  </div>
                  {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Send Message
                      <Send className="ml-2 w-5 h-5" />
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>

    <Footer/>

    </div>
  );
};

export default Contact;