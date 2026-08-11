"""
Unit tests for X-Ray Preprocessing Pipeline
Owner: Noaman (AI Model Lead)
"""

import unittest
import numpy as np
from ai_service.preprocessing.pipeline import (
    XRayPreprocessor,
    PreprocessingConfig,
    ImageValidator,
    ContrastEnhancer,
    ImageResizer,
    ImageNormalizer
)

class TestPreprocessingPipeline(unittest.TestCase):
    def setUp(self):
        # Create a synthetic 100x200 grayscale image
        self.sample_gray = np.random.randint(50, 200, (100, 200), dtype=np.uint8)
        # Create a synthetic 100x200 RGB image
        self.sample_rgb = np.random.randint(50, 200, (100, 200, 3), dtype=np.uint8)

    def test_image_validator(self):
        valid, msg = ImageValidator.validate(self.sample_gray)
        self.assertTrue(valid)

        invalid_empty = np.array([])
        valid, msg = ImageValidator.validate(invalid_empty)
        self.assertFalse(valid)

        invalid_zeros = np.zeros((100, 100), dtype=np.uint8)
        valid, msg = ImageValidator.validate(invalid_zeros)
        self.assertFalse(valid)

    def test_contrast_enhancer(self):
        enhanced_gray = ContrastEnhancer.apply_clahe(self.sample_gray)
        self.assertEqual(enhanced_gray.shape, self.sample_gray.shape)

        enhanced_rgb = ContrastEnhancer.apply_clahe(self.sample_rgb)
        self.assertEqual(enhanced_rgb.shape, self.sample_rgb.shape)

    def test_image_resizer(self):
        target_size = (640, 640)
        resized, meta = ImageResizer.resize(self.sample_gray, target_size=target_size)
        self.assertEqual(resized.shape[:2], (640, 640))
        self.assertIn("scale", meta)
        self.assertIn("pad_top", meta)
        self.assertIn("pad_left", meta)

    def test_image_normalizer(self):
        target_size = (640, 640)
        resized, _ = ImageResizer.resize(self.sample_gray, target_size=target_size)
        normalized = ImageNormalizer.normalize(resized)
        # Expect CHW shape: (3, 640, 640)
        self.assertEqual(normalized.shape, (3, 640, 640))
        self.assertEqual(normalized.dtype, np.float32)

    def test_full_pipeline(self):
        config = PreprocessingConfig(target_size=(512, 512), apply_clahe=True)
        preprocessor = XRayPreprocessor(config)
        tensor_array, metadata = preprocessor.process(self.sample_gray)
        
        self.assertEqual(tensor_array.shape, (3, 512, 512))
        self.assertEqual(metadata["target_size"], (512, 512))
        self.assertEqual(metadata["channels"], 3)

if __name__ == "__main__":
    unittest.main()
