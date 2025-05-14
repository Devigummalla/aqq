import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDownload, FiFilePlus, FiImage, FiPrinter } from 'react-icons/fi';
import HealthReport from '../components/health/HealthReport';
import { useHealthReport } from '../context/HealthReportContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const HealthReportPage = () => {
  const navigate = useNavigate();
  const { userData, aqiData, reportData, showReport } = useHealthReport();
  const [isDownloading, setIsDownloading] = useState(false);

  // Redirect if no report data is available
  if (!showReport || !userData || !aqiData || !reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#f0f4ff] to-[#cbeafe] dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
        <div className="p-8 text-center bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">No Report Available</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Please complete the respiratory health survey to generate a personalized health report.
          </p>
          <button
            onClick={() => navigate('/form-input')}
            className="px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary-500 hover:bg-primary-600"
          >
            Go to Health Survey
          </button>
        </div>
      </div>
    );
  }

  // Reference to the report element
  const reportRef = useRef(null);
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Function to generate the filename
  const getFileName = (extension) => {
    const date = new Date().toISOString().split('T')[0];
    const name = userData?.name?.replace(/\s+/g, '_') || 'User';
    return `BreathSafe_Health_Report_${name}_${date}.${extension}`;
  };

  // Function to download the report as PDF
  const downloadAsPDF = async () => {
    setIsDownloading(true);
    const reportElement = reportRef.current;
    
    if (!reportElement) {
      alert('Report element not found. Please try again.');
      setIsDownloading(false);
      return;
    }
    
    try {
      // Create a canvas from the report element
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Get image data from canvas
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to fit the page
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Add metadata
      pdf.setProperties({
        title: 'BreathSafe Health Report',
        subject: 'Personalized Health Recommendations',
        author: 'BreathSafe App',
        keywords: 'health, air quality, recommendations',
        creator: 'BreathSafe'
      });
      
      // Save PDF
      pdf.save(getFileName('pdf'));
      
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
      setShowDownloadOptions(false);
    }
  };
  
  // Function to download the report as PNG
  const downloadAsPNG = async () => {
    setIsDownloading(true);
    const reportElement = reportRef.current;
    
    if (!reportElement) {
      alert('Report element not found. Please try again.');
      setIsDownloading(false);
      return;
    }
    
    try {
      // Create a canvas from the report element
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = getFileName('png');
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      console.log('PNG downloaded successfully');
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Failed to download report as image. Please try again.');
    } finally {
      setIsDownloading(false);
      setShowDownloadOptions(false);
    }
  };
  
  // Function to print the report
  const printReport = () => {
    setIsDownloading(true);
    
    try {
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Pop-up blocked. Please allow pop-ups and try again.');
        setIsDownloading(false);
        return;
      }
      
      // Get report HTML content
      const reportElement = reportRef.current;
      const reportContent = reportElement.innerHTML;
      
      // Create print document
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>BreathSafe Health Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #333;
              }
              .report-container {
                max-width: 800px;
                margin: 0 auto;
              }
              h1, h2 {
                color: #3b82f6;
              }
              .section {
                margin-bottom: 20px;
                padding: 15px;
                border-radius: 8px;
                background-color: #f8fafc;
              }
              @media print {
                body {
                  padding: 0;
                }
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="report-container">
              ${reportContent}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      console.log('Print window opened successfully');
    } catch (error) {
      console.error('Error printing report:', error);
      alert('Failed to print report. Please try again.');
    } finally {
      setIsDownloading(false);
      setShowDownloadOptions(false);
    }
  };
  
  // Function to handle download based on selected format
  const handleDownload = () => {
    if (showDownloadOptions) {
      setShowDownloadOptions(false);
      return;
    }
    
    setShowDownloadOptions(true);
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-[#f0f4ff] to-[#cbeafe] dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
        
        <div id="health-report" ref={reportRef}>
          <HealthReport 
            userData={userData}
            aqiData={aqiData}
            reportData={reportData}
          />
        </div>
        
        {/* Download button below the report */}
        <div className="flex justify-center mt-10">
          <div className="relative">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-6 py-3 text-base font-medium text-white transition-colors rounded-lg shadow-md bg-primary-500 hover:bg-primary-600 disabled:opacity-70"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiDownload className="w-5 h-5" />
                  <span>Download Your Health Report</span>
                </>
              )}
            </button>
            
            {showDownloadOptions && !isDownloading && (
              <div className="absolute left-1/2 z-10 mt-2 overflow-hidden bg-white rounded-lg shadow-lg w-44 -translate-x-1/2 dark:bg-gray-800">
                <button
                  onClick={downloadAsPDF}
                  className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <FiFilePlus className="w-4 h-4" />
                  <span>Save as PDF</span>
                </button>
                <button
                  onClick={downloadAsPNG}
                  className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <FiImage className="w-4 h-4" />
                  <span>Save as Image</span>
                </button>
                <button
                  onClick={printReport}
                  className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <FiPrinter className="w-4 h-4" />
                  <span>Print Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthReportPage;
