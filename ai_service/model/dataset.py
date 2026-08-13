"""
DentaVision AI - PyTorch Dental X-Ray Dataset Loader
Owner: Noaman (AI Model Lead)

Implements PyTorch Dataset for loading X-ray images, applying preprocessing/augmentation,
and serving batches to PyTorch DataLoader.
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path for standalone script execution
_project_root = str(Path(__file__).resolve().parents[2])
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import os
import json
import logging
from typing import List, Dict, Any, Tuple, Optional, Union
import numpy as np

from ai_service.preprocessing.pipeline import XRayPreprocessor, PreprocessingConfig
from ai_service.model.architecture import DENTAL_CLASSES

logger = logging.getLogger("DentalXRayDataset")

class DummyDataset:
    """Fallback dummy dataset if PyTorch is loaded dynamically."""
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.samples = []

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        return np.zeros((3, 640, 640), dtype=np.float32), 0


try:
    import torch
    from torch.utils.data import Dataset, DataLoader
    from PIL import Image, ImageFile
    ImageFile.LOAD_TRUNCATED_IMAGES = True

    class DentalXRayDataset(Dataset):
        def __init__(
            self,
            data_dir: str,
            annotation_file: Optional[str] = None,
            config: Optional[PreprocessingConfig] = None,
            is_train: bool = True
        ):
            self.data_dir = Path(data_dir)
            self.preprocessor = XRayPreprocessor(config or PreprocessingConfig())
            self.is_train = is_train
            self.image_paths: List[Path] = []
            self.targets: List[Dict[str, Any]] = []

            self._load_dataset(annotation_file)

        def _load_dataset(self, annotation_file: Optional[str]):
            valid_exts = {".png", ".jpg", ".jpeg", ".bmp", ".dcm"}
            if self.data_dir.exists():
                all_images = [f for f in self.data_dir.glob("*") if f.is_file() and f.suffix.lower() in valid_exts]
                self.image_paths = sorted(all_images)

            # Load annotations if available
            annotations_map = {}
            if annotation_file and os.path.exists(annotation_file):
                with open(annotation_file, "r", encoding="utf-8") as f:
                    annotations_map = json.load(f)

            for img_path in self.image_paths:
                label_info = annotations_map.get(img_path.name, {"class_id": 0, "boxes": []})
                self.targets.append(label_info)

            logger.info(f"Loaded {len(self.image_paths)} images from {self.data_dir}")

        def __len__(self) -> int:
            return len(self.image_paths)

        def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
            for attempt in range(min(10, max(1, len(self.image_paths)))):
                current_idx = (idx + attempt) % len(self.image_paths)
                img_path = self.image_paths[current_idx]
                
                try:
                    # Load image array
                    with Image.open(img_path) as img:
                        img_array = np.array(img.convert("RGB"))
                    # Process through preprocessing pipeline (with data augmentation for training)
                    tensor_array, metadata = self.preprocessor.process(img_array, augment=self.is_train)
                    
                    tensor_x = torch.from_numpy(tensor_array).float()
                    target_info = self.targets[current_idx]
                    target_class = int(target_info.get("class_id", 0))
                    tensor_y = torch.tensor(target_class, dtype=torch.long)
                    return tensor_x, tensor_y
                except Exception as e:
                    logger.warning(f"Skipping corrupt/truncated image {img_path}: {e}")

            # Safe fallback tensor
            dummy_x = torch.zeros((3, 640, 640), dtype=torch.float32)
            dummy_y = torch.tensor(0, dtype=torch.long)
            return dummy_x, dummy_y

    def create_dataloader(
        data_dir: str,
        annotation_file: Optional[str] = None,
        batch_size: int = 8,
        shuffle: bool = True,
        num_workers: int = 0
    ) -> DataLoader:
        """Helper factory function to instantiate PyTorch DataLoader."""
        dataset = DentalXRayDataset(data_dir=data_dir, annotation_file=annotation_file)
        return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, num_workers=num_workers)

except ImportError:
    def create_dataloader(*args, **kwargs):
        return None
