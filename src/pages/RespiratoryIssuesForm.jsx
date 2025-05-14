import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import { useHealthReport } from "../context/HealthReportContext";
import { getAQIStatus } from "../utils/aqiUtils";

export default function RespiratoryIssuesForm() {
  const navigate = useNavigate();
  const { 
    setUserFormData, 
    setAqiInformation,
    generateReport,
    error
  } = useHealthReport();
  
  const [currentAqi, setCurrentAqi] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    age: "",
    cough: false,
    mucus: false,
    shortnessOfBreath: false,
    chestPain: false,
    wheezing: false,
    soreThroat: false,
    runnyNose: false,
    fever: false,
    fatigue: false,
    other: "",
    details: "",
    consent: false,
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    fetchCurrentAqi();
  }, []);
  
  const fetchCurrentAqi = async () => {
    try {
      // Get user's location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Fetch AQI data from Open-Meteo API
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data?.hourly?.us_aqi) {
        // Find last non-null AQI index
        const aqiArray = data.hourly.us_aqi;
        let lastIdx = aqiArray.length - 1;
        while (lastIdx >= 0 && aqiArray[lastIdx] === null) lastIdx--;
        
        if (lastIdx >= 0) {
          const aqiValue = aqiArray[lastIdx];
          const aqiData = {
            value: aqiValue,
            status: getAQIStatus(aqiValue)
          };
          
          setCurrentAqi(aqiData);
          setAqiInformation(aqiData);
          return;
        }
      }
      
      // Fallback to mock data if API fails
      fallbackToMockData();
    } catch (error) {
      console.error("Error fetching AQI data:", error);
      fallbackToMockData();
    }
  };
  
  const fallbackToMockData = () => {
    const mockAqiData = {
      value: Math.floor(Math.random() * 200) + 30,
      status: ""
    };
    
    if (mockAqiData.value <= 50) mockAqiData.status = "Good";
    else if (mockAqiData.value <= 100) mockAqiData.status = "Moderate";
    else if (mockAqiData.value <= 150) mockAqiData.status = "Unhealthy for Sensitive Groups";
    else if (mockAqiData.value <= 200) mockAqiData.status = "Unhealthy";
    else if (mockAqiData.value <= 300) mockAqiData.status = "Very Unhealthy";
    else mockAqiData.status = "Hazardous";
    
    setCurrentAqi(mockAqiData);
    setAqiInformation(mockAqiData);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.consent) {
      alert("Please provide consent to submit.");
      return;
    }
    
    try {
      console.log("Form data being submitted:", form);
      
      // Validate form data
      if (!form.name || !form.age) {
        alert("Please provide your name and age.");
        return;
      }
      
      // Make sure we have current AQI data
      if (!currentAqi) {
        await fetchCurrentAqi();
      }
      
      if (!currentAqi) {
        alert("Unable to fetch air quality data. Please try again later.");
        return;
      }
      
      // Create a clean copy of the form data to prevent any reference issues
      const userData = { ...form };
      console.log("Clean user data being set:", userData);
      
      // Create a clean copy of the AQI data
      const aqiInfo = { 
        value: currentAqi.value, 
        status: currentAqi.status 
      };
      console.log("Clean AQI data being set:", aqiInfo);
      
      // First set the user data in context
      setUserFormData(userData);
      
      // Then set AQI data in context
      setAqiInformation(aqiInfo);
      
      // Add a small delay to ensure state updates have propagated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now generate the report
      const success = await generateReport();
      
      if (success) {
        // Navigate to LiveAQIPage instead of health-report page
        navigate("/");
      } else {
        // If report generation failed, show error
        alert("Failed to generate health report. Please try again.");
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      alert("An error occurred while processing your request. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen pb-10 bg-gradient-to-br from-[#f0f4ff] to-[#cbeafe] dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {currentAqi && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg p-4 mx-auto mt-20 mb-4 bg-white rounded-lg shadow-md dark:bg-gray-800"
        >
          <div className="flex items-center">
            <FiAlertCircle className="w-5 h-5 mr-2 text-primary-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Air Quality</h3>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">AQI Value:</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{currentAqi.value}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Status:</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{currentAqi.status}</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg p-4 mx-auto mt-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded-r-lg dark:bg-red-900/30 dark:text-red-300"
        >
          <p>{error}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-lg p-8 mx-auto mt-6 mb-10 bg-white border-t-8 shadow-2xl pt-14 dark:bg-gray-800 rounded-2xl border-primary-400"
      >
        <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-center text-primary-600 dark:text-primary-400">
          Respiratory Health Survey
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div className="w-32">
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200" htmlFor="age">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                required
                value={form.age}
                onChange={handleChange}
                placeholder="Age"
                className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          <fieldset className="p-4 border border-gray-200 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
            <legend className="mb-2 text-lg font-semibold text-primary-600 dark:text-primary-400">
              Symptoms you are experiencing:
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { name: "cough", label: "Cough" },
                { name: "mucus", label: "Cough with mucus/phlegm" },
                { name: "shortnessOfBreath", label: "Shortness of breath" },
                { name: "chestPain", label: "Chest pain/tightness" },
                { name: "wheezing", label: "Wheezing" },
                { name: "soreThroat", label: "Sore throat" },
                { name: "runnyNose", label: "Stuffy/runny nose" },
                { name: "fever", label: "Fever" },
                { name: "fatigue", label: "Fatigue/tiredness" },
              ].map((symptom) => (
                <label
                  key={symptom.name}
                  className="flex items-center space-x-2 text-gray-700 cursor-pointer dark:text-white group"
                >
                  <input
                    type="checkbox"
                    name={symptom.name}
                    checked={form[symptom.name]}
                    onChange={handleChange}
                    className="transition-all form-checkbox accent-primary-500 group-hover:scale-110"
                  />
                  <span className="transition-colors group-hover:text-primary-600">
                    {symptom.label}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200" htmlFor="other">
                Other symptoms (optional)
              </label>
              <input
                id="other"
                name="other"
                type="text"
                value={form.other}
                onChange={handleChange}
                placeholder="Describe any other symptoms"
                className="w-full px-4 py-2 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </fieldset>

          <div>
            <label htmlFor="details" className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">
              Tell us more about your health (optional)
            </label>
            <textarea
              id="details"
              name="details"
              rows={4}
              value={form.details}
              onChange={handleChange}
              placeholder="Share more about your respiratory health, recent issues, or anything else you'd like to add."
              className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg shadow-sm resize-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div className="flex items-center space-x-2 text-gray-700 dark:text-white">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={handleChange}
              required
              className="transition-all form-checkbox accent-primary-500"
            />
            <label htmlFor="consent" className="select-none">
              I consent to my data being used for health research.
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold tracking-wide text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500"
          >
            Submit
          </button>
        </form>
      </motion.div>
    </div>
  );
}
