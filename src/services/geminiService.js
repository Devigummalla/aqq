import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAZEV_Ub2ahYp3_1TMQUxBDPVnbFcM1yqM";

// Initialize the Gemini API
let genAI;
try {
  genAI = new GoogleGenerativeAI(API_KEY);
  console.log("Gemini API initialized successfully");
} catch (error) {
  console.error("Error initializing Gemini API:", error);
}

// Check if the Gemini API is initialized correctly
export const checkGeminiAPIStatus = () => {
  try {
    return genAI !== null;
  } catch (error) {
    console.error("Error checking Gemini API status:", error);
    return false;
  }
};

// Generate personalized health recommendations based on user data and AQI information
export const generateHealthRecommendations = async (userData, aqiData) => {
  if (!genAI) {
    throw new Error("Gemini API not initialized properly.");
  }

  try {
    // Extract relevant user data
    const { name, age, ...symptoms } = userData;
    
    // Create a list of active symptoms
    const activeSymptoms = Object.entries(symptoms)
      .filter(([key, value]) => value === true && 
        ['cough', 'mucus', 'shortnessOfBreath', 'chestPain', 'wheezing', 
         'soreThroat', 'runnyNose', 'fever', 'fatigue'].includes(key))
      .map(([key]) => {
        // Convert camelCase to readable format
        return key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
      });
    
    // Add any other symptoms if provided
    if (userData.other) {
      activeSymptoms.push(userData.other);
    }

    // Additional health details if provided
    const healthDetails = userData.details || "No additional health details provided";

    // Prepare the prompt for Gemini
    const prompt = `
    Generate a personalized health recommendation report based on the following information:
    
    User Information:
    - Age: ${age}
    - Symptoms: ${activeSymptoms.length > 0 ? activeSymptoms.join(", ") : "None reported"}
    - Additional Health Details: ${healthDetails}
    
    Air Quality Information:
    - Current AQI Value: ${aqiData.value}
    - AQI Status: ${aqiData.status}
    
    Please provide the following recommendations in a friendly, concise manner. Include appropriate emojis to make the recommendations more engaging and easier to understand. Use HTML formatting (like <strong>, <em>, <br>) if needed to improve readability.
    
    1. General Recommendation: Overall health advice based on current air quality. Start with an appropriate emoji.
    2. Age-specific Recommendation: Tailored advice considering the person's age (${age}). Include specific time ranges (e.g., '6:00 AM - 8:00 AM' instead of 'morning') for recommended outdoor activities. Start with an appropriate emoji.
    3. Health Condition Recommendation: Specific advice based on the reported symptoms and health details. Start with an appropriate emoji.
    4. Time-specific Recommendation: Advice on the best times for outdoor activities based on air quality patterns. Use specific time ranges (e.g., '6:00 AM - 8:00 AM' instead of 'morning') for recommended outdoor activities. Start with an appropriate emoji.
    5. Mask Recommendation: Whether masks are needed and what type is recommended. Start with an appropriate emoji.
    
    Use emojis like:
    - 😊 for positive messages
    - ⚠️ for warnings
    - 🏃‍♂️ for exercise recommendations
    - 🕒 for time-related advice
    - 😷 for mask recommendations
    - 🌿 for air quality information
    - 💧 for hydration advice
    - 🏠 for indoor recommendations
    - 🌞 for outdoor recommendations
    - 👨‍⚕️ for medical advice
    
    Format your response as a JSON object with the following structure:
    {
      "generalRecommendation": "...",
      "ageSpecificRecommendation": "...",
      "healthConditionRecommendation": "...",
      "timeSpecificRecommendation": "...",
      "maskRecommendation": "..."
    }
    `;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse Gemini API response");
    }
  } catch (error) {
    console.error("Error generating health recommendations:", error);
    
    // Return fallback recommendations if API fails
    return {
      generalRecommendation: "Based on the current air quality, it's advisable to monitor your health and limit outdoor exposure if you experience any discomfort.",
      ageSpecificRecommendation: "Consider your age-related health factors when planning outdoor activities. For your age group, the best time for outdoor activities is between 6:00 AM - 8:00 AM when air quality is typically better.",
      healthConditionRecommendation: "If you have respiratory symptoms, consult with a healthcare provider for personalized advice.",
      timeSpecificRecommendation: "Air quality is typically better between 5:00 AM - 9:00 AM and 7:00 PM - 9:00 PM. Consider scheduling outdoor activities during these specific hours for optimal air quality conditions.",
      maskRecommendation: aqiData.value > 100 ? "An N95 mask is recommended when outdoors." : "No mask is necessary for most people in current conditions."
    };
  }
};
