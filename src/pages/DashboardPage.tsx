import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { reportsService, type ReportLog } from '../services/reports';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [anomalyCount, setAnomalyCount] = useState<number>(0);
  const [recentReports, setRecentReports] = useState<ReportLog[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await reportsService.getReports();
        setReportsCount(data.length);
        setAnomalyCount(data.filter((r) => r.status === 'critical').length);
        setRecentReports(data.slice(0, 2));
      } catch (err) {
        console.error('Failed to load dashboard report statistics:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex font-body-md antialiased overflow-hidden bg-background dark:bg-inverse-surface transition-colors duration-200">
      <Sidebar />

      {/* Main Content Canvas */}
      <main className="ml-[280px] flex-1 flex flex-col h-screen relative bg-surface-bright dark:bg-inverse-surface transition-colors duration-200 p-container-padding overflow-y-auto">
        <header className="mb-stack-md pt-4">
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-surface-container-lowest">
            Welcome back, {user?.name || 'Patient'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant mt-1">
            Access your secure AI neuro-diagnostic portal and scan history.
          </p>
        </header>

        {/* Statistics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg max-w-7xl">
          <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary dark:text-inverse-primary shrink-0">
              <span className="material-symbols-outlined text-[28px]">folder_open</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface dark:text-surface">{reportsCount}</h3>
              <p className="text-sm text-on-surface-variant dark:text-outline">Total Scans Analyzed</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center text-error shrink-0">
              <span className="material-symbols-outlined text-[28px]">report</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface dark:text-surface">{anomalyCount}</h3>
              <p className="text-sm text-on-surface-variant dark:text-outline">Anomalies Detected</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#10b981]/15 flex items-center justify-center text-[#10b981] shrink-0">
              <span className="material-symbols-outlined text-[28px]">health_and_safety</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface dark:text-surface">
                {reportsCount > 0 ? `${Math.round(((reportsCount - anomalyCount) / reportsCount) * 100)}%` : '100%'}
              </h3>
              <p className="text-sm text-on-surface-variant dark:text-outline">Normal Ratio</p>
            </div>
          </div>
        </section>

        {/* Action Blocks */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-stack-md max-w-7xl mb-stack-lg">
          <div className="glass-panel p-6 rounded-xl flex flex-col items-start gap-4">
            <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
            <h3 className="font-title-md text-title-md text-on-surface dark:text-slate-100">Upload New MRI Scan</h3>
            <p className="text-sm text-on-surface-variant dark:text-slate-300">
              Upload a new high-resolution T1-weighted or T2-weighted brain scan for tumor segmentation and severity analysis.
            </p>
            <Link
              to="/upload"
              className="gradient-bg text-white font-label-sm text-label-sm px-6 py-3 rounded-lg shadow-md hover:brightness-110 hover:-translate-y-0.5 active:scale-95 transition-all no-underline font-bold"
            >
              Analyze MRI
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-xl flex flex-col items-start gap-4">
            <span className="material-symbols-outlined text-secondary text-4xl">history</span>
            <h3 className="font-title-md text-title-md text-on-surface dark:text-slate-100">Patient History Log</h3>
            <p className="text-sm text-on-surface-variant dark:text-slate-300">
              Review and download past MRI report logs, GNN prediction confidence scores, and segmentation visualization layers.
            </p>
            <Link
              to="/reports"
              className="glass-panel text-primary dark:text-inverse-primary font-label-sm text-label-sm px-6 py-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all no-underline font-bold"
            >
              View Reports Log
            </Link>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="max-w-7xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-title-md text-title-md text-on-surface dark:text-surface">Recent Reports</h2>
            <Link to="/reports" className="text-primary hover:underline text-sm font-semibold no-underline">
              View All
            </Link>
          </div>

          {recentReports.length > 0 ? (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="glass-panel p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-black rounded overflow-hidden border border-outline-variant/30 shrink-0">
                      <img src={report.imageUrl} alt="mri thumbnail" className="w-full h-full object-cover mix-blend-screen" />
                    </div>
                    <div>
                      <h4 className="font-title-md text-sm text-on-surface dark:text-surface">{report.patientId}</h4>
                      <p className="text-xs text-on-surface-variant dark:text-outline">{report.scanType} • {report.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-on-surface-variant dark:text-outline text-right">Confidence</p>
                      <p className="text-sm font-bold text-on-surface dark:text-surface">{report.confidence}%</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      report.status === 'critical' 
                        ? 'bg-error/10 border-error/20 text-error' 
                        : 'bg-[#10b981]/10 border-[#10b981]/20 text-[#059669]'
                    }`}>
                      {report.severity}
                    </span>
                    <Link to={`/report/${report.id}`} className="text-primary hover:text-secondary transition-colors font-bold text-sm no-underline">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 text-center rounded-xl text-on-surface-variant">
              No reports available.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
