# 🧠 3D Medical Tumour Detection

A full-stack medical tumour detection and analysis application using a **React + TypeScript frontend** and a **Python FastAPI backend**, with machine learning and deep learning components for **3D MRI analysis**.

The application supports MRI upload, preprocessing, tumour segmentation, graph-based analysis, severity prediction, recommendations, reporting, and user authentication.

---

## 🌐 Live Deployment

### Frontend — Vercel
**Live App:**  
https://medical-tumour-detection-3-d.vercel.app

### Backend — Render
**API:**  
https://medical-tumour-detection-3d.onrender.com

### API Health
https://medical-tumour-detection-3d.onrender.com/api/health

### API Documentation
https://medical-tumour-detection-3d.onrender.com/docs

---

## ✨ Features

- 🧠 3D MRI tumour analysis
- 📤 MRI scan upload and validation
- 🔬 Medical image preprocessing
- 🧩 3D UNet tumour segmentation
- 🕸️ Graph-based feature extraction
- 🤖 Graph Attention Network (GAT)
- 📊 Tumour severity prediction
- 💡 Recommendation generation
- 📄 Analysis report generation
- 🔐 User registration and authentication
- 👤 User profile management
- 📋 Report/history management
- 🌐 Vercel + Render production deployment
- 🔗 REST API communication over HTTPS

## 🏗️ Architecture

```text
User
  │
  ▼
React + TypeScript + Vite
  │
  │ HTTPS / REST API
  ▼
FastAPI Backend
  │
  ├── Authentication
  │
  ├── Profiles
  │
  ├── Reports
  │
  └── Prediction
       │
       ▼
  MRI Preprocessing
       │
       ▼
  3D UNet Segmentation
       │
       ▼
  Graph Construction
       │
       ▼
  Graph Attention Network
       │
       ▼
  Severity Prediction
       │
       ▼
  Recommendation Generation
       │
       ▼
  Report Generation
```
## 🔬 Machine Learning Pipeline
```text
MRI Input
   │
   ▼
Image Validation
   │
   ▼
3D MRI Preprocessing
   │
   ▼
3D UNet Segmentation
   │
   ▼
Tumour / Region Mask
   │
   ▼
Supervoxel & Feature Extraction
   │
   ▼
Graph Construction
   │
   ▼
Graph Attention Network (GAT)
   │
   ▼
Severity Prediction
   │
   ▼
Recommendation Generation
   │
   ▼
Analysis Report

```

The ML pipeline uses **PyTorch, MONAI, PyTorch Geometric, NumPy, SciPy, scikit-image, scikit-learn, NiBabel, pydicom, and Pillow**.



## 📁 Project Structure
```text
Medical_Tumour_Detection_3D/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── health.py
│   │   │   ├── predict.py
│   │   │   ├── profile.py
│   │   │   └── reports.py
│   │   │
│   │   ├── database/
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   └── schemas.py
│   │   │
│   │   ├── services/
│   │   │   ├── preprocessing.py
│   │   │   ├── segmentation.py
│   │   │   ├── graph_builder.py
│   │   │   ├── severity.py
│   │   │   ├── recommendation.py
│   │   │   └── report_generator.py
│   │   │
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── public/
│
├── src/
│   ├── assets/
│   │   └── hero.png
│   │
│   ├── components/
│   │
│   ├── pages/
│   │
│   ├── services/
│   │   ├── api.ts
│   │   └── auth.ts
│   │
│   └── ...
│
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```
## 🚀 Getting Started

### 1. Clone the Repository

1. git clone https://github.com/Pranjal-Seluriyal/Medical_Tumour_Detection_3D.git
2. cd Medical_Tumour_Detection_3D

### 2. Frontend Setup

1. npm install
2. npm run dev

Frontend runs locally at: `http://localhost:5173`

For a production build:
1. npm run build

### 3. Backend Setup

1. cd backend
2. python -m venv venv

#### Windows Activation
1. venv\Scripts\activate

#### Linux/macOS Activation
1. source venv/bin/activate

#### Install Dependencies & Run
1. pip install -r requirements.txt
2. uvicorn app.main:app --reload

Backend runs locally at: `http://localhost:8000`

---

## 🔗 Environment Variables

### Local Development (.env)
1. VITE_API_URL=http://localhost:8000
2. VITE_USE_MOCK=false

### Production (.env)
1. VITE_API_URL=https://medical-tumour-detection-3d.onrender.com
2. VITE_USE_MOCK=false

The frontend automatically adds the `/api` prefix.

Example route resolution:
VITE_API_URL → https://medical-tumour-detection-3d.onrender.com/api → POST /auth/register → /api/auth/register

---

## ☁️ Deployment

### Frontend — Vercel
1. Framework: Vite
2. Root Directory: ./
3. Build Command: npm run build
4. Environment Variables:
   - VITE_USE_MOCK=false
   - VITE_API_URL=https://medical-tumour-detection-3d.onrender.com

### Backend — Render
1. Runtime: Python 3
2. Python Version: 3.11.11
3. Root Directory: backend
4. Build Command: pip install -r requirements.txt
5. Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT

---

## 📡 API

All backend routes use the `/api` prefix.

1. GET  /api/health
2. POST /api/auth/register
3. POST /api/auth/login
4. GET  /api/profile/...
5. POST /api/predict/...
6. GET  /api/reports/...

Interactive API documentation:
https://medical-tumour-detection-3d.onrender.com/docs

---

## 🧠 Model Weights

The application is configured to use trained model weights such as:
1. backend/models/best_unet3d.pth
2. backend/models/best_gat.pth

These `.pth` files are excluded from Git because trained model weights can be large.

When the trained weights are unavailable, the backend contains fallback behavior so that the application can still start and the processing pipeline can be tested.

> **Note:** Fallback output is not equivalent to inference using trained model weights and should not be considered clinically validated.

---

## ⚠️ Performance Considerations

The backend uses memory-intensive 3D machine-learning libraries including:
- PyTorch
- MONAI
- PyTorch Geometric
- SciPy
- scikit-image
- scikit-learn

3D MRI inference can require significant memory. The current Render deployment uses a limited-memory instance, so heavy inference workloads may require a larger-memory deployment or a separate inference service.

---

## 🧪 Testing

### 1. Frontend Build Check
1. npm run build

### 2. Backend Health Check
1. curl https://medical-tumour-detection-3d.onrender.com/api/health

Expected response:
{"status": "online"}

### 3. API Documentation
- Local: http://localhost:8000/docs
- Production: https://medical-tumour-detection-3d.onrender.com/docs

---

## 🔐 Security

- Never commit passwords, API keys, database credentials, or private keys.
- Store sensitive backend configuration in environment variables.
- `VITE_*` variables are exposed to the browser and must not contain secrets.
- Use HTTPS for production communication.
- Keep authentication credentials secure.

---

## 👥 Collaboration Guide

This project is maintained using Git and GitHub.

### ⚠️ Important
The `main` branch contains the current working version of the project.
> **Do NOT directly modify or push to `main`.**

Every contributor should create their own branch before making changes.

### Git Workflow Steps
1. Create a branch: git checkout -b feature/your-feature-name
2. Check status: git status
3. View differences: git diff
4. Stage changes: git add .
5. Commit changes: git commit -m "Describe your changes"
6. Push branch: git push -u origin feature/your-feature-name
7. Create a Pull Request on GitHub.

---

## 🩺 Medical Disclaimer

This project is intended for **educational, research, and demonstration purposes**.

It is not a substitute for professional medical diagnosis, clinical evaluation, or treatment. Results generated by the application should not be used as the sole basis for medical decisions.

---

## 🚧 Project Status

| Component                | Status                                             |
| ------------------------ | -------------------------------------------------- |
| React/Vite Frontend      | ✅ Live                                             |
| Vercel Deployment        | ✅ Live                                             |
| FastAPI Backend          | ✅ Live                                             |
| Render Deployment        | ✅ Live                                             |
| HTTPS Frontend → Backend | ✅ Configured                                       |
| CORS                     | ✅ Configured                                       |
| Authentication API       | ✅ Connected                                        |
| PyTorch / MONAI / PyG    | ✅ Configured                                       |
| 3D ML Pipeline           | ✅ Implemented                                      |
| Trained Model Weights    | ⚠️ Not stored in Git                               |
| Production ML Inference  | ⚠️ Requires trained weights and further validation |

---

## 🔮 Future Improvements

- Add secure storage and deployment of trained model weights.
- Optimize 3D inference memory usage.
- Improve inference performance.
- Add GPU-based inference.
- Add richer 3D MRI visualization.
- Add slice-by-slice tumour visualization.
- Improve model evaluation and validation.
- Expand automated testing.
- Add production monitoring and logging.
- Improve report generation and visualization.

---

## 👨‍💻 Author

**Pranjal Seluriyal**

- GitHub: https://github.com/Pranjal-Seluriyal
- Repository: https://github.com/Pranjal-Seluriyal/Medical_Tumour_Detection_3D

---

