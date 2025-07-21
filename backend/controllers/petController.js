// controllers/petController.js

const petModel = require('../models/petModel');

/**
 * Create a new pet profile for the authenticated user.
 */
exports.createPetProfile = async (req, res) => {
  const user_id = req.user.id;
  const { 
    name, 
    type, 
    breed, 
    age, 
    sex, 
    weight, 
    color, 
    health_status, 
    vaccinations, 
    allergies, 
    lost_status,
    microchipped 
  } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ error: 'Pet name and type are required' });
  }

  // Use file upload if available
  let photo = req.body.photo;
  if (req.file) {
    photo = req.file.path;
  }

 const vac = Array.isArray(vaccinations)
                ? JSON.stringify(vaccinations)
                : vaccinations;
  const all = Array.isArray(allergies)
                ? JSON.stringify(allergies)
                : allergies;

  try {
    const petId = await petModel.createPet({
      user_id,
      name,
      type,
      breed,
      age,
      sex,
      weight,
      color,
      health_status,
      vaccinations: vac,    // now a string
      allergies:    all,    // now a string
      lost_status,
      microchipped,
      photo
    });
    return res.status(201).json({ message: 'Pet profile created', petId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update a pet profile.
 */
exports.updatePetProfile = async (req, res) => {
  const petId = req.params.petId;
  const user_id = req.user.id;
  const { 
    name, 
    type, 
    breed, 
    age, 
    sex, 
    weight, 
    color, 
    health_status, 
    vaccinations, 
    allergies, 
    lost_status,
    microchipped 
  } = req.body;
  
  let photo = req.body.photo;
  if (req.file) {
    photo = req.file.path;
  }
  
  try {
    const pet = await petModel.getPetById(petId);
    if (!pet || pet.user_id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized to update this pet profile' });
    }
    
    await petModel.updatePet(petId, {
      name,
      type,
      breed,
      age,
      sex,
      weight,
      color,
      health_status,
      vaccinations,
      allergies,
      lost_status,
      microchipped,
      photo
    });
    
    return res.status(200).json({ message: 'Pet profile updated successfully' });
  } catch (error) {
    console.error('Update pet profile error:', error);
    return res.status(500).json({ error: 'Server error while updating pet profile' });
  }
};




/**
 * Get all pet profiles for the authenticated user.
 */
exports.getPetProfiles = async (req, res) => {
  const user_id = req.user.id;
  try {
    const pets = await petModel.getPetsByUser(user_id);
    return res.status(200).json({ pets });
  } catch (error) {
    console.error('Get pet profiles error:', error);
    return res.status(500).json({ error: 'Server error while fetching pet profiles' });
  }
};

/**
 * Delete a pet profile.
 */
exports.deletePetProfile = async (req, res) => {
  const petId = req.params.petId;
  const user_id = req.user.id;
  try {
    const pet = await petModel.getPetById(petId);
    if (!pet || pet.user_id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized to delete this pet profile' });
    }
    await petModel.deletePet(petId);
    return res.status(200).json({ message: 'Pet profile deleted successfully' });
  } catch (error) {
    console.error('Delete pet profile error:', error);
    return res.status(500).json({ error: 'Server error while deleting pet profile' });
  }
};
