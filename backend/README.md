# BrainAI Patient Portal Backend

FastAPI server for brain MRI segmentation and GNN-based severity prediction.

## Directory Structure

```
backend/
├── app/
│   ├── main.py              # Entry point & startup model pre-loaders
│   ├── config.py            # Settings config (.env reader)
│   ├── dependencies.py      # Current user auth dependencies
│   ├── api/                 # API routers
│   │   ├── auth.py
│   │   ├── predict.py
│   │   ├── reports.py
│   │   ├── profile.py
│   │   └── health.py
│   ├── services/            # Notebook ML integration points
│   │   ├── preprocessing.py # Image resizing & normalization
│   │   ├── segmentation.py  # best_unet3d.pth UNet runner
│   │   ├── graph_builder.py # Topological graphs constructor
│   │   ├── severity.py      # best_gat.pth GNN inference
│   │   └── recommendation.py# Diagnostic recommendations mapper
│   ├── database/
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   └── utils/
│       ├── image_utils.py
│       └── security.py
├── uploads/                 # Storage for uploaded MRIs
├── segmented/               # Storage for segmented output masks
├── reports/                 # Stored reports
├── models/                  # Place best_unet3d.pth and best_gat.pth here
├── requirements.txt
├── .env
└── README.md
```

## Setup & Execution

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server using Uvicorn:
   ```bash
   uvicorn app.main:app --reload
   ```

## Model Integration Guide

### UNet Segmentation (`app/services/segmentation.py`)
Paste your 3D UNet model definition class.
Inside `load_segmentation_model()`, initialize the class and load the `best_unet3d.pth` state dict:
```python
model = UNet3D()
model.load_state_dict(torch.load(model_path, map_location='cpu'))
```

### Graph Construction (`app/services/graph_builder.py`)
Extract the contours or superpixels from the UNet output and convert them to nodes and edges:
```python
# Convert mask array to graph node coordinates
```

### GAT Severity Prediction (`app/services/severity.py`)
Paste your Graph Attention Network architecture class.
Inside `load_gnn_model()`, initialize and load the `best_gat.pth` state dict.
Run prediction inside `predict_severity()`:
```python
logits = gnn_model(graph_data.x, graph_data.edge_index)
```
