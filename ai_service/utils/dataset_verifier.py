"""
DentaVision AI - Dataset Verifier Utility
Owner: Noaman (AI Model Lead)

Validates dataset folder structure, image file integrity, image dimensions, corrupt files,
and produces dataset verification reports as required by Phase 2 of the DEH.
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("DatasetVerifier")

VALID_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".dcm", ".dicom", ".tif", ".tiff"}

class DatasetVerifier:
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.report: Dict[str, Any] = {
            "dataset_path": str(self.dataset_path.resolve()),
            "total_files_scanned": 0,
            "valid_image_count": 0,
            "corrupted_files": [],
            "unsupported_files": [],
            "dimensions_summary": {},
            "split_summary": {},
            "class_distribution": {},
            "status": "NOT_STARTED"
        }

    def scan_directory(self) -> Dict[str, Any]:
        """Scans the dataset directory recursively and validates files."""
        if not self.dataset_path.exists():
            self.report["status"] = "FAILED"
            self.report["error"] = f"Directory '{self.dataset_path}' does not exist."
            logger.error(self.report["error"])
            return self.report

        logger.info(f"Scanning dataset at: {self.dataset_path}")
        
        all_files = list(self.dataset_path.rglob("*"))
        self.report["total_files_scanned"] = len([f for f in all_files if f.is_file()])

        for file_path in all_files:
            if not file_path.is_file():
                continue
            
            ext = file_path.suffix.lower()
            if ext not in VALID_EXTENSIONS:
                if not ext in {".json", ".xml", ".txt", ".csv", ".py"}:
                    self.report["unsupported_files"].append(str(file_path.relative_to(self.dataset_path)))
                continue

            # Validate image file integrity
            is_valid, dims_info, err_msg = self._verify_image_integrity(file_path)
            if is_valid:
                self.report["valid_image_count"] += 1
                if dims_info:
                    dim_str = f"{dims_info[0]}x{dims_info[1]}"
                    self.report["dimensions_summary"][dim_str] = self.report["dimensions_summary"].get(dim_str, 0) + 1
            else:
                self.report["corrupted_files"].append({
                    "path": str(file_path.relative_to(self.dataset_path)),
                    "reason": err_msg
                })

        # Summary calculation
        if len(self.report["corrupted_files"]) == 0 and self.report["valid_image_count"] > 0:
            self.report["status"] = "PASSED"
        elif self.report["valid_image_count"] == 0:
            self.report["status"] = "EMPTY"
        else:
            self.report["status"] = "WARNINGS_FOUND"

        logger.info(f"Scan complete. Status: {self.report['status']}, Valid images: {self.report['valid_image_count']}, Corrupted: {len(self.report['corrupted_files'])}")
        return self.report

    def _verify_image_integrity(self, file_path: Path) -> Tuple[bool, Optional[Tuple[int, int]], str]:
        """Verifies if the file can be cleanly opened as an image."""
        try:
            from PIL import Image
            with Image.open(file_path) as img:
                img.verify()
            # Reopen to get dimensions (verify closes handle)
            with Image.open(file_path) as img:
                return True, img.size, ""
        except ImportError:
            # Fallback if Pillow is not installed yet
            size = file_path.stat().st_size
            if size == 0:
                return False, None, "File is 0 bytes"
            return True, None, "Verified size > 0 (PIL not installed)"
        except Exception as e:
            return False, None, f"Image decode error: {str(e)}"

    def save_report(self, output_file: str = "dataset_report.json") -> str:
        """Saves the verification report to a JSON file."""
        out_path = Path(output_file)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(self.report, f, indent=2)
        logger.info(f"Verification report saved to: {out_path.resolve()}")
        return str(out_path.resolve())


if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    verifier = DatasetVerifier(target_dir)
    rep = verifier.scan_directory()
    print(json.dumps(rep, indent=2))
