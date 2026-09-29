import api, { API_BASE_URL } from './api';

export interface ReportLog {
  id: string;
  patientId: string;
  scanType: string;
  date: string;
  confidence: number;
  status: 'critical' | 'normal';
  severity: 'Low' | 'Moderate' | 'High';
  imageUrl: string;
  segmentedUrl: string;
  prediction: string;
  recommendation: string;
  aiSummary?: string;
  nextSteps?: string;
  processingTime?: number;
  analysisDate?: string;
}
const mapReport = (data: any): ReportLog => {
  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
    return `${baseUrl}${url}`;
  };
  return {
    id: String(data.id),
    patientId: data.patientId || (data.patient_id ? `Patient #${data.patient_id}` : 'Patient #Unknown'),
    scanType: data.scanType || 'MRI Brain Scan',
    date: data.date || data.analysis_date || (data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''),
    confidence: typeof data.confidence === 'number' ? data.confidence : parseFloat(data.confidence || '0'),
    status: data.status || (data.severity === 'High' ? 'critical' : 'normal'),
    severity: data.severity || 'Low',
    imageUrl: getFullUrl(data.imageUrl || data.original_image || ''),
    segmentedUrl: getFullUrl(data.segmentedUrl || data.segmentation_image || ''),
    prediction: data.prediction || 'Unknown',
    recommendation: data.recommendation || '',
    aiSummary: data.aiSummary || data.ai_summary || '',
    nextSteps: data.nextSteps || data.next_steps || '',
    processingTime: data.processingTime || data.processing_time || 0,
    analysisDate: data.analysisDate || data.analysis_date || ''
  };
};

export const reportsService = {
  async getReports(): Promise<ReportLog[]> {
    const res = await api.get<any[]>('/reports');
    return Array.isArray(res.data) ? res.data.map(mapReport) : [];
  },

  async getReportById(id: string): Promise<ReportLog> {
    const res = await api.get<any>(`/reports/${id}`);
    return mapReport(res.data);
  },

  async saveReport(report: Partial<ReportLog>): Promise<ReportLog> {
    const res = await api.post<any>('/reports', report);
    return mapReport(res.data);
  }
};
