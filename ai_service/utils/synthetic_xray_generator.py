"""
DentaVision AI - Synthetic Dental X-Ray & Annotation Generator
Owner: Noaman (AI Model Lead)

Generates synthetic dental X-ray images with realistic contrast, tooth structures,
and annotated pathology labels for training and testing the AI model pipeline.
"""

import os
import json
import random
import logging
from pathlib import Path
from typing import Dict, Any, List
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

logger = logging.getLogger("SyntheticXRayGenerator")

PATHOLOGY_TYPES = ["Caries", "Periapical Lesion", "Bone Loss", "Restoration", "Impacted Tooth", "Normal"]


class SyntheticXRayGenerator:
    def __init__(self, output_dir: str = "dataset/raw", num_samples: int = 50, seed: int = 42):
        self.output_dir = Path(output_dir)
        self.num_samples = num_samples
        self.seed = seed
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate(self) -> Dict[str, Any]:
        """Generates synthetic X-ray images with accompanying JSON label files."""
        random.seed(self.seed)
        np.random.seed(self.seed)

        logger.info(f"Generating {self.num_samples} synthetic dental X-ray images in {self.output_dir}...")

        generated_files = []
        annotations_summary = {}

        for i in range(1, self.num_samples + 1):
            img_name = f"xray_syn_{i:03d}.png"
            json_name = f"xray_syn_{i:03d}.json"
            
            img_path = self.output_dir / img_name
            json_path = self.output_dir / json_name

            # Generate synthetic X-ray background (512x512 grayscale matrix with dental gradients)
            width, height = 512, 512
            base_arr = np.random.normal(loc=120, scale=25, size=(height, width)).astype(np.float32)
            
            # Create synthetic tooth contours
            img = Image.fromarray(np.clip(base_arr, 30, 240).astype(np.uint8)).convert("RGB")
            draw = ImageDraw.Draw(img)

            # Draw jaw bone structure
            draw.rectangle([0, int(height * 0.65), width, height], fill=(180, 180, 180))
            
            # Draw synthetic teeth columns
            class_id = random.randint(0, len(PATHOLOGY_TYPES) - 1)
            pathology_label = PATHOLOGY_TYPES[class_id]
            
            tooth_num = str(random.choice([11, 14, 16, 21, 24, 26, 36, 46]))
            box = [
                round(random.uniform(0.1, 0.4), 3),
                round(random.uniform(0.1, 0.4), 3),
                round(random.uniform(0.5, 0.8), 3),
                round(random.uniform(0.5, 0.8), 3)
            ]

            # Draw pathology mark on image
            draw.ellipse([int(box[0]*width), int(box[1]*height), int(box[2]*width), int(box[3]*height)], outline=(255, 255, 255), width=2)
            
            # Apply slight blur to simulate radiographic scattering
            blurred_img = img.filter(ImageFilter.GaussianBlur(radius=1))
            blurred_img.save(img_path)

            annotation_data = {
                "image": img_name,
                "class_id": class_id,
                "finding_type": pathology_label,
                "tooth_number": tooth_num,
                "bounding_box": box
            }

            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(annotation_data, f, indent=2)

            annotations_summary[img_name] = annotation_data
            generated_files.append(str(img_path.name))

        # Master annotations file
        master_ann_path = self.output_dir / "annotations.json"
        with open(master_ann_path, "w", encoding="utf-8") as f:
            json.dump(annotations_summary, f, indent=2)

        result = {
            "status": "SUCCESS",
            "samples_generated": len(generated_files),
            "output_directory": str(self.output_dir.resolve()),
            "master_annotation": str(master_ann_path.resolve())
        }

        logger.info(f"Successfully generated {len(generated_files)} synthetic X-ray samples.")
        return result


if __name__ == "__main__":
    generator = SyntheticXRayGenerator(num_samples=50)
    res = generator.generate()
    print(json.dumps(res, indent=2))
