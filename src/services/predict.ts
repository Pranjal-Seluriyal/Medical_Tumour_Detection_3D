import api from './api';

export interface PredictResponse {
  prediction: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High";
  ai_summary?: string;
  recommendation?: string;
  next_steps?: string;
  segmentation_image?: string;
  original_image?: string;
  processing_time?: number;
  report_id?: number;
  analysis_date?: string;
}

export const predictService = {
  async predictMRI(file: File): Promise<PredictResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await api.post<PredictResponse>('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async predictMultiMRI(t1: File, t1ce: File, t2: File, flair: File): Promise<PredictResponse> {
    const formData = new FormData();
    formData.append('t1', t1);
    formData.append('t1ce', t1ce);
    formData.append('t2', t2);
    formData.append('flair', flair);
    
    const res = await api.post<PredictResponse>('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await api.get<{ status: string }>('/health');
      return res.data?.status === 'online';
    } catch (err) {
      return false;
    }
  }
};
