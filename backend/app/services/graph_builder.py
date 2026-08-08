import numpy as np
import torch
from scipy.stats import entropy as scipy_entropy
from skimage.segmentation import slic
from sklearn.neighbors import NearestNeighbors
from torch_geometric.data import Data

VOLUME_SHAPE = (96, 96, 96)

def generate_supervoxels(intensity_vol: np.ndarray, n_segments: int = 200, compactness: float = 0.1) -> np.ndarray:
    """
    Constructs supervoxels using SLIC segmentation algorithm exactly as in the notebook.
    """
    vol_norm = (intensity_vol - intensity_vol.min()) / (intensity_vol.max() - intensity_vol.min() + 1e-8)
    # SLIC requires channel_axis=None for 3D single channel volumes
    return slic(vol_norm, n_segments=n_segments, compactness=compactness, channel_axis=None, start_label=0)

def build_node_features(image_4ch: np.ndarray, seg_mask: np.ndarray, supervoxels: np.ndarray, volume_shape=VOLUME_SHAPE) -> tuple:
    """
    Computes GNN node features and coords exactly matching notebook dimensions.
    Node features dimension = 13:
    - 4 modalities * 2 values (mean, std) = 8
    - tumor probability = 1
    - texture entropy = 1
    - normalized centroid (X, Y, Z) = 3
    """
    unique_ids = np.unique(supervoxels)
    node_features = []
    node_coords = []
    
    for sid in unique_ids:
        region_mask = supervoxels == sid
        if region_mask.sum() == 0:
            continue
            
        coords = np.argwhere(region_mask)
        centroid = coords.mean(axis=0)
        feats = []
        
        # 1. Mean and Std for all 4 channels
        for ch in range(image_4ch.shape[0]):
            vals = image_4ch[ch][region_mask]
            feats.extend([float(vals.mean()), float(vals.std())])
            
        # 2. Tumor probability
        tumor_prob = float((seg_mask[region_mask] > 0).mean())
        
        # 3. Texture entropy
        hist, _ = np.histogram(image_4ch[1][region_mask], bins=8, density=True)
        hist = hist[hist > 0]
        tex_entropy = float(scipy_entropy(hist) if len(hist) > 0 else 0.0)
        feats.extend([tumor_prob, tex_entropy])
        
        # 4. Normalized centroid coordinates
        norm_centroid = centroid / np.array(volume_shape)
        feats.extend(norm_centroid.tolist())
        
        node_features.append(feats)
        node_coords.append(centroid)
        
    return np.array(node_features, dtype=np.float32), np.array(node_coords, dtype=np.float32), unique_ids

def build_edges(node_coords: np.ndarray, node_features: np.ndarray, k: int = 6) -> tuple:
    """
    Constructs GNN edge indices and weights exactly as in the notebook.
    """
    if len(node_coords) == 0:
        return np.empty((2, 0), dtype=np.int64), np.empty((0, 1), dtype=np.float32)
        
    n_neighbors = min(k + 1, len(node_coords))
    nbrs = NearestNeighbors(n_neighbors=n_neighbors).fit(node_coords)
    distances, indices = nbrs.kneighbors(node_coords)
    edge_index, edge_attr = [], []
    
    for i in range(len(node_coords)):
        for j_idx in range(1, indices.shape[1]):
            j = indices[i, j_idx]
            dist = distances[i, j_idx]
            feat_sim = 1.0 / (1.0 + np.linalg.norm(node_features[i] - node_features[j]))
            weight = feat_sim / (1.0 + dist)
            edge_index.append([i, j])
            edge_index.append([j, i])
            edge_attr.append([weight])
            edge_attr.append([weight])
            
    if len(edge_index) == 0:
        return np.empty((2, 0), dtype=np.int64), np.empty((0, 1), dtype=np.float32)
        
    return np.array(edge_index).T, np.array(edge_attr, dtype=np.float32)

def build_graph(image_tensor: torch.Tensor, seg_mask: np.ndarray, n_segments: int = 200) -> Data:
    """
    Builds the PyTorch Geometric Data object from preprocessed image tensor and segmentation mask.
    """
    image_np = image_tensor.numpy()
    
    # Generate supervoxels based on Channel 1 (t1ce modality slice) as in the notebook
    supervoxels = generate_supervoxels(image_np[1], n_segments=n_segments)
    
    # Construct node features and centroids
    node_features, node_coords, _ = build_node_features(image_np, seg_mask, supervoxels)
    
    # Construct spatial similarity edges
    edge_index, edge_attr = build_edges(node_coords, node_features)
    
    # Wrap in PyTorch Geometric Data structure
    graph = Data(
        x=torch.tensor(node_features, dtype=torch.float),
        edge_index=torch.tensor(edge_index, dtype=torch.long),
        edge_attr=torch.tensor(edge_attr, dtype=torch.float),
        pos=torch.tensor(node_coords, dtype=torch.float)
    )
    
    return graph
