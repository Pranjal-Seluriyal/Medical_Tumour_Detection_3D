import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { DisclaimerCard } from '../components/Cards';
import { API_BASE_URL } from '../services/api';

export const AnalysisPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<any>(null);
  const [sliceIndex, setSliceIndex] = useState<number>(48);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    const stateResult = location.state?.predictionResult;
    
    if (stateResult) {
      const getFullUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
        return `${baseUrl}${url}`;
      };
      
      setReportData({
        reportId: stateResult.report_id,
        patientId: 'Patient #88392-A',
        scanType: 'Sagittal T2',
        date: stateResult.analysis_date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        confidence: stateResult.confidence,
        severity: stateResult.severity,
        prediction: stateResult.prediction,
        recommendation: stateResult.recommendation,
        segmentedUrl: getFullUrl(stateResult.segmentation_image),
        imageUrl: getFullUrl(stateResult.original_image || ''),
        aiSummary: stateResult.ai_summary,
        nextSteps: stateResult.next_steps,
        processingTime: stateResult.processing_time,
        analysisDate: stateResult.analysis_date
      });
    } else {
      const reportsList = JSON.parse(localStorage.getItem('mock_reports') || '[]');
      if (reportsList.length > 0) {
        setReportData(reportsList[0]);
      } else {
        navigate('/upload');
      }
    }
  }, [location, navigate]);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-inverse-surface text-on-surface">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Low':
        return (
          <span className="bg-[#10b981]/10 border border-[#10b981]/25 text-[#059669] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-fade">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            Low Severity
          </span>
        );
      case 'Moderate':
        return (
          <span className="bg-yellow-500/10 border border-yellow-500/25 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-fade">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            Moderate Severity
          </span>
        );
      case 'High':
        return (
          <span className="bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-fade">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            High Severity
          </span>
        );
      default:
        return (
          <span className="bg-slate-500/15 border border-slate-500/20 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 ambient-bg pt-20">
      <Navbar />

      {/* Toast Alert popup overlay */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide glass-panel px-6 py-4 rounded-xl flex items-center gap-3 border-l-4 border-primary">
          <span className="material-symbols-outlined text-primary">
            {toastMsg.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <span className="text-sm font-bold text-on-surface">{toastMsg.msg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-container-padding py-stack-lg md:py-16 grid grid-cols-1 md:grid-cols-12 gap-stack-md md:gap-stack-lg animate-fade">
        
        {/* Header Section */}
        <header className="col-span-1 md:col-span-12 mb-stack-sm flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface dark:text-surface mb-2">
              Patient Scan Analysis
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-outline-variant">
              Interactive diagnosis segmentation and Severity prediction overlays.
            </p>
          </div>
          <Link
            to="/upload"
            className="glass-panel text-primary dark:text-inverse-primary font-label-sm text-label-sm px-5 py-2.5 rounded-lg hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all no-underline flex items-center gap-2 font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Analyze Another MRI
          </Link>
        </header>

        {/* Scan Viewer Comparison Column (Left) */}
        <div className="col-span-1 md:col-span-7 flex flex-col gap-stack-md">
          <div className="glass-panel rounded-xl p-4 flex flex-col gap-4">
            <h3 className="font-title-md text-title-md text-on-surface dark:text-surface flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-primary">compare</span>
              Visual Comparison View
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original MRI Box */}
              <div className="glass-panel rounded-lg overflow-hidden border border-white/10 relative bg-black">
                <img
                  className="object-cover w-full h-64 opacity-80 mix-blend-screen"
                  src={
                    sliceIndex === 48
                      ? reportData.imageUrl
                      : `${API_BASE_URL}/predict/slice/${reportData.reportId}/${sliceIndex}?type=original`
                  }
                  alt="Original Scan View"
                />
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs text-white">
                  Original MRI Scan
                </div>
              </div>

              {/* Segmented MRI Box */}
              <div className="glass-panel rounded-lg overflow-hidden border border-white/10 relative bg-black">
                <img
                  className="object-cover w-full h-64 opacity-95 mix-blend-screen"
                  src={
                    sliceIndex === 48
                      ? reportData.segmentedUrl
                      : `${API_BASE_URL}/predict/slice/${reportData.reportId}/${sliceIndex}?type=overlay`
                  }
                  alt="Segmented Prediction View"
                />
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-primary/80 backdrop-blur-md rounded text-xs text-white">
                  Segmented MRI Output
                </div>
              </div>
            </div>
            
            {reportData.reportId && (
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

          {/* Action Row */}
          <div className="flex gap-4">
            <button
              onClick={() => showToast('Report PDF saved to downloads folder.', 'success')}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm py-4 rounded-lg shadow-lg hover:shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined">download</span>
              Download PDF Report
            </button>
            <button
              onClick={() => {
                showToast('Report logs saved in scan history log database.', 'success');
                setTimeout(() => navigate('/reports'), 1200);
              }}
              className="flex-1 glass-panel text-primary dark:text-inverse-primary font-label-sm text-label-sm py-4 rounded-lg hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border-none cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined">save</span>
              Save Report
            </button>
          </div>
        </div>

        {/* Prediction Results Details Column (Right) */}
        <div className="col-span-1 md:col-span-5 flex flex-col gap-stack-md">
          {/* HIPAA disclaimer */}
          <DisclaimerCard />

          {/* Predict Result Card */}
          <div className="glass-panel glass-active rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 dark:bg-secondary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start border-b border-outline-variant/30 dark:border-outline/30 pb-4">
              <div>
                <h3 className="font-title-md text-title-md text-on-surface dark:text-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">memory</span>
                  AI Prediction Details
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-outline mt-1">
                  Patient ID: {reportData.patientId} • Completed: {reportData.date}
                </p>
              </div>
              {getSeverityBadge(reportData.severity)}
            </div>

            <div className="flex items-center gap-6">
              {/* circular gauge */}
              <div className="relative w-24 h-24 flex-shrink-0">
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
                    strokeDasharray={`${reportData.confidence}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3"
                  ></path>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-title-md text-title-md text-on-surface dark:text-surface">
                    {reportData.confidence}%
                  </span>
                  <span className="text-[10px] text-on-surface-variant dark:text-outline uppercase tracking-wider">
                    Confidence
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface dark:text-surface mb-1">
                  {reportData.prediction}
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline">
                  Structural anomalous features computed via localized segmentation nodes.
                </p>
              </div>
            </div>

            {(reportData.processingTime || reportData.analysisDate) && (
              <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10 text-xs text-on-surface-variant dark:text-outline-variant">
                <span>Analysis Date: {reportData.analysisDate || reportData.date}</span>
                {reportData.processingTime && <span>Processing Time: {reportData.processingTime}s</span>}
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
                  {reportData.aiSummary || (reportData.severity === 'Low' || reportData.prediction.toLowerCase().includes('no tumor')
                    ? "The uploaded MRI scan was analyzed by the BrainAI system. No anomalous regions or signs of tumor tissue were detected in the cerebral hemispheres. The estimated severity is Low."
                    : `The uploaded MRI was analyzed by the BrainAI system. A region consistent with a tumor was identified and segmented. The estimated severity is ${reportData.severity}.`)}
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
                  {reportData.recommendation}
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
                  {reportData.severity === 'Low' || reportData.prediction.toLowerCase().includes('no tumor')
                    ? "Continue consulting your neurologist for periodic monitoring and routine checkups. Maintain standard diagnostic schedules."
                    : "Please consult a neurologist or radiologist for professional evaluation. This AI analysis is intended to support—not replace—a medical diagnosis."}
                </p>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="mt-2 pt-3 border-t border-outline-variant/10 text-xs text-outline dark:text-outline-variant leading-relaxed italic">
              "This AI analysis is intended for educational purposes only and does not replace professional medical diagnosis."
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-high dark:bg-inverse-surface w-full px-container-padding py-stack-lg flex flex-col items-center gap-base text-center border-t border-outline-variant/30 dark:border-outline/30 mt-auto">
        <div className="font-title-md text-primary dark:text-inverse-primary mb-2">BrainAI</div>
        <p className="font-body-md text-body-md text-tertiary dark:text-outline-variant">
          © 2024 BrainAI Technologies. All medical insights are AI-generated and require specialist verification.
        </p>
      </footer>
    </div>
  );
};
