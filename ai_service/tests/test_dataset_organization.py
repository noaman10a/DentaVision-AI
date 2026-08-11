"""
Unit tests for Dataset Organizer & PyTorch Dataset Loader
Owner: Noaman (AI Model Lead)
"""

import os
import tempfile
import unittest
import numpy as np
from pathlib import Path
from PIL import Image

from ai_service.utils.dataset_organizer import DatasetOrganizer
from ai_service.model.dataset import DentalXRayDataset

class TestDatasetOrganization(unittest.TestCase):
    def setUp(self):
        self.temp_src = tempfile.TemporaryDirectory()
        self.temp_out = tempfile.TemporaryDirectory()
        self.src_path = Path(self.temp_src.name)
        self.out_path = Path(self.temp_out.name)

        # Create 10 dummy PNG images
        for i in range(10):
            img_arr = np.random.randint(50, 200, (100, 100, 3), dtype=np.uint8)
            img = Image.fromarray(img_arr)
            img.save(self.src_path / f"xray_{i:02d}.png")

    def tearDown(self):
        self.temp_src.cleanup()
        self.temp_out.cleanup()

    def test_dataset_organizer_split(self):
        organizer = DatasetOrganizer(
            source_dir=str(self.src_path),
            output_dir=str(self.out_path),
            train_ratio=0.7,
            val_ratio=0.15,
            test_ratio=0.15
        )
        report = organizer.organize_and_split()
        self.assertEqual(report["status"], "SUCCESS")
        self.assertEqual(report["total_images"], 10)
        self.assertEqual(report["split_summary"]["train"], 7)
        self.assertEqual(report["split_summary"]["val"], 1)
        self.assertEqual(report["split_summary"]["test"], 2)

    def test_pytorch_dataset_loader(self):
        # Test loading images from the generated split folder
        organizer = DatasetOrganizer(
            source_dir=str(self.src_path),
            output_dir=str(self.out_path)
        )
        organizer.organize_and_split()
        
        train_dir = self.out_path / "train"
        dataset = DentalXRayDataset(data_dir=str(train_dir))
        self.assertEqual(len(dataset), 7)
        
        tensor_x, tensor_y = dataset[0]
        self.assertEqual(tensor_x.shape, (3, 640, 640))

if __name__ == "__main__":
    unittest.main()
