import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { generateHealthRecommendations, checkGeminiAPIStatus } from '../services/geminiService';

// Create context
const HealthReportContext = createContext();

export const useHealthReport = () => useContext(HealthReportContext);

export const HealthReportProvider = ({ children }) => {
  // Use useRef to persist data across renders
  const userDataRef = useRef(null);
  const aqiDataRef = useRef(null);
  
  const [isApiInitialized, setIsApiInitialized] = useState(true);
  const [userData, setUserData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReport, setShowReport] = useState(false);

  // Check if the Gemini API is initialized
  useEffect(() => {
    const apiStatus = checkGeminiAPIStatus();
    setIsApiInitialized(apiStatus);
    console.log('Gemini API status checked:', apiStatus);
  }, []);

  // Set user data from the form with validation
  const setUserFormData = (formData) => {
    console.log("Setting user form data:", formData);
    if (!formData || typeof formData !== 'object') {
      console.error("Attempted to set invalid user data:", formData);
      return;
    }
    
    // Store in ref for persistence
    userDataRef.current = { ...formData };
    // Update state
    setUserData({ ...formData });
    
    console.log("User data set successfully:", userDataRef.current);
  };

  // Set AQI data with validation
  const setAqiInformation = (data) => {
    console.log("Setting AQI information:", data);
    if (!data || typeof data !== 'object' || !data.value || !data.status) {
      console.error("Attempted to set invalid AQI data:", data);
      return;
    }
    
    // Create a clean copy
    const cleanAqiData = {
      value: Number(data.value),
      status: String(data.status)
    };
    
    // Store in ref for persistence
    aqiDataRef.current = cleanAqiData;
    // Update state
    setAqiData(cleanAqiData);
    
    console.log("AQI data set successfully:", aqiDataRef.current);
  };

  // Generate the health report
  const generateReport = async () => {
    console.log('Generate report called with refs:', { 
      userDataRef: userDataRef.current, 
      aqiDataRef: aqiDataRef.current 
    });
    
    // Use data from refs for more reliability
    const currentUserData = userDataRef.current || userData;
    const currentAqiData = aqiDataRef.current || aqiData;
    
    // Enhanced validation
    if (!currentUserData) {
      setError('Missing user data. Please fill out the form completely.');
      console.error('Missing user data:', currentUserData);
      return false;
    }
    
    if (!currentAqiData || !currentAqiData.value || !currentAqiData.status) {
      setError('Missing AQI information. Please try refreshing the page.');
      console.error('Missing or invalid AQI data:', currentAqiData);
      return false;
    }

    if (!isApiInitialized) {
      setError('Gemini API not initialized. Please check your internet connection.');
      console.error('Gemini API not initialized');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Generating health recommendations with:', { 
        userData: currentUserData, 
        aqiData: currentAqiData 
      });
      
      const recommendations = await generateHealthRecommendations(currentUserData, currentAqiData);
      
      if (!recommendations) {
        throw new Error('Failed to generate recommendations');
      }
      
      setReportData(recommendations);
      setShowReport(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error generating report:', err);
      setError(`Failed to generate report: ${err.message}`);
      setIsLoading(false);
      return false;
    }
  };

  // Reset the report state
  const resetReport = () => {
    setShowReport(false);
    setReportData(null);
  };

  // Context value
  const value = {
    isApiInitialized,
    userData: userData || userDataRef.current,
    aqiData: aqiData || aqiDataRef.current,
    reportData,
    isLoading,
    error,
    showReport,
    setUserFormData,
    setAqiInformation,
    generateReport,
    resetReport
  };

  return (
    <HealthReportContext.Provider value={value}>
      {children}
    </HealthReportContext.Provider>
  );
};

export default HealthReportContext;
