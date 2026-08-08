import os
import torch
from typing import Union
from monai.transforms import (
    Compose, LoadImaged, EnsureChannelFirstd, Orientationd,
    Spacingd, NormalizeIntensityd, CropForegroundd,
    Resized, ConcatItemsd, ToTensord
)

TARGET_SIZE = (96, 96, 96)
IMG_KEYS = ["t1", "t1ce", "t2", "flair"]

# Define the exact preprocess pipeline from the notebook
preprocess_healthy = Compose([
    LoadImaged(keys=IMG_KEYS),
    EnsureChannelFirstd(keys=IMG_KEYS),
    Orientationd(keys=IMG_KEYS, axcodes="RAS", labels=(('L','R'),('P','A'),('I','S'))),
    Spacingd(keys=IMG_KEYS, pixdim=(1.5, 1.5, 1.5), mode="bilinear"),
    CropForegroundd(keys=IMG_KEYS, source_key="t1"),
    Resized(keys=IMG_KEYS, spatial_size=TARGET_SIZE, mode="trilinear"),
    NormalizeIntensityd(keys=IMG_KEYS, nonzero=True, channel_wise=True),
    ConcatItemsd(keys=IMG_KEYS, name="image"),
    ToTensord(keys=["image"]),
])

def preprocess_image(file_path: Union[str, dict]):
    """
    Preprocesses the uploaded file to match the model input shape (4, 96, 96, 96).
    - If the input is a dictionary containing t1, t1ce, t2, and flair paths,
      runs the MONAI preprocessing transforms exactly as in the notebook.
    - If the input is a preprocessed `.pt` file, loads it directly.
    - If it is a single NIfTI volume (.nii or .nii.gz), replicates it across the 4 modalities 
      (t1, t1ce, t2, flair) and runs the MONAI preprocessing transforms.
    - If it is a standard image (.png, .jpg, .jpeg, .gif) or DICOM (.dcm, .dicom),
      resizes, normalizes, and stacks it along the depth dimension to create a 3D volume,
      and replicates it to a 4-channel tensor.
    """
    if isinstance(file_path, dict):
        import monai
        import traceback
        
        logs = []
        def log(msg):
            logs.append(str(msg))
            print(msg)
            
        log("\n=== Preprocessing Multi-modal NIfTI Scan Debug Instrumentation ===")
        log(f"MONAI Version: {monai.__version__}")
        log(f"File Paths: {file_path}")
        for k in IMG_KEYS:
            path = file_path.get(k)
            log(f"File '{k}' Exists: {os.path.exists(path)}")
            if os.path.exists(path):
                log(f"File '{k}' Size (Bytes): {os.path.getsize(path)}")
                
        # Verify nibabel loading
        import nibabel as nib
        for k in IMG_KEYS:
            path = file_path.get(k)
            try:
                nib_img = nib.load(path)
                log(f"Modality {k} Nibabel loaded successfully! Shape: {nib_img.shape}")
            except Exception as nib_err:
                log(f"Modality {k} Nibabel load FAILED:")
                log(traceback.format_exc())
                
        # Transform list
        transforms_list = [
            ("LoadImaged", LoadImaged(keys=IMG_KEYS)),
            ("EnsureChannelFirstd", EnsureChannelFirstd(keys=IMG_KEYS)),
            ("Orientationd", Orientationd(keys=IMG_KEYS, axcodes="RAS", labels=(('L','R'),('P','A'),('I','S')))),
            ("Spacingd", Spacingd(keys=IMG_KEYS, pixdim=(1.5, 1.5, 1.5), mode="bilinear")),
            ("CropForegroundd", CropForegroundd(keys=IMG_KEYS, source_key="t1")),
            ("Resized", Resized(keys=IMG_KEYS, spatial_size=TARGET_SIZE, mode="trilinear")),
            ("NormalizeIntensityd", NormalizeIntensityd(keys=IMG_KEYS, nonzero=True, channel_wise=True)),
            ("ConcatItemsd", ConcatItemsd(keys=IMG_KEYS, name="image")),
            ("ToTensord", ToTensord(keys=["image"])),
        ]
        
        data = file_path.copy()
        for name, transform in transforms_list:
            log(f"\nRunning transform: {name} ...")
            try:
                data = transform(data)
                if name in ["ConcatItemsd", "ToTensord"]:
                    log(f"Success! 'image' shape: {data['image'].shape}")
                else:
                    for k in IMG_KEYS:
                        log(f"Success! '{k}' shape: {data[k].shape}")
            except Exception as transform_err:
                log(f"FAILED on transform: {name}")
                log(traceback.format_exc())
                full_log = "\n".join(logs)
                raise RuntimeError(f"Preprocessing Failed at transform {name}.\nLog Trace:\n{full_log}") from transform_err
                
        return data["image"].float(), "glioma"

    filename_lower = file_path.lower()
    
    if filename_lower.endswith('.pt'):
        # Direct loading of preprocessed PyTorch tensors
        data = torch.load(file_path, map_location='cpu', weights_only=False)
        if "image" in data:
            return data["image"].float(), data.get("source", "glioma")
        else:
            raise ValueError("Preprocessed .pt file does not contain 'image' tensor.")
            
    # For single NIfTI volume files (fallback)
    if filename_lower.endswith(('.nii', '.nii.gz')):
        import monai
        import traceback
        
        logs = []
        def log(msg):
            logs.append(str(msg))
            print(msg)
            
        log("\n=== Preprocessing Single NIfTI Scan Debug Instrumentation ===")
        log(f"MONAI Version: {monai.__version__}")
        log(f"File Path: {file_path}")
        log(f"File Exists: {os.path.exists(file_path)}")
        if os.path.exists(file_path):
            log(f"File Size (Bytes): {os.path.getsize(file_path)}")
        log(f"File Extension: {os.path.splitext(file_path)[1]}")
        log(f"Current working directory: {os.getcwd()}")
        log(f"Absolute file path: {os.path.abspath(file_path)}")
        
        item = {k: file_path for k in IMG_KEYS}
        log("Dictionary passed to MONAI LoadImaged:")
        log(str(item))
        
        # Verify nibabel loading
        try:
            import nibabel as nib
            nib_img = nib.load(file_path)
            log("Nibabel loaded successfully!")
            log(f"Nibabel Image Shape: {nib_img.shape}")
        except Exception as nib_err:
            log("Nibabel load FAILED:")
            log(traceback.format_exc())
            
        # Transform list
        transforms_list = [
            ("LoadImaged", LoadImaged(keys=IMG_KEYS)),
            ("EnsureChannelFirstd", EnsureChannelFirstd(keys=IMG_KEYS)),
            ("Orientationd", Orientationd(keys=IMG_KEYS, axcodes="RAS", labels=(('L','R'),('P','A'),('I','S')))),
            ("Spacingd", Spacingd(keys=IMG_KEYS, pixdim=(1.5, 1.5, 1.5), mode="bilinear")),
            ("CropForegroundd", CropForegroundd(keys=IMG_KEYS, source_key="t1")),
            ("Resized", Resized(keys=IMG_KEYS, spatial_size=TARGET_SIZE, mode="trilinear")),
            ("NormalizeIntensityd", NormalizeIntensityd(keys=IMG_KEYS, nonzero=True, channel_wise=True)),
            ("ConcatItemsd", ConcatItemsd(keys=IMG_KEYS, name="image")),
            ("ToTensord", ToTensord(keys=["image"])),
        ]
        
        data = item.copy()
        for name, transform in transforms_list:
            log(f"\nRunning transform: {name} ...")
            try:
                data = transform(data)
                if name in ["ConcatItemsd", "ToTensord"]:
                    log(f"Success! 'image' shape: {data['image'].shape}")
                else:
                    for k in IMG_KEYS:
                        log(f"Success! '{k}' shape: {data[k].shape}")
            except Exception as transform_err:
                log(f"FAILED on transform: {name}")
                log(traceback.format_exc())
                full_log = "\n".join(logs)
                raise RuntimeError(f"Preprocessing Failed at transform {name}.\nLog Trace:\n{full_log}") from transform_err
                
        return data["image"].float(), "ixi"

    # For standard image formats (PNG, JPG, JPEG, GIF)
    if filename_lower.endswith(('.png', '.jpg', '.jpeg', '.gif')):
        from PIL import Image
        import numpy as np
        
        # Load and convert to grayscale
        img = Image.open(file_path).convert('L')
        # Resize to (96, 96)
        img = img.resize((96, 96), Image.Resampling.BILINEAR)
        img_data = np.array(img, dtype=np.float32)
        
        # Normalize
        mean = img_data.mean()
        std = img_data.std()
        img_data = (img_data - mean) / (std + 1e-8) if std > 0 else (img_data - mean)
        
        # Stack to 3D volume (96, 96, 96)
        volume = np.stack([img_data] * 96, axis=-1)
        
        # Replicate to 4 channels (4, 96, 96, 96)
        four_channel = np.stack([volume] * 4, axis=0)
        
        return torch.from_numpy(four_channel).float(), "ixi"

    # For DICOM files
    if filename_lower.endswith(('.dcm', '.dicom')):
        import pydicom
        import numpy as np
        from PIL import Image
        
        # Read DICOM
        ds = pydicom.dcmread(file_path)
        pixel_array = ds.pixel_array.astype(np.float32)
        
        # Extract 2D slice if multi-frame/3D
        if pixel_array.ndim == 3:
            pixel_array = pixel_array[pixel_array.shape[0] // 2]
        elif pixel_array.ndim > 3:
            pixel_array = pixel_array[0, :, :]
            
        # Convert to 2D image for easy resizing
        img = Image.fromarray(pixel_array)
        img = img.resize((96, 96), Image.Resampling.BILINEAR)
        img_data = np.array(img, dtype=np.float32)
        
        # Normalize
        mean = img_data.mean()
        std = img_data.std()
        img_data = (img_data - mean) / (std + 1e-8) if std > 0 else (img_data - mean)
        
        # Stack to 3D volume (96, 96, 96)
        volume = np.stack([img_data] * 96, axis=-1)
        
        # Replicate to 4 channels (4, 96, 96, 96)
        four_channel = np.stack([volume] * 4, axis=0)
        
        return torch.from_numpy(four_channel).float(), "ixi"
        
    raise ValueError("Unsupported file format. Please upload a Union[str, dict] representing NIfTI, DICOM, or image file.")
