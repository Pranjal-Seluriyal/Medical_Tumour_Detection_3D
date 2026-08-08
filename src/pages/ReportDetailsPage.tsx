import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { reportsService, type ReportLog } from '../services/reports';
import { DisclaimerCard } from '../components/Cards';
import { API_BASE_URL } from '../services/api';

export const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportLog | null>(null);
  const [sliceIndex, setSliceIndex] = useState<number>(48);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await reportsService.getReportById(id);
        setReport(data);
      } catch (err) {
        console.error('Failed to load report by ID:', err);
        navigate('/reports');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReportDetail();
  }, [id, navigate]);

  const handleDownload = () => {
    if (!report) return;
    setToastMsg(`Saving Report PDF #${report.id} to Downloads...`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Low':
        return (
          <span className="bg-[#10b981]/10 border border-[#10b981]/25 text-[#059669] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            Low Severity
          </span>
        );
      case 'Moderate':
        return (
          <span className="bg-yellow-500/10 border border-yellow-500/25 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            Moderate Severity
          </span>
        );
      case 'High':
        return (
          <span className="bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            High Severity
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex font-body-md bg-background dark:bg-inverse-surface">
        <Sidebar />
        <main className="ml-[280px] flex-grow flex items-center justify-center h-screen">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
        </main>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen flex font-body-md antialiased overflow-hidden bg-background dark:bg-inverse-surface transition-colors duration-200">
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-[280px] flex-1 flex flex-col h-screen relative bg-surface-bright dark:bg-inverse-surface transition-colors duration-200 p-container-padding overflow-y-auto">
        
        {/* Toast Download Message */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide glass-panel px-6 py-4 rounded-xl flex items-center gap-3 border-l-4 border-primary">
            <span className="material-symbols-outlined text-primary">download</span>
            <span className="text-sm font-bold text-on-surface">{toastMsg}</span>
          </div>
        )}

        {/* Back navigation header */}
        <header className="mb-stack-md pt-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 max-w-7xl w-full">
          <div>
            <Link to="/reports" className="text-primary hover:underline text-sm font-semibold flex items-center gap-1 mb-2 no-underline">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Scan History
            </Link>
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-surface-container-lowest">
              Report Details: {report.patientId}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant">
              Comprehensive scan parameters, segmentation viewer, and doctor logs.
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm px-6 py-3 rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined">download</span>
            Download PDF Report
          </button>
        </header>

        {/* Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-7xl pb-stack-lg items-start">
          
          {/* Scan viewers (Left column) */}
          <div className="col-span-1 md:col-span-7 flex flex-col gap-stack-md">
            <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
              <h3 className="font-title-md text-title-md text-on-surface dark:text-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">compare</span>
                MRI Comparative Segmentation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-panel rounded-lg overflow-hidden border border-white/10 relative bg-black">
                  <img
                    src={
                      sliceIndex === 48
                        ? report.imageUrl
                        : `${API_BASE_URL}/predict/slice/${report.id}/${sliceIndex}?type=original`
                    }
                    alt="mri original"
                    className="w-full h-64 object-cover mix-blend-screen"
                  />
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    Original Scan View
                  </div>
                </div>

                <div className="glass-panel rounded-lg overflow-hidden border border-white/10 relative bg-black">
                  <img
                    src={
                      sliceIndex === 48
                        ? report.segmentedUrl
                        : `${API_BASE_URL}/predict/slice/${report.id}/${sliceIndex}?type=overlay`
                    }
                    alt="mri segmented"
                    className="w-full h-64 object-cover mix-blend-screen"
                  />
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-primary/80 rounded text-xs text-white">
                    Tumor Segmentation Layer
                  </div>
                </div>
              </div>
              
              {report.id && (
                <div className="glass-panel p-4 rounded-lg mt-2 flex flex-col gap-2 border border-outline-variant/30 bg-surface-container/20 dark:bg-black/10">
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant dark:text-outline-variant">
                    <span>3D Volume Slice Viewer (Z-axis Scroll)</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">Slice {sliceIndex} / 95</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="95" 
                    value={sliceIndex} 
                    onChange={(e) => setSliceIndex(parseInt(e.target.value))}
                    className="w-full accent-primary h-2 bg-surface-container rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Results Info (Right column) */}
          <div className="col-span-1 md:col-span-5 flex flex-col gap-stack-md">
            <DisclaimerCard />

            {/* Prediction details */}
            <div className="glass-panel glass-active rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-outline-variant/30 dark:border-outline/30 pb-4">
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface dark:text-surface">AI Metrics Analysis</h4>
                  <p className="text-xs text-on-surface-variant dark:text-outline mt-1">
                    Completed: {report.date}
                  </p>
                </div>
                {getSeverityBadge(report.severity)}
              </div>

              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-highest dark:text-surface-container-high"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    ></path>
                    <path
                      className="text-secondary dark:text-secondary-fixed"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${report.confidence}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3"
                    ></path>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-on-surface dark:text-surface">{report.confidence}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface dark:text-surface mb-1">
                    {report.prediction}
                  </h4>
                  <p className="text-xs text-on-surface-variant dark:text-outline">
                    AI classification confidence determined by convolutional Graph structures.
                  </p>
                </div>
              </div>

              {(report.processingTime || report.analysisDate) && (
                <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10 text-xs text-on-surface-variant dark:text-outline-variant">
                  <span>Analysis Date: {report.analysisDate || report.date}</span>
                  {report.processingTime && <span>Processing Time: {report.processingTime}s</span>}
                </div>
              )}
            </div>

            {/* AI Patient Summary & Recommendation Cards */}
            <div className="bg-surface-container-low dark:bg-surface-container rounded-xl p-5 border border-outline-variant/30 dark:border-outline/30 flex flex-col gap-4 shadow-sm">
              
              {/* AI Summary Block */}
              <div className="flex gap-3 items-start">
                <div className="bg-primary-container/20 dark:bg-primary-container/40 p-2 rounded-full flex-shrink-0">
                  <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-[20px]">analytics</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-label-sm text-label-sm text-on-surface dark:text-surface mb-1 font-bold">
                    AI Summary
                  </h5>
                  <p className="text-sm text-on-surface-variant dark:text-outline leading-relaxed">
                    {report.aiSummary || (report.severity === 'Low' || report.prediction.toLowerCase().includes('no tumor')
                      ? "The uploaded MRI scan was analyzed by the BrainAI system. No anomalous regions or signs of tumor tissue were detected in the cerebral hemispheres. The estimated severity is Low."
                      : `The uploaded MRI was analyzed by the BrainAI system. A region consistent with a tumor was identified and segmented. The estimated severity is ${report.severity}.`)}
                  </p>
                </div>
              </div>

              {/* AI Recommendation Block */}
              <div className="flex gap-3 items-start border-t border-outline-variant/10 pt-4">
                <div className="bg-secondary-container/20 dark:bg-secondary-container/40 p-2 rounded-full flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary text-[20px]">clinical_notes</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-label-sm text-label-sm text-on-surface dark:text-surface mb-1 font-bold">
                    AI Recommendation
                  </h5>
                  <p className="text-sm text-on-surface-variant dark:text-outline leading-relaxed">
                    {report.recommendation}
                  </p>
                </div>
              </div>

              {/* Next Steps Block */}
              <div className="flex gap-3 items-start border-t border-outline-variant/10 pt-4">
                <div className="bg-tertiary-container/20 dark:bg-tertiary-container/40 p-2 rounded-full flex-shrink-0">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">medical_services</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-label-sm text-label-sm text-on-surface dark:text-surface mb-1 font-bold">
                    Next Steps
                  </h5>
                  <p className="text-sm text-on-surface-variant dark:text-outline leading-relaxed font-semibold">
                    {report.nextSteps || (report.severity === 'Low' || report.prediction.toLowerCase().includes('no tumor')
                      ? "Continue consulting your neurologist for periodic monitoring and routine checkups. Maintain standard diagnostic schedules."
                      : "Please consult a neurologist or radiologist for professional evaluation. This AI analysis is intended to support—not replace—a medical diagnosis.")}
                  </p>
                </div>
              </div>

              {/* Footer Disclaimer */}
              <div className="mt-2 pt-3 border-t border-outline-variant/10 text-xs text-outline dark:text-outline-variant leading-relaxed italic">
                "This AI analysis is intended for educational purposes only and does not replace professional medical diagnosis."
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
