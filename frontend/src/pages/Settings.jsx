import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import PetProfileWizard from '../components/PetProfileWizard';

const Settings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user'));
  
  // States for user and pet data
  const [user, setUser] = useState(storedUser);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  

  // For editing user profile
  const [editingProfile, setEditingProfile] = useState(false);
  // start with whatever we already have for the user (including phone)
  const [editedUser, setEditedUser] = useState(storedUser || {});
  
  // Active mode: 'user' or 'vendor'
  const [activeRole, setActiveRole] = useState(localStorage.getItem('activeRole') || 'user');
  
  // Active tab: profile, security, or preferences
  const [activeTab, setActiveTab] = useState('profile');
  
  // States for vendor application modal
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    business_name: '',
    services: '',
    phone: '',
    business_address: '',
    years_experience: ''
  });
  
  // States for confirming account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  // States for Security (password update)
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // States for Preferences (example: email notifications)
  const [preferences, setPreferences] = useState(
    user.preferences ? JSON.parse(user.preferences) : { emailNotifications: false }
  );
  
  // Fetch user profile and pet data
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => { 
      try {
        // Fetch user profile
        const userRes = await fetch('https://pawprox-6dd216fb1ef5.herokuapp.com/api/users/profile', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userRes.ok) {
          if (userRes.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch user profile');
        }
        
        const { user: freshUser, vendor } = await userRes.json();
        const normalizedUser = {
          ...freshUser,
          vendor,          // null if they’re not a vendor, or the row if they are
        };
        setUser(normalizedUser);
        setEditedUser(normalizedUser);
        if (normalizedUser.preferences) {
          setPreferences(JSON.parse(normalizedUser.preferences));
        } 
              
        // Fetch pet profiles
        const petRes = await fetch('https://pawprox-6dd216fb1ef5.herokuapp.com/api/pets', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!petRes.ok) {
          throw new Error('Failed to fetch pet profiles');
        }
        
        const petData = await petRes.json();
        setPets(petData.pets);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, navigate]);
  
const handleRoleSwitch = (newRole) => {
  // If trying to switch to vendor mode, check if they can
  if (newRole === 'vendor') {
    // Case 1: User has no vendor record - show the form
    if (!user.vendor) {
      handleShowVendorModal();
      return;
    }
    
    // Case 2: User has vendor record but it's still pending - prevent switch
    if (user.vendor && user.vendor.approval_status === 'pending') {
      toast.error('Your vendor application is still pending approval. You cannot switch to vendor mode yet.');
      return;
    }
    
    // Case 3: User has approved vendor record - allow switch
    if (user.vendor && user.vendor.approval_status === 'approved') {
      setActiveRole(newRole);
      localStorage.setItem('activeRole', newRole);
      toast.success(`Switched to ${newRole} mode`);
      return;
    }
    
    // Case 4: Any other status (rejected, etc.) - show form to reapply
    if (user.vendor && user.vendor.approval_status !== 'approved') {
      toast.error('Your previous vendor application was not approved. Please submit a new application.');
      handleShowVendorModal();
      return;
    }
  }
  
  // For switching to user mode, always allow
  setActiveRole(newRole);
  localStorage.setItem('activeRole', newRole);
  toast.success(`Switched to ${newRole} mode`);
};

// Update the vendor form submission to handle the approval status properly
const handleVendorSubmit = async (e) => {
  e.preventDefault();
  try { 
    const response = await fetch('https://pawprox-6dd216fb1ef5.herokuapp.com/api/vendor/become', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(vendorForm)
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit vendor application');
    }
    
    const vendorData = await response.json();
    
    // Update user with new vendor data
    const updatedUser = { 
      ...user, 
      vendor: {
        ...vendorData,
        approval_status: 'pending' // Ensure status is pending
      }
    };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Close modal and reset form
    setShowVendorModal(false);
    setVendorForm({
      business_name: '',
      services: '',
      phone: '',
      business_address: '',
      years_experience: ''
    });
    
    // Stay in user mode since application is pending
    setActiveRole('user');
    localStorage.setItem('activeRole', 'user');
    
    toast.success("Your vendor application has been submitted and is pending review. You'll be able to switch to vendor mode once approved.");
    
  } catch (err) {
    console.error(err);
    toast.error("Failed to submit vendor application. Please try again later.");
  }
};
  
  // Handlers for vendor modal
  const handleShowVendorModal = () => {
    setShowVendorModal(true);
  };
  
  const handleVendorFormChange = (e) => {
    const { name, value } = e.target;
    setVendorForm(prev => ({ ...prev, [name]: value }));
  };
  

  
  // Profile update handlers
  const handleUserChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };
  
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setEditedUser({ ...editedUser, profilePic: file });
    }
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', editedUser.name);
      formData.append('email', editedUser.email);
      formData.append('phone', editedUser.phone);
      if (editedUser.profilePic instanceof File) {
        formData.append('profilePic', editedUser.profilePic);
      } 
      const res = await fetch('https://pawprox-6dd216fb1ef5.herokuapp.com/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        toast.success("Profile updated successfully!");
        setEditingProfile(false);
        const updatedUser = await res.json();
        setUser(updatedUser.user);
        localStorage.setItem('user', JSON.stringify(updatedUser.user));
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("An error occurred while updating your profile.");
    }
  }; 
  
  // Delete account
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('https://pawprox-6dd216fb1ef5.herokuapp.com/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });
      if (res.ok) {
        if (res.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('activeRole');
          localStorage.removeItem('isVendor');
          toast.success("Your account has been deleted.");
          navigate('/login');
        }        
        toast.success("Your account has been deleted.");
        navigate('/login');
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to delete account. Please check your password.");
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("An error occurred while trying to delete your account.");
    }
  };
  
  // Security (Password) form handlers
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    } 
    try {
      const res = await fetch('https://pawprox-6dd216fb1ef5.herokuapp.com/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update password");
      }
      toast.success("Password updated successfully!");
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update password");
    }
  };
  
  // Preferences form handlers
  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [prefStatus, setPrefStatus] = useState('');
  
  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
 
    try {
      const res = await fetch('https://pawprox-6dd216fb1ef5.herokuapp.com/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferences })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update preferences');
      }

      // Pull the canonical prefs back from the server
      const { preferences: savedPrefs } = await res.json();

      // 1) Update React state
      setPreferences(savedPrefs);

      // 2) Merge into your user object & persist
      const updatedUser = {
        ...user,
        preferences: JSON.stringify(savedPrefs),
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // 3) Show inline status message
      setPrefStatus('Preferences saved successfully!');

      // 4) Optionally clear the message after 3s
      setTimeout(() => setPrefStatus(''), 3000);

      // 5) Also fire your toast if you like
      toast.success('Preferences updated successfully!');

    } catch (err) {
      console.error('Preferences update error:', err);
      toast.error(err.message || 'Failed to update preferences');
    }
  };
 

  const [showPetWizard, setShowPetWizard] = useState(false);
  const [petToEdit, setPetToEdit] = useState(null);
  
  const handleDeletePet = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet profile?')) return;
    try {
      const res = await fetch(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPets(pets.filter(pet => pet.id !== petId));
        toast.success("Pet profile deleted successfully.");
      } else {
        toast.error("Failed to delete pet profile.");
      }
    } catch (error) {
      console.error('Error deleting pet profile:', error);
      toast.error("An error occurred while deleting the pet profile.");
    }
  };

  // Open pet wizard in edit mode (with current pet data)
  const handleEditPet = (pet) => {
    setPetToEdit(pet);
    setShowPetWizard(true);
  };

  // Callback when wizard completes updating a pet
  const handlePetWizardComplete = (updatedPet) => {
    // Update the pet list with the updated pet data
    setPets(pets.map(p => (p.id === updatedPet.id ? updatedPet : p)));
    setShowPetWizard(false);
    setPetToEdit(null);
  };
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-gray-700">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen mt-[110px]">
        <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
          {/* Main Settings Container */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <h1 className="text-3xl font-bold">Account Settings</h1>
              <p className="opacity-80">Manage your profile, pets, vendor settings, security, and preferences</p>
            </div>
            
            {/* Tabs for navigation */}
            <div className="flex border-b overflow-x-auto">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Profile
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`px-6 py-3 font-medium ${activeTab === 'security' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Security
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`px-6 py-3 font-medium ${activeTab === 'preferences' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Preferences
              </button>
            </div>
            
            {/* Conditional Tab Content */}
            {activeTab === 'profile' && (
              <div className="p-6"> 
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left column - User Profile */}
                  <div className="md:w-1/3">
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden mb-4 mx-auto border-4 border-white shadow-lg">
                        {user.profilePic ? (
                          <img
                            src={`https://pawprox-6dd216fb1ef5.herokuapp.com/${user.profilePic}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-3xl text-white">
                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                      <p className="text-gray-600 mb-2">{user.email}</p>
                      <p className="text-gray-600 mb-4">{user.phone || '— no phone on file —'}</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Member since{" "}
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>

                      
                      {!editingProfile ? (
                        <button
                          onClick={() => setEditingProfile(true)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingProfile(false)}
                          className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                        >
                          Cancel Editing
                        </button>
                      )}
                      
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full mt-4 px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                  
                  {/* Right column - Edit Form */}
                  <div className="md:w-2/3">
                    {editingProfile ? (
                      <div className="bg-white p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
                        <form onSubmit={handleProfileUpdate}>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={editedUser.name || ''}
                              onChange={handleUserChange}
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={editedUser.email || ''}
                              onChange={handleUserChange}
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          {/* ← New Phone Field */}
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={editedUser.phone || ''}
                              onChange={handleUserChange}
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="+1 (555) 123‑4567"
                              required
                            />
                          </div>
                          <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                              Profile Picture
                            </label>
                            <div className="flex items-center">
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleProfilePicChange}
                                className="hidden" 
                                id="profile-pic-input" 
                              />
                              <label 
                                htmlFor="profile-pic-input"
                                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition"
                              >
                                Choose File
                              </label>
                              <span className="ml-3 text-sm text-gray-600">
                                {editedUser.profilePic instanceof File ? editedUser.profilePic.name : 'No file chosen'}
                              </span>
                            </div>
                            <div className="mt-4">
                              {editedUser.profilePic instanceof File ? (
                                <img
                                  src={URL.createObjectURL(editedUser.profilePic)}
                                  alt="Profile Preview"
                                  className="w-24 h-24 object-cover rounded-full"
                                />
                              ) : ( 
                                editedUser.profilePic && (
                                  <img
                                    src={`https://pawprox-6dd216fb1ef5.herokuapp.com/${editedUser.profilePic}`}
                                    alt="Profile"
                                    className="w-24 h-24 object-cover rounded-full"
                                  />
                                )
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button 
                              type="submit" 
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition"
                            >
                              Save Changes
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
  <div className="bg-white p-6 rounded-lg">
    <h3 className="text-xl font-semibold mb-4">Account Access Mode</h3>
    <div className="bg-gray-50 p-6 rounded-lg mb-6">
      <h4 className="font-medium text-gray-700 mb-2">Current Mode</h4>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${activeRole === 'user' ? 'bg-green-500' : 'bg-purple-500'} mr-2`}></div>
        <p className="font-semibold">
          {activeRole === 'user' ? 'User Account' : 'Vendor Account'}
        </p>
      </div>
      
      {/* Show different UI based on vendor status */}
      {!user.vendor ? (
        // No vendor record - show apply button
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            You're currently in user mode. Apply to become a vendor to offer services.
          </p>
          <button
            onClick={handleShowVendorModal}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition"
          >
            Apply to Become Vendor
          </button>
        </div>
      ) : user.vendor.approval_status === 'pending' ? (
        // Pending application - show status
        <div className="mt-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium mb-1">
                  Vendor Application Pending
                </p>
                <p className="text-sm text-yellow-700">
                  Your vendor application is being reviewed by our team. You'll be able to switch to vendor mode once approved.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              disabled
              className="bg-gray-300 text-gray-500 font-medium py-2 px-6 rounded-md cursor-not-allowed"
            >
              Vendor Mode (Pending Approval)
            </button>
          </div>
        </div>
      ) : user.vendor.approval_status === 'approved' ? (
        // Approved vendor - show mode switcher
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            Switch between user and vendor mode to access different features.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleRoleSwitch('user')}
              className={`flex-1 py-2 px-4 rounded-md transition ${
                activeRole === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              User Mode
            </button>
            <button
              onClick={() => handleRoleSwitch('vendor')}
              className={`flex-1 py-2 px-4 rounded-md transition ${
                activeRole === 'vendor'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Vendor Mode
            </button>
          </div>
        </div>
      ) : user.vendor.approval_status === 'rejected' ? (
        // Rejected application - show reapply option
        <div className="mt-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium mb-1">
                  Vendor Application Rejected
                </p>
                <p className="text-sm text-red-700">
                  Your previous vendor application was not approved. You can submit a new application.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleShowVendorModal}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition"
          >
            Submit New Application
          </button>
        </div>
      ) : null}
    </div>
  </div>

                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Update Password</h3>
                <form onSubmit={handlePasswordUpdate}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Current Password
                    </label>
                    <input 
                      type="password" 
                      name="currentPassword" 
                      value={securityData.currentPassword} 
                      onChange={handleSecurityChange} 
                      className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      New Password
                    </label>
                    <input 
                      type="password" 
                      name="newPassword" 
                      value={securityData.newPassword} 
                      onChange={handleSecurityChange} 
                      className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Confirm New Password
                    </label>
                    <input 
                      type="password" 
                      name="confirmPassword" 
                      value={securityData.confirmPassword} 
                      onChange={handleSecurityChange} 
                      className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}
            
            {activeTab === 'preferences' && (
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Update Preferences</h3>
                <form onSubmit={handlePreferencesUpdate}>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        name="emailNotifications" 
                        checked={preferences.emailNotifications} 
                        onChange={handlePreferencesChange} 
                        className="mr-2" 
                      />
                      <span className="text-gray-700">Email Notifications</span>
                    </label>
                  </div>
                  {/* Add additional preference fields as needed */}
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition"
                  >
                    Update Preferences
                  </button>

                  {prefStatus && (
                    <p className="mt-3 text-green-600">
                      {prefStatus}
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
          
          {/* Pet Profiles Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">My Pets</h2>
                  <p className="opacity-80">Manage your pet profiles</p>
                </div>
                {/* For new pet creation you can still link to a separate add page */}
                <button 
                onClick={() => {
                  setShowPetWizard(true);
                  setPetToEdit(null); // ensure we're adding a new pet, not editing
                }}
                className="bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-md font-medium transition shadow-sm"
              >
                Add New Pet
              </button>

              </div>
            </div>

            <div className="p-6">
              {pets && pets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
                    >
                      {pet.photo && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={ 
                              pet.photo.startsWith("data:")
                                ? pet.photo
                                : `https://pawprox-6dd216fb1ef5.herokuapp.com/${pet.photo}`
                            }
                            alt={`${pet.name}'s photo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {pet.name || "N/A"}
                          </h3>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            {pet.type || "N/A"}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p>
                            <span className="font-medium">Breed:</span>{" "}
                            {pet.breed || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Age:</span>{" "}
                            {pet.age || "N/A"} {pet.age ? "years" : ""}
                          </p>
                          <p>
                            <span className="font-medium">Sex:</span>{" "}
                            {pet.sex || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Weight:</span>{" "}
                            {(pet.weight !== undefined && pet.weight !== null)
                              ? pet.weight
                              : "N/A"}{" "}
                            {pet.weight || pet.weight === 0 ? "kg" : ""}
                          </p>
                          <p>
                            <span className="font-medium">Color:</span>{" "}
                            {pet.color || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Microchipped:</span>{" "}
                            {pet.microchipped ? "Yes" : "No"}
                          </p>
                          <p>
                            <span className="font-medium">Lost/Missing:</span>{" "}
                            {pet.lost_status ? "Yes" : "No"}
                          </p>
                          <p>
                            <span className="font-medium">Vaccinations:</span>{" "}
                            {Array.isArray(pet.vaccinations)
                              ? pet.vaccinations.join(", ")
                              : pet.vaccinations || "None"}
                          </p>

                          <p>
                            <span className="font-medium">Allergies:</span>{" "}
                            {pet.allergies || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Health:</span>{" "}
                            {pet.health_status || "N/A"}
                          </p>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleEditPet(pet)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this pet profile?"
                                )
                              ) {
                                handleDeletePet(pet.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pets</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new pet profile.</p>
                  <div className="mt-6">
                    <button
                        onClick={() => {
                          setShowPetWizard(true);
                          setPetToEdit(null); // ensure we're adding a new pet, not editing
                        }}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Pet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPetWizard && (
        <PetProfileWizard 
          onComplete={handlePetWizardComplete}
          onSkip={() => {
            setShowPetWizard(false);
            setPetToEdit(null);
          }}
          onClose={() => {
            setShowPetWizard(false);
            setPetToEdit(null);
          }}
          initialData={petToEdit} // when null, wizard works in add mode
        />
      )}

      
      {/* Vendor Application Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                  <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Vendor Application
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Complete the form below to apply as a service vendor. Our team will review your application.
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleVendorSubmit} className="mt-5 sm:mt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      id="business_name"
                      value={vendorForm.business_name}
                      onChange={handleVendorFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Business Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={vendorForm.phone}
                      onChange={handleVendorFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="services" className="block text-sm font-medium text-gray-700">
                      Services Offered
                    </label>
                    <input
                      type="text"
                      name="services"
                      id="services"
                      value={vendorForm.services}
                      onChange={handleVendorFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="business_address" className="block text-sm font-medium text-gray-700">
                      Business Address
                    </label>
                    <input
                      type="text"
                      name="business_address"
                      id="business_address"
                      value={vendorForm.business_address}
                      onChange={handleVendorFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="years_experience"
                      id="years_experience"
                      value={vendorForm.years_experience}
                      onChange={handleVendorFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowVendorModal(false)}
                    className="mr-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="bg-white rounded-lg shadow-lg z-10 p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Account Deletion</h3>
            <p className="mb-4 text-gray-700">
              Please enter your password to confirm deletion of your account. This action cannot be undone.
            </p>
            <input 
              type="password" 
              value={deletePassword} 
              onChange={(e) => setDeletePassword(e.target.value)} 
              className="w-full border border-gray-300 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-red-500" 
              placeholder="Password"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default Settings;
