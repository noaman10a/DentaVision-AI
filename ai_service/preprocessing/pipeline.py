"""
DentaVision AI - X-Ray Preprocessing Pipeline
Owner: Noaman (AI Model Lead)

Implements the official preprocessing steps mandated by the MDS and DEH:
Input X-ray -> Validate -> Contrast Enhancement (CLAHE) -> Resize -> Normalize -> Tensor/Array
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path for standalone script execution
_project_root = str(Path(__file__).resolve().parents[2])
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import logging
from typing import Tuple, Optional, Union, Dict, Any
import numpy as np

logger = logging.getLogger("XRayPreprocessor")

class PreprocessingConfig:
    def __init__(
        self,
        target_size: Tuple[int, int] = (640, 640),
        clip_limit: float = 2.0,
        tile_grid_size: Tuple[int, int] = (8, 8),
        mean: Tuple[float, float, float] = (0.485, 0.456, 0.406),
        std: Tuple[float, float, float] = (0.229, 0.224, 0.225),
        apply_clahe: bool = True,
        apply_denoise: bool = False,
        apply_augmentation: bool = False
    ):
        self.target_size = target_size
        self.clip_limit = clip_limit
        self.tile_grid_size = tile_grid_size
        self.mean = mean
        self.std = std
        self.apply_clahe = apply_clahe
        self.apply_denoise = apply_denoise
        self.apply_augmentation = apply_augmentation


class DataAugmentor:
    """Applies realistic dental X-ray augmentations: spatial rotation, contrast/exposure jitter, and sensor noise."""
    @staticmethod
    def augment(
        image: np.ndarray,
        max_rotation_deg: float = 10.0,
        contrast_range: Tuple[float, float] = (0.85, 1.15),
        brightness_range: Tuple[int, int] = (-15, 15),
        noise_std: float = 5.0
    ) -> np.ndarray:
        """Applies photometric and spatial augmentations to a numpy image array."""
        augmented = image.copy().astype(np.float32)

        # 1. Random Brightness & Contrast Jittering
        alpha = np.random.uniform(contrast_range[0], contrast_range[1])
        beta = np.random.uniform(brightness_range[0], brightness_range[1])
        augmented = augmented * alpha + beta
        augmented = np.clip(augmented, 0.0, 255.0).astype(np.uint8)

        # 2. Random Gaussian Sensor Noise
        if noise_std > 0 and np.random.rand() > 0.5:
            noise = np.random.normal(0, noise_std, augmented.shape).astype(np.float32)
            augmented = np.clip(augmented.astype(np.float32) + noise, 0.0, 255.0).astype(np.uint8)

        # 3. Slight Random Spatial Rotation (Affine transform)
        if max_rotation_deg > 0:
            angle = np.random.uniform(-max_rotation_deg, max_rotation_deg)
            h, w = augmented.shape[:2]
            center = (w // 2, h // 2)
            try:
                import cv2
                matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
                augmented = cv2.warpAffine(augmented, matrix, (w, h), borderMode=cv2.BORDER_REPLICATE)
            except ImportError:
                from PIL import Image
                pil_img = Image.fromarray(augmented)
                rotated = pil_img.rotate(angle, resample=Image.BILINEAR)
                augmented = np.array(rotated)

        return augmented


class ImageValidator:
    @staticmethod
    def validate(image: np.ndarray) -> Tuple[bool, str]:
        """Validates that input array is a valid non-empty 2D grayscale or 3D color image."""
        if not isinstance(image, np.ndarray):
            return False, "Input is not a valid numpy ndarray"
        if image.size == 0:
            return False, "Input image array is empty (0 size)"
        if len(image.shape) not in (2, 3):
            return False, f"Invalid image shape {image.shape}. Expected 2D (H, W) or 3D (H, W, C)"
        if np.all(image == 0):
            return False, "Image array contains only black/zero pixels"
        return True, "Valid"


class ContrastEnhancer:
    @staticmethod
    def apply_clahe(image: np.ndarray, clip_limit: float = 2.0, tile_grid_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
        """Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) to dental X-ray."""
        try:
            import cv2
            if len(image.shape) == 3 and image.shape[2] == 3:
                # Convert to YCrCb or LAB, apply CLAHE on L channel
                lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
                l, a, b = cv2.split(lab)
                clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
                l_enhanced = clahe.apply(l)
                enhanced_lab = cv2.merge((l_enhanced, a, b))
                return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
            elif len(image.shape) == 2:
                # Grayscale
                clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
                return clahe.apply(image)
            return image
        except ImportError:
            # Fallback if cv2 is not available (simple min-max stretch)
            logger.warning("cv2 not available, falling back to min-max contrast stretch")
            img_float = image.astype(np.float32)
            min_val, max_val = img_float.min(), img_float.max()
            if max_val > min_val:
                stretched = (img_float - min_val) / (max_val - min_val) * 255.0
                return stretched.astype(np.uint8)
            return image


class IEEEPaperEnhancer:
    """
    Implements the official IEEE 2023 Paper Image Enhancement Pipeline:
    1. Gaussian & Laplacian Pyramids (Eq. 1-2): Noise removal & detail enhancement
    2. Lookup Table Power Transformation: (j / 255)^1.5 * 255
    3. Automatic Alpha-Beta Linear Contrast Adjustment: output = alpha * input + beta
    """
    @staticmethod
    def enhance_image(image: np.ndarray) -> np.ndarray:
        try:
            import cv2
            img = image.copy()

            # 1. Lookup Table Power Transformation (Eq 1 from Paper: (j / 255)^1.5 * 255)
            lut = np.array([((i / 255.0) ** 1.5) * 255 for i in range(256)]).astype(np.uint8)
            if len(img.shape) == 3:
                img = cv2.LUT(img, lut)
            else:
                img = cv2.LUT(img, lut)

            # 2. Gaussian and Laplacian Pyramid Enhancement
            if len(img.shape) == 3:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            else:
                gray = img.copy()

            down = cv2.pyrDown(gray)
            up = cv2.pyrUp(down, dstsize=(gray.shape[1], gray.shape[0]))
            laplacian = cv2.subtract(gray, up)

            enhanced_gray = cv2.add(gray, laplacian)

            # 3. Automatic Brightness & Contrast Adjustment (Eq 2-4 from Paper: output = alpha * input + beta)
            a_min, a_max = 0.0, 255.0
            a_low, a_high = float(np.min(enhanced_gray)), float(np.max(enhanced_gray))

            if a_high > a_low:
                alpha = (a_max - a_min) / (a_high - a_low)
                beta = a_min - (a_low * alpha)
                enhanced_gray = cv2.convertScaleAbs(enhanced_gray, alpha=alpha, beta=beta)

            if len(image.shape) == 3:
                return cv2.cvtColor(enhanced_gray, cv2.COLOR_GRAY2BGR)
            return enhanced_gray
        except Exception as e:
            logger.warning(f"IEEE Paper Enhancer fallback: {str(e)}")
            return image


class ImageResizer:
    @staticmethod
    def resize(image: np.ndarray, target_size: Tuple[int, int] = (640, 640)) -> Tuple[np.ndarray, Dict[str, float]]:
        """Resizes image to target_size (width, height) with aspect-ratio preserving padding."""
        target_w, target_h = target_size
        h, w = image.shape[:2]
        
        scale = min(target_w / w, target_h / h)
        new_w, new_h = int(w * scale), int(h * scale)
        
        try:
            import cv2
            resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        except ImportError:
            from PIL import Image
            pil_img = Image.fromarray(image)
            resized_pil = pil_img.resize((new_w, new_h), Image.BILINEAR)
            resized = np.array(resized_pil)

        # Pad to exact target_size
        pad_w = target_w - new_w
        pad_h = target_h - new_h
        top, bottom = pad_h // 2, pad_h - (pad_h // 2)
        left, right = pad_w // 2, pad_w - (pad_w // 2)

        if len(image.shape) == 3:
            padded = np.pad(resized, ((top, bottom), (left, right), (0, 0)), mode='constant', constant_values=0)
        else:
            padded = np.pad(resized, ((top, bottom), (left, right)), mode='constant', constant_values=0)

        meta = {
            "scale": scale,
            "pad_top": float(top),
            "pad_left": float(left),
            "original_w": float(w),
            "original_h": float(h)
        }
        return padded, meta


class ImageNormalizer:
    @staticmethod
    def normalize(
        image: np.ndarray,
        mean: Tuple[float, float, float] = (0.485, 0.456, 0.406),
        std: Tuple[float, float, float] = (0.229, 0.224, 0.225)
    ) -> np.ndarray:
        """Normalizes image array to float32 [0, 1] range and applies channel-wise normalization."""
        img_float = image.astype(np.float32) / 255.0

        if len(img_float.shape) == 2:
            # Expand 2D grayscale to 3 channels
            img_float = np.stack([img_float] * 3, axis=-1)

        mean_arr = np.array(mean, dtype=np.float32).reshape(1, 1, 3)
        std_arr = np.array(std, dtype=np.float32).reshape(1, 1, 3)

        normalized = (img_float - mean_arr) / std_arr
        # Transpose HWC -> CHW for PyTorch model input tensor compatibility
        return np.transpose(normalized, (2, 0, 1))


class XRayPreprocessor:
    def __init__(self, config: Optional[PreprocessingConfig] = None):
        self.config = config or PreprocessingConfig()

    def process(self, image: np.ndarray, augment: Optional[bool] = None) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Full preprocessing pipeline execution:
        1. Validate
        2. Apply Augmentation (if enabled for training)
        3. Contrast Enhancement (CLAHE)
        4. Resize with Padding
        5. Normalize & Transpose to CHW tensor array
        """
        valid, msg = ImageValidator.validate(image)
        if not valid:
            raise ValueError(f"Preprocessing validation failed: {msg}")

        processed = image.copy()

        # Step 2: Data Augmentation (if requested or config enabled)
        should_augment = augment if augment is not None else self.config.apply_augmentation
        if should_augment:
            processed = DataAugmentor.augment(processed)

        # Step 3: CLAHE Contrast Enhancement
        if self.config.apply_clahe:
            processed = ContrastEnhancer.apply_clahe(
                processed,
                clip_limit=self.config.clip_limit,
                tile_grid_size=self.config.tile_grid_size
            )

        # Step 3: Aspect-preserving Resizing
        resized, transform_meta = ImageResizer.resize(processed, target_size=self.config.target_size)

        # Step 4: Normalization & CHW Transpose
        tensor_array = ImageNormalizer.normalize(
            resized,
            mean=self.config.mean,
            std=self.config.std
        )

        metadata = {
            "transform_meta": transform_meta,
            "target_size": self.config.target_size,
            "channels": tensor_array.shape[0]
        }

        return tensor_array, metadata
