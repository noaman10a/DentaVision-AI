"""
DentaVision AI - Automated Dataset Organizer & Splitter Utility
Owner: Noaman (AI Model Lead)

Organizes raw dental X-ray images and annotation files into approved Train/Val/Test splits:
70% Training | 15% Validation | 15% Testing
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path for standalone script execution
_project_root = str(Path(__file__).resolve().parents[2])
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import os
import shutil
import random
import json
import logging
from typing import Dict, Any, List, Tuple
from ai_service.utils.dataset_verifier import DatasetVerifier

logger = logging.getLogger("DatasetOrganizer")

class DatasetOrganizer:
    def __init__(
        self,
        source_dir: str,
        output_dir: str = "dataset/split",
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        seed: int = 42
    ):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.train_ratio = train_ratio
        self.val_ratio = val_ratio
        self.test_ratio = test_ratio
        self.seed = seed

        assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-4, "Ratios must sum to 1.0"

    def organize_and_split(self) -> Dict[str, Any]:
        """Scans source_dir, verifies images, and splits into train/val/test folders."""
        logger.info(f"Starting dataset verification on: {self.source_dir}")
        verifier = DatasetVerifier(str(self.source_dir))
        verification_report = verifier.scan_directory()

        if verification_report["status"] in ("FAILED", "EMPTY"):
            logger.error("Dataset organization aborted due to verification status.")
            return {"status": "FAILED", "reason": verification_report.get("error", "Empty dataset")}

        # Find all valid image files
        valid_extensions = {".png", ".jpg", ".jpeg", ".bmp", ".dcm", ".tif"}
        image_files = [f for f in self.source_dir.rglob("*") if f.is_file() and f.suffix.lower() in valid_extensions]

        # Shuffle deterministically
        random.seed(self.seed)
        random.shuffle(image_files)

        total_count = len(image_files)
        train_end = int(total_count * self.train_ratio)
        val_end = train_end + int(total_count * self.val_ratio)

        splits = {
            "train": image_files[:train_end],
            "val": image_files[train_end:val_end],
            "test": image_files[val_end:]
        }

        split_summary = {}

        # Copy files to designated split directories
        for split_name, files in splits.items():
            split_dir = self.output_dir / split_name
            split_dir.mkdir(parents=True, exist_ok=True)
            copied_count = 0

            for img_path in files:
                dest_file = split_dir / img_path.name
                shutil.copy2(img_path, dest_file)
                copied_count += 1

                # Copy corresponding label file if exists (.json, .xml, .txt with same stem)
                for label_ext in [".json", ".xml", ".txt"]:
                    label_file = img_path.with_suffix(label_ext)
                    if label_file.exists():
                        shutil.copy2(label_file, split_dir / label_file.name)

            split_summary[split_name] = copied_count
            logger.info(f"Split '{split_name}': {copied_count} images saved to {split_dir}")

        result_report = {
            "status": "SUCCESS",
            "source_directory": str(self.source_dir.resolve()),
            "output_directory": str(self.output_dir.resolve()),
            "total_images": total_count,
            "split_summary": split_summary,
            "verification_status": verification_report["status"]
        }

        # Save summary report
        report_file = self.output_dir / "dataset_split_summary.json"
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(result_report, f, indent=2)

        return result_report


if __name__ == "__main__":
    import sys
    src = sys.argv[1] if len(sys.argv) > 1 else "dataset/raw"
    out = sys.argv[2] if len(sys.argv) > 2 else "dataset/split"
    organizer = DatasetOrganizer(src, out)
    res = organizer.organize_and_split()
    print(json.dumps(res, indent=2))
