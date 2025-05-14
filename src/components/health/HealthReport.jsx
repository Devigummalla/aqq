import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiCalendar, FiUser, FiActivity, FiClock, FiShield } from 'react-icons/fi';

const HealthReport = ({ userData, aqiData, reportData }) => {
  if (!userData || !aqiData || !reportData) {
    return <div>Loading report data...</div>;
  }

  const { name, age } = userData;
  const { value: aqiValue, status: aqiStatus } = aqiData;

  const getAQIColorClass = (aqi) => {
    if (aqi <= 50) return "text-green-600";
    if (aqi <= 100) return "text-yellow-600";
    if (aqi <= 150) return "text-orange-500";
    if (aqi <= 200) return "text-red-500";
    if (aqi <= 300) return "text-purple-600";
    return "text-purple-800";
  };

  const getMaskRecommendation = (aqi) => {
    if (aqi <= 50) return { needed: false, type: "None needed" };
    if (aqi <= 100) return { needed: false, type: "None needed for most people" };
    if (aqi <= 150) return { needed: true, type: "N95 mask recommended for sensitive individuals" };
    if (aqi <= 200) return { needed: true, type: "N95 mask recommended for everyone" };
    return { needed: true, type: "N95 or higher grade mask essential" };
  };

  const maskRec = getMaskRecommendation(aqiValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl p-6 mx-auto bg-white rounded-xl shadow-xl dark:bg-gray-800 border-t-4 border-primary-500"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Personalized Health Report
        </h1>
        <div className="px-3 py-1 text-sm font-semibold rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mb-6 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <FiUser className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Personal Information</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-3 sm:grid-cols-2">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
            <p className="font-medium text-gray-800 dark:text-white">{name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Age:</span>
            <p className="font-medium text-gray-800 dark:text-white">{age} years</p>
          </div>
        </div>
      </div>

      {/* AQI Status */}
      <div className="p-4 mb-6 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Current Air Quality</h2>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">AQI Value:</span>
            <p className={`font-bold text-lg ${getAQIColorClass(aqiValue)}`}>{aqiValue}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
            <p className={`font-medium ${getAQIColorClass(aqiValue)}`}>{aqiStatus}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* General Recommendation */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <div className="flex items-center gap-3 mb-3">
            <FiActivity className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">General Recommendation</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: reportData.generalRecommendation }} />
        </div>

        {/* Age-specific Recommendation */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <div className="flex items-center gap-3 mb-3">
            <FiCalendar className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Age-specific Recommendation</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: reportData.ageSpecificRecommendation }} />
        </div>

        {/* Health Condition Recommendation */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <div className="flex items-center gap-3 mb-3">
            <FiActivity className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Health Condition Recommendation</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: reportData.healthConditionRecommendation }} />
        </div>

        {/* Time-specific Recommendation */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <div className="flex items-center gap-3 mb-3">
            <FiClock className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Time-specific Recommendation</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: reportData.timeSpecificRecommendation }} />
        </div>
      </div>

      {/* Mask Recommendation */}
      <div className="p-4 mt-6 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <div className="flex items-center gap-3 mb-3">
          <FiShield className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Mask Recommendation</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 text-sm font-medium rounded-full ${maskRec.needed ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
            {maskRec.needed ? '😷 Mask Recommended' : '😊 No Mask Required'}
          </div>
          <p className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: reportData.maskRecommendation || maskRec.type }} />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>This report is generated based on current air quality data and your provided health information. 
        It is intended as general guidance and not as medical advice. Please consult with a healthcare 
        professional for personalized medical recommendations.</p>
      </div>
    </motion.div>
  );
};

export default HealthReport;
