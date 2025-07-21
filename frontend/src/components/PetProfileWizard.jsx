


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, PawPrint, Heart, Upload, X, AlertTriangle, Check } from 'lucide-react';

const PetProfileWizard = ({ onComplete, onSkip, onClose, initialData }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  
  // Initialize petData with initialData (if editing) or default values (if adding new)
  const [petData, setPetData] = useState(
    initialData || {
      name: '',
      type: 'Dog',
      breed: '',
      age: '',
      sex: '',
      weight: '',
      color: '',
      health_status: '',
      vaccinations: [],
      allergies: '',
      lost_status: false,
      microchipped: false,
      photo: null
    }
  );

  // More comprehensive pet types
  const petTypes = [
    'Dog', 
    'Cat', 
    'Bird', 
    'Fish', 
    'Reptile', 
    'Small Mammal', 
    'Horse', 
    'Other'
  ];

  // Breed options for different pet types
  const breeds = {
    Dog: ['Labrador', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Poodle', 'Beagle', 'Chihuahua', 'Boxer', 'Other'],
    Cat: ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Bengal', 'Ragdoll', 'Sphynx', 'Abyssinian', 'Other'],
    Bird: ['Canary', 'Parakeet', 'Cockatiel', 'Lovebird', 'Parrot', 'Finch', 'Macaw', 'Conure', 'Other'],
    Fish: ['Goldfish', 'Betta', 'Guppy', 'Tetra', 'Angelfish', 'Discus', 'Molly', 'Koi', 'Other'],
    Reptile: ['Turtle', 'Snake', 'Lizard', 'Gecko', 'Bearded Dragon', 'Chameleon', 'Iguana', 'Tortoise', 'Other'],
    'Small Mammal': ['Hamster', 'Guinea Pig', 'Rabbit', 'Ferret', 'Rat', 'Mouse', 'Chinchilla', 'Hedgehog', 'Other'],
    Horse: ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Appaloosa', 'Morgan', 'Tennessee Walker', 'Paint', 'Friesian', 'Other'],
    Other: ['Please specify in health notes']
  };

  // Common vaccinations by pet type
  const commonVaccinations = {
    Dog: ['Rabies', 'Distemper', 'Parvovirus', 'Hepatitis', 'Bordetella', 'Leptospirosis', 'Lyme Disease'],
    Cat: ['Rabies', 'Feline Distemper (Panleukopenia)', 'Feline Herpesvirus', 'Calicivirus', 'Feline Leukemia', 'Bordetella'],
    Bird: ['Polyomavirus', "Pacheco's Disease", 'Newcastle Disease', 'Avian Pox'],
    Horse: ['Rabies', 'Tetanus', 'Eastern/Western Equine Encephalomyelitis', 'West Nile Virus', 'Influenza'],
    'Small Mammal': ['Rabies', 'Distemper'],
    Other: []
  };
  

  // Update vaccinations list when pet type changes
  useEffect(() => {
    // Reset vaccinations when pet type changes
    setPetData(prev => ({
      ...prev,
      vaccinations: [],
      breed: ''  // Also reset breed
    }));
  }, [petData.type]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      setPetData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleVaccinationToggle = (vaccination) => {
    setPetData(prev => {
      const vaccinations = [...prev.vaccinations];
      const index = vaccinations.indexOf(vaccination);
      
      if (index === -1) {
        vaccinations.push(vaccination);
      } else {
        vaccinations.splice(index, 1);
      }
      
      return { ...prev, vaccinations };
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFeedback({
          show: true,
          type: 'error',
          message: 'Photo too large. Maximum size is 5MB.'
        });
        
        // Clear after 3 seconds
        setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 3000);
        return;
      }
      
      setPetData(prev => ({ ...prev, photo: file }));
      setFeedback({
        show: true,
        type: 'success',
        message: 'Photo uploaded successfully!'
      });
      
      // Clear after 3 seconds
      setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 3000);
    }
  };

  // Helper to convert a file to a base64 string
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    let payload = { ...petData };

    // If a new photo was uploaded (a File instance), convert it to base64
    if (petData.photo && petData.photo instanceof File) {
      try {
        payload.photo = await convertFileToBase64(petData.photo);
      } catch (error) {
        console.error('Error converting photo:', error);
        setFeedback({
          show: true,
          type: 'error',
          message: 'Error processing photo. Please try again.'
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      let response;
      
      if (initialData && initialData.id) {
        // Update existing pet profile
        response = await fetch(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/pets/${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new pet profile
        response = await fetch('https://pawprox-6dd216fb1ef5.herokuapp.com/api/pets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      
      if (response.ok) {
        // Optionally, update local storage flag if needed
        localStorage.setItem('petModalSubmitted', 'true');
        
        // Get the response data
        const responseData = await response.json();
        
        // onComplete callback returns the updated (or new) pet data
        onComplete(responseData);
        
        // Show success feedback
        setFeedback({
          show: true,
          type: 'success',
          message: initialData ? 'Pet profile updated!' : 'Pet profile created!'
        });
        
        // Close modal after short delay
        setTimeout(() => onClose(), 1500);
      } else {
        // Handle error response
        const errorData = await response.json();
        setFeedback({
          show: true,
          type: 'error',
          message: errorData.message || 'Error saving pet profile'
        });
      }
    } catch (error) {
      console.error('Error saving pet profile:', error);
      setFeedback({
        show: true,
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate current step before proceeding
  const validateStep = () => {
    if (step === 1) {
      if (!petData.name.trim()) {
        setFeedback({
          show: true,
          type: 'error',
          message: "Please enter your pet's name"
        });
        return false;
      }
    }
    return true;
  };

  // Handle next step action
  const handleNextStep = () => {
    if (validateStep()) {
      if (step < 3) {
        setStep(step + 1);
        setFeedback({ show: false, type: '', message: '' });
      } else {
        handleSubmit();
      }
    }
    
    // Clear feedback after 3 seconds
    setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 3000);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto"
      >
        {/* Header with close button */}
        <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">
            {initialData ? 'Edit Pet Profile' : 'Add New Pet'}
          </h2>
          <button 
            onClick={() => { console.log('Close button clicked'); onClose(); }}
            className="rounded-full p-1 hover:bg-emerald-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-emerald-50 p-4">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-2 bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Basic Info</span>
            <span>Health Details</span>
            <span>Photo</span>
          </div>
        </div>

        {/* Feedback message */}
        <AnimatePresence>
          {feedback.show && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`px-4 py-2 flex items-center ${
                feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}
            >
              {feedback.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              ) : (
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-3">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <PawPrint className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Let's Meet Your Pet</h2>
                  <p className="text-gray-600">Tell us about your furry (or scaly) friend</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pet's Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={petData.name}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500"
                      placeholder="What's your pet's name?"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pet Type</label>
                      <select
                        name="type"
                        value={petData.type}
                        onChange={handleChange}
                        className="mt-1 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500"
                      >
                        {petTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Age</label>
                      <div className="flex">
                        <input
                          type="number"
                          name="age"
                          value={petData.age}
                          onChange={handleChange}
                          className="mt-1 w-full px-4 py-3 rounded-l-lg border focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                          min="0"
                        />
                        <span className="mt-1 px-4 py-3 bg-gray-50 border border-l-0 rounded-r-lg text-gray-500">
                          Years
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sex</label>
                      <select
                        name="sex"
                        value={petData.sex}
                        onChange={handleChange}
                        className="mt-1 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Color</label>
                      <input
                        type="text"
                        name="color"
                        value={petData.color}
                        onChange={handleChange}
                        className="mt-1 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500"
                        placeholder="Main color(s)"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="lost_status"
                      name="lost_status"
                      checked={petData.lost_status}
                      onChange={handleChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lost_status" className="ml-2 block text-sm text-gray-700">
                      This pet is currently lost/missing
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Heart className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Health Information</h2>
                  <p className="text-gray-600">Help us understand your pet's needs</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Breed</label>
                    <select
                      name="breed"
                      value={petData.breed}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select breed</option>
                      {breeds[petData.type]?.map((breed) => (
                        <option key={breed} value={breed}>
                          {breed}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight</label>
                      <div className="flex">
                        <input
                          type="number"
                          name="weight"
                          value={petData.weight}
                          onChange={handleChange}
                          className="mt-1 w-full px-4 py-3 rounded-l-lg border focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                          min="0"
                          step="0.1"
                        />
                        <span className="mt-1 px-4 py-3 bg-gray-50 border border-l-0 rounded-r-lg text-gray-500">
                          kg
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="microchipped"
                        name="microchipped"
                        checked={petData.microchipped}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <label htmlFor="microchipped" className="ml-2 block text-sm text-gray-700">
                        Pet is microchipped
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vaccinations</label>
                    <div className="bg-gray-50 p-3 rounded-lg border grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                      {(commonVaccinations[petData.type] || []).length > 0 ? (
                        commonVaccinations[petData.type].map(vaccine => (
                          <div key={vaccine} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`vaccine-${vaccine}`}
                              checked={petData.vaccinations.includes(vaccine)}
                              onChange={() => handleVaccinationToggle(vaccine)}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`vaccine-${vaccine}`} className="ml-2 block text-sm text-gray-700">
                              {vaccine}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm col-span-2">No common vaccinations listed for this pet type</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                    <input
                      type="text"
                      name="allergies"
                      value={petData.allergies}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500"
                      placeholder="Any known allergies? (Optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Health Notes</label>
                    <textarea
                      name="health_status"
                      value={petData.health_status}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500"
                      placeholder="Any health conditions, medications, or special needs?"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Add a Photo</h2>
                  <p className="text-gray-600">Let's see that cute face!</p>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <div 
                    className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-emerald-100 shadow-lg"
                  >
                    {petData.photo ? (
                      <img 
                        src={petData.photo instanceof File ? URL.createObjectURL(petData.photo) : petData.photo} 
                        alt="Pet preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Upload className="w-12 h-12 mb-2" />
                        <span className="text-sm">No photo yet</span>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo"
                    className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer hover:bg-emerald-200 transition-colors font-medium flex items-center"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    {petData.photo ? 'Change Photo' : 'Choose Photo'}
                  </label>
                  
                  <p className="text-sm text-gray-500">
                    Max file size: 5MB. Best format: JPEG or PNG.
                  </p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-medium text-emerald-800 mb-2">Review Pet Details</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {petData.name}</div>
                    <div><span className="font-medium">Type:</span> {petData.type}</div>
                    {petData.breed && <div><span className="font-medium">Breed:</span> {petData.breed}</div>}
                    {petData.age && <div><span className="font-medium">Age:</span> {petData.age} years</div>}
                    {petData.sex && <div><span className="font-medium">Sex:</span> {petData.sex}</div>}
                    {petData.weight && <div><span className="font-medium">Weight:</span> {petData.weight} kg</div>}
                    {petData.lost_status && <div className="col-span-2 text-red-600">This pet is marked as lost/missing</div>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onSkip()}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {step === 1 ? 'Skip' : 'Back'}
            </button>
            
            <button
              onClick={handleNextStep}
              disabled={isSubmitting}
              className={`px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                step === 3 ? 'Complete' : 'Next'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PetProfileWizard;