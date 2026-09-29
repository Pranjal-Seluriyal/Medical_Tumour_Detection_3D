import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { reportsService, type ReportLog } from '../services/reports';
import { SearchInput } from '../components/Inputs';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportsService.getReports();
      setReports(data || []);
    } catch (err) {
      console.error('Failed to fetch reports log list:', err);
      setError('Failed to load scan history. Please verify your network connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setToastMsg(`Downloading report PDF #${id}...`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low':
        return 'bg-[#10b981]/10 border-[#10b981]/20 text-[#059669]';
      case 'Moderate':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      case 'High':
        return 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-slate-500/10 border-slate-500/20 text-slate-600';
    }
  };

  const processedReports = (reports || [])
    .filter((report) => {
      const patientId = report?.patientId || '';
      const prediction = report?.prediction || '';
      const scanType = report?.scanType || '';
      const severity = report?.severity || '';
      
      const matchesSearch = patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            prediction.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            scanType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || severity === severityFilter;
      return matchesSearch && matchesSeverity;
    })
    .sort((a, b) => {
      const aDate = a?.date ? new Date(a.date).getTime() : 0;
      const bDate = b?.date ? new Date(b.date).getTime() : 0;
      const aConf = typeof a?.confidence === 'number' ? a.confidence : 0;
      const bConf = typeof b?.confidence === 'number' ? b.confidence : 0;
      
      if (sortBy === 'date_desc') {
        return bDate - aDate;
      }
      if (sortBy === 'date_asc') {
        return aDate - bDate;
      }
      if (sortBy === 'confidence_desc') {
        return bConf - aConf;
      }
      if (sortBy === 'confidence_asc') {
        return aConf - bConf;
      }
      return 0;
    });

  return (
    <div className="min-h-screen flex font-body-md antialiased overflow-hidden bg-background dark:bg-inverse-surface transition-colors duration-200">
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-[280px] flex-1 flex flex-col h-screen relative bg-surface-bright dark:bg-inverse-surface transition-colors duration-200">
        
        {/* Toast download alert */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide glass-panel px-6 py-4 rounded-xl flex items-center gap-3 border-l-4 border-primary">
            <span className="material-symbols-outlined text-primary">download</span>
            <span className="text-sm font-bold text-on-surface">{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <header className="w-full px-container-padding py-stack-md flex flex-col md:flex-row justify-between items-start md:items-end border-b border-outline-variant/20 bg-surface-container-lowest/50 dark:bg-on-surface/50 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200 gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-surface-container-lowest">Scan History</h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant mt-1">Review diagnostic reports and AI prediction logs.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <SearchInput
              placeholder="Search Reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="glass-panel text-on-surface-variant dark:text-surface-container-lowest font-label-sm text-label-sm px-4 py-2 rounded-full border-none cursor-pointer bg-transparent outline-none"
            >
              <option value="all">All Severities</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-panel text-on-surface-variant dark:text-surface-container-lowest font-label-sm text-label-sm px-4 py-2 rounded-full border-none cursor-pointer bg-transparent outline-none"
            >
              <option value="date_desc">Newest Date</option>
              <option value="date_asc">Oldest Date</option>
              <option value="confidence_desc">Highest Confidence</option>
              <option value="confidence_asc">Lowest Confidence</option>
            </select>
          </div>
        </header>

        {/* Reports log list body */}
        <div className="flex-1 overflow-y-auto p-container-padding">
          {isLoading ? (
            /* Premium Loading skeletons grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter max-w-7xl mx-auto">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="glass-panel rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none z-10"></div>
                  <div className="w-full h-48 bg-surface-container-high dark:bg-surface-variant rounded-lg animate-pulse flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline-variant text-[48px] animate-pulse">memory</span>
                  </div>
                  <div className="h-6 bg-surface-container-high dark:bg-surface-variant rounded w-2/3 animate-pulse mt-2"></div>
                  <div className="h-4 bg-surface-container-high dark:bg-surface-variant rounded w-1/2 animate-pulse"></div>
                  <div className="h-8 bg-surface-container-high dark:bg-surface-variant rounded w-full animate-pulse mt-4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state illustration and retry button */
            <div className="max-w-3xl mx-auto mt-stack-lg p-stack-lg glass-panel rounded-2xl flex flex-col items-center justify-center text-center border-dashed border-2 border-error/40 dark:border-error/20 animate-fade">
              <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-error-container/20 border border-error/30 text-error">
                <span className="material-symbols-outlined text-5xl">warning</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface dark:text-surface-container-lowest tracking-tight mb-2">Failed to Load Scan History</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant max-w-md mx-auto mb-stack-md">
                {error}
              </p>
              <button 
                onClick={fetchReports}
                className="bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[20px]">sync</span>
                Retry Loading
              </button>
            </div>
          ) : processedReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter pb-stack-lg max-w-7xl mx-auto">
              {processedReports.map((report) => (
                <article key={report.id} className="glass-panel rounded-xl p-4 flex flex-col gap-3 shadow-md hover:shadow-lg transition-all duration-300 relative group overflow-hidden">
                  {/* MRI Scan preview */}
                  <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden border border-outline-variant/30 group-hover:scale-[1.02] transition-transform duration-500 ease-out">
                    <img className="object-cover w-full h-full opacity-90 mix-blend-screen" src={report.imageUrl} alt="mri thumbnail" />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-surface-container-lowest/80 dark:bg-on-surface/80 backdrop-blur-md rounded font-label-sm text-label-sm text-on-surface dark:text-surface flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">neurology</span> {report.scanType}
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-surface-container-lowest/80 dark:bg-on-surface/80 backdrop-blur-md rounded font-label-sm text-label-sm text-on-surface dark:text-surface flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span> {report.date}
                    </div>
                  </div>

                  {/* report info row */}
                  <div className="flex justify-between items-start mt-2 px-1">
                    <div>
                      <h3 className="font-title-md text-title-md text-on-surface dark:text-surface-container-lowest tracking-tight">
                        {report.patientId}
                      </h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-outline-variant mt-0.5">
                        {report.prediction}
                      </p>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded font-label-sm text-label-sm border ${getSeverityColor(report.severity)}`}>
                      {report.severity}
                    </span>
                  </div>

                  {/* Confidence progress */}
                  <div className="flex flex-col gap-1.5 mt-2 px-1">
                    <div className="flex justify-between items-baseline font-label-sm text-label-sm">
                      <span className="text-on-surface-variant dark:text-outline-variant">Confidence Score</span>
                      <span className="font-bold text-sm text-on-surface dark:text-surface">{report.confidence}%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest dark:bg-surface-variant rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${report.status === 'critical' ? 'bg-error dark:bg-error-container' : 'bg-[#10b981]'}`}
                        style={{ width: `${report.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 px-1">
                    <Link
                      to={`/report/${report.id}`}
                      className="flex-grow bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 border-none cursor-pointer font-bold no-underline"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span> View Report
                    </Link>
                    <button
                      onClick={(e) => handleDownload(report.id, e)}
                      aria-label="Download Report"
                      className="px-3.5 glass-panel text-primary dark:text-primary-fixed-dim font-label-sm text-label-sm rounded-lg hover:bg-primary/5 dark:hover:bg-primary/20 transition-colors flex items-center justify-center border-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">download</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State Section */
            <div className="max-w-3xl mx-auto mt-stack-lg p-stack-lg glass-panel rounded-2xl flex flex-col items-center justify-center text-center border-dashed border-2 border-outline-variant/40 dark:border-outline-variant/20 animate-fade">
              <div className="w-48 h-48 mb-6 relative">
                <img 
                  className="object-contain w-full h-full drop-shadow-xl" 
                  alt="Empty logs illustration" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI04URMrTnTiw91weOd6CWVbnfODG7UaOmluh_1jjQFtEUJDzHLg8nj2dZxSzC6b7WOWC4zYt9DBXq2zW_1NuhTb0WF5vDrTuTg-NDDgTyYItD0OCBG3x4jUqh3uaXY1GBzNdIom4oB6ONzG7imkMyGS7xBH_BNevFkpBsdKhWNdNMLswl9XJmPAizGZmpMw0Rh9Pw9p20hg6P6FqXArK_oylO4FKvP0lu1npTnp6k7mTdaM9HwGKE"
                />
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface dark:text-surface-container-lowest tracking-tight mb-2">No scan history found</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant max-w-md mx-auto mb-stack-md">
                No diagnostic history matches your selection. Try uploading a new scan or adjusting your search filters.
              </p>
              <Link 
                to="/upload"
                className="bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer no-underline font-bold"
              >
                <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                Upload a New Scan
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
