const axios = require('axios');

const FLASK_API_URL = 'http://localhost:5000'; // Change if your Flask app is hosted elsewhere

class PetRecommendationService {
  static async getAllPets() {
    try {
      const response = await axios.get(`${FLASK_API_URL}/all_pets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pets:', error);
      throw error;
    }
  }

  static async searchPets(query) {
    try {
      const response = await axios.get(`${FLASK_API_URL}/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching pets:', error);
      throw error;
    }
  }

  static async getRecommendations(petId) {
    try {
      const response = await axios.get(`${FLASK_API_URL}/recommend?pet_id=${petId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  static async refreshPets() {
    try {
      const response = await axios.get(`${FLASK_API_URL}/refresh`);
      return response.data;
    } catch (error) {
      console.error('Error refreshing pets:', error);
      throw error;
    }
  }
}

module.exports = PetRecommendationService;