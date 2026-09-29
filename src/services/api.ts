import axios from 'axios';

export const USE_MOCK = (import.meta as any).env.VITE_USE_MOCK === 'true';
export const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

if (USE_MOCK) {
  api.interceptors.request.use((config) => {
    const { url, method, data } = config;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // HEALTH CHECK
        if (url?.endsWith('/health') && method === 'get') {
          resolve({
            data: { status: 'online' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          } as any);
          return;
        }

        // AUTH LOGIN
        if (url?.endsWith('/auth/login') && method === 'post') {
          const body = typeof data === 'string' ? JSON.parse(data) : data;
          if (body.email && body.password) {
            const mockToken = 'mock_jwt_token';
            const nameFromEmail = body.email.split('@')[0];
            const name = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
            resolve({
              data: {
                token: mockToken,
                user: {
                  id: 'pat-1092',
                  email: body.email,
                  name: name,
                  age: 34,
                  gender: 'Female',
                  phone: '+1 (555) 019-2831'
                }
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config
            } as any);
          } else {
            reject({ response: { status: 400, data: { detail: 'Missing credentials' } } });
          }
        }
        
        // AUTH REGISTER
        else if (url?.endsWith('/auth/register') && method === 'post') {
          const body = typeof data === 'string' ? JSON.parse(data) : data;
          if (body.email && body.password && body.name) {
            resolve({
              data: {
                token: 'mock_jwt_token',
                user: {
                  id: 'pat-1092',
                  email: body.email,
                  name: body.name,
                  age: 30,
                  gender: 'Male',
                  phone: '+1 (555) 019-1234'
                }
              },
              status: 201,
              statusText: 'Created',
              headers: {},
              config
            } as any);
          } else {
            reject({ response: { status: 400, data: { detail: 'Missing fields' } } });
          }
        }

        // PREDICT
        else if (url?.endsWith('/predict') && method === 'post') {
          let isNormal = false;
          if (data instanceof FormData) {
            const file = data.get('file') as File;
            if (file && file.name.toLowerCase().includes('normal')) {
              isNormal = true;
            }
          }

          const currentDateString = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const mockResult = isNormal ? {
            prediction: "No Tumor Detected",
            confidence: 99.1,
            severity: "Low" as const,
            ai_summary: "The uploaded MRI scan was analyzed by the BrainAI system. No anomalous regions or signs of tumor tissue were detected in the cerebral hemispheres. The estimated severity is Low.",
            recommendation: "The detected tumor characteristics indicate a lower severity level. Continue consulting your neurologist for further evaluation and periodic monitoring.",
            next_steps: "Continue consulting your neurologist for periodic monitoring and routine checkups. Maintain standard diagnostic schedules.",
            segmentation_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTiHU63s8UdMUfzwpv29DnZIAX2WwJJv4OCGo_1aEoPZc1zptHs1bfpFHxSqYXeJiKmoIIzXKbWhTB0OPY8Hd_vMTrnTEu5HHaJtmMRvtmzluCBcMPZhT-rhXTU-QCQxA9OxmgCzeVLk3QO00SLOqKMQBMcDm4RM1WPT1v6dk4hP-bSmGy1ETUxSX5ZM71QNDojbD_nwMWI7D98WJyyMb3WqeIITKSYRsy468R0ht5iUDXaBO2cQNI",
            original_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7-jy7VHEQR59IZGWDKgZghMxkhZsJEP6m4NZusz5jOB9M9NRG3vvZjQo2x2STpKyeT7COnplsuJcrBxFDebK8ZrBTjitID1916VCWebqbsJNyGowVPAo8ELM6xUiuEDjBd_be3lp2O2PWV0NgI8ebfK7tbpLmoSeYm_VDZMxKTlHuDQEYstVLA63pjssTRD9Q4qMgZOmnaXRNRBFr_PbeHQSCvwB3_z9JwtcIQiI4QOPaKB0gI6Oi",
            processing_time: 1.34,
            report_id: Math.floor(10 + Math.random() * 990),
            analysis_date: currentDateString
          } : {
            prediction: "Tumor Detected",
            confidence: 96.4,
            severity: "Moderate" as const,
            ai_summary: "The uploaded MRI was analyzed by the BrainAI system. A region consistent with a tumor was identified and segmented. The estimated severity is Moderate.",
            recommendation: "The AI detected imaging characteristics associated with moderate severity. Please schedule an appointment with a neurologist or neurosurgeon for further evaluation.",
            next_steps: "Please consult a neurologist or radiologist for professional evaluation. This AI analysis is intended to support—not replace—a medical diagnosis.",
            segmentation_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkXB8J_NRrhQk_T0Ubo87hUNrpExLcveJoQAsQYIUIxJFUw1-_K762VURf5MZCPwjIvJSEfxJZAMuL5uq4gX1RCnNxeCeao7P1kMcDSca_CmpForN3hpUfYFyurP_GlKLvjB5vCveeUMC1OG0ExIBIEJyHyauW-ASMsB_yw3ic-ioPDJiOtr0v-yjFxmaNPhEB10RSyRXZqRSBAIHb2ohf9AZD8KhwhxGTfq_7FwgR4_qEukPle5J9",
            original_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7-jy7VHEQR59IZGWDKgZghMxkhZsJEP6m4NZusz5jOB9M9NRG3vvZjQo2x2STpKyeT7COnplsuJcrBxFDebK8ZrBTjitID1916VCWebqbsJNyGowVPAo8ELM6xUiuEDjBd_be3lp2O2PWV0NgI8ebfK7tbpLmoSeYm_VDZMxKTlHuDQEYstVLA63pjssTRD9Q4qMgZOmnaXRNRBFr_PbeHQSCvwB3_z9JwtcIQiI4QOPaKB0gI6Oi",
            processing_time: 1.48,
            report_id: Math.floor(10 + Math.random() * 990),
            analysis_date: currentDateString
          };

          const savedReports = JSON.parse(localStorage.getItem('mock_reports') || '[]');
          const newReport = {
            id: String(mockResult.report_id),
            patientId: `Patient #88392-A`,
            scanType: 'Sagittal T2',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            confidence: mockResult.confidence,
            status: mockResult.severity.toLowerCase() === 'low' ? 'normal' : 'critical' as const,
            severity: mockResult.severity,
            imageUrl: mockResult.original_image,
            segmentedUrl: mockResult.segmentation_image,
            prediction: mockResult.prediction,
            recommendation: mockResult.recommendation,
            aiSummary: mockResult.ai_summary,
            nextSteps: mockResult.next_steps,
            processingTime: mockResult.processing_time,
            analysisDate: mockResult.analysis_date
          };
          localStorage.setItem('mock_reports', JSON.stringify([newReport, ...savedReports]));

          resolve({
            data: mockResult,
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          } as any);
        }

        // GET REPORTS LOGS
        else if (url?.endsWith('/reports') && method === 'get') {
          if (!localStorage.getItem('mock_reports')) {
            const initialReports = [
              {
                id: '17',
                patientId: 'Patient #88392-A',
                scanType: 'Axial T1-W',
                date: 'Oct 12, 2023',
                confidence: 98.4,
                status: 'critical' as const,
                severity: 'High' as const,
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkXB8J_NRrhQk_T0Ubo87hUNrpExLcveJoQAsQYIUIxJFUw1-_K762VURf5MZCPwjIvJSEfxJZAMuL5uq4gX1RCnNxeCeao7P1kMcDSca_CmpForN3hpUfYFyurP_GlKLvjB5vCveeUMC1OG0ExIBIEJyHyauW-ASMsB_yw3ic-ioPDJiOtr0v-yjFxmaNPhEB10RSyRXZqRSBAIHb2ohf9AZD8KhwhxGTfq_7FwgR4_qEukPle5J9',
                segmentedUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkXB8J_NRrhQk_T0Ubo87hUNrpExLcveJoQAsQYIUIxJFUw1-_K762VURf5MZCPwjIvJSEfxJZAMuL5uq4gX1RCnNxeCeao7P1kMcDSca_CmpForN3hpUfYFyurP_GlKLvjB5vCveeUMC1OG0ExIBIEJyHyauW-ASMsB_yw3ic-ioPDJiOtr0v-yjFxmaNPhEB10RSyRXZqRSBAIHb2ohf9AZD8KhwhxGTfq_7FwgR4_qEukPle5J9',
                prediction: 'Tumor Detected',
                recommendation: 'The AI identified imaging characteristics associated with high severity. Prompt consultation with a specialist is strongly recommended.',
                aiSummary: 'The uploaded MRI was analyzed by the BrainAI system. A region consistent with a tumor was identified and segmented. The estimated severity is High.',
                nextSteps: 'Please consult a neurologist or radiologist for professional evaluation immediately. This AI analysis is intended to support—not replace—a medical diagnosis.',
                processingTime: 1.62,
                analysisDate: 'Oct 12, 2023, 02:32:00 PM'
              },
              {
                id: '24',
                patientId: 'Patient #44102-C',
                scanType: 'Sagittal T2',
                date: 'Oct 10, 2023',
                confidence: 99.1,
                status: 'normal' as const,
                severity: 'Low' as const,
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTiHU63s8UdMUfzwpv29DnZIAX2WwJJv4OCGo_1aEoPZc1zptHs1bfpFHxSqYXeJiKmoIIzXKbWhTB0OPY8Hd_vMTrnTEu5HHaJtmMRvtmzluCBcMPZhT-rhXTU-QCQxA9OxmgCzeVLk3QO00SLOqKMQBMcDm4RM1WPT1v6dk4hP-bSmGy1ETUxSX5ZM71QNDojbD_nwMWI7D98WJyyMb3WqeIITKSYRsy468R0ht5iUDXaBO2cQNI',
                segmentedUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTiHU63s8UdMUfzwpv29DnZIAX2WwJJv4OCGo_1aEoPZc1zptHs1bfpFHxSqYXeJiKmoIIzXKbWhTB0OPY8Hd_vMTrnTEu5HHaJtmMRvtmzluCBcMPZhT-rhXTU-QCQxA9OxmgCzeVLk3QO00SLOqKMQBMcDm4RM1WPT1v6dk4hP-bSmGy1ETUxSX5ZM71QNDojbD_nwMWI7D98WJyyMb3WqeIITKSYRsy468R0ht5iUDXaBO2cQNI',
                prediction: 'No Tumor Detected',
                recommendation: 'The detected tumor characteristics indicate a lower severity level. Continue consulting your neurologist for further evaluation and periodic monitoring.',
                aiSummary: 'The uploaded MRI was analyzed by the BrainAI system. No anomalous regions or signs of tumor tissue were detected in the cerebral hemispheres.',
                nextSteps: 'Continue consulting your neurologist for periodic monitoring and routine checkups.',
                processingTime: 1.15,
                analysisDate: 'Oct 10, 2023, 10:14:00 AM'
              }
            ];
            localStorage.setItem('mock_reports', JSON.stringify(initialReports));
          }
          
          const reportsList = JSON.parse(localStorage.getItem('mock_reports') || '[]');
          resolve({
            data: reportsList,
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          } as any);
        }

        // GET REPORT BY ID
        else if (url?.includes('/reports/') && method === 'get') {
          const reportsList = JSON.parse(localStorage.getItem('mock_reports') || '[]');
          const id = url.split('/').pop();
          const report = reportsList.find((r: any) => r.id === id);
          if (report) {
            resolve({
              data: report,
              status: 200,
              statusText: 'OK',
              headers: {},
              config
            } as any);
          } else {
            reject({ response: { status: 404, data: { detail: 'Report not found' } } });
          }
        }

        // GET PATIENT PROFILE
        else if (url?.endsWith('/profile') && method === 'get') {
          const userEmail = localStorage.getItem('userEmail') || 'patient@hospital.com';
          const userName = localStorage.getItem('userName') || 'Sterling';
          resolve({
            data: {
              id: 'pat-1092',
              email: userEmail,
              name: userName,
              age: 34,
              gender: 'Female',
              phone: '+1 (555) 019-2831'
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          } as any);
        }

        // UPDATE PATIENT PROFILE
        else if (url?.endsWith('/profile') && method === 'put') {
          const body = typeof data === 'string' ? JSON.parse(data) : data;
          if (body.name) localStorage.setItem('userName', body.name);
          if (body.email) localStorage.setItem('userEmail', body.email);
          resolve({
            data: body,
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          } as any);
        }
        
        else {
          resolve({
            data: {},
            status: 404,
            statusText: 'Not Found',
            headers: {},
            config
          } as any);
        }
      }, 500);
    });
  });
}

export default api;
