const express = require('express');
const PetRecommendationService = require('./services/petRecommendationService');
const router = express.Router();

router.get('/pets', async (req, res) => {
  try {
    const pets = await PetRecommendationService.getAllPets();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// Add other routes as needed
module.exports = router;