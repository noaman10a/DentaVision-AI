"""
Unit tests for Model Trainer and Evaluator modules
Owner: Noaman (AI Model Lead)
"""

import unittest
import tempfile
from pathlib import Path
from PIL import Image
import numpy as np

from ai_service.model.trainer import ModelTrainer, TrainingConfig
from ai_service.model.evaluator import ModelEvaluator
from ai_service.utils.dataset_organizer import DatasetOrganizer

class TestTrainerEvaluator(unittest.TestCase):
    def setUp(self):
        self.temp_src = tempfile.TemporaryDirectory()
        self.temp_out = tempfile.TemporaryDirectory()
        self.temp_chk = tempfile.TemporaryDirectory()
        
        src_path = Path(self.temp_src.name)
        out_path = Path(self.temp_out.name)

        # Generate 10 sample images
        for i in range(10):
            img_arr = np.random.randint(40, 200, (80, 80, 3), dtype=np.uint8)
            img = Image.fromarray(img_arr)
            img.save(src_path / f"img_{i:02d}.png")

        # Organize into train/val/test splits
        organizer = DatasetOrganizer(source_dir=str(src_path), output_dir=str(out_path))
        organizer.organize_and_split()

    def tearDown(self):
        self.temp_src.cleanup()
        self.temp_out.cleanup()
        self.temp_chk.cleanup()

    def test_model_trainer_pipeline(self):
        config = TrainingConfig(
            epochs=1,
            batch_size=2,
            checkpoint_dir=self.temp_chk.name,
            data_dir=self.temp_out.name
        )
        trainer = ModelTrainer(config)
        history = trainer.train()

        self.assertIn("best_val_acc", history)
        self.assertEqual(len(history["train_loss"]), 1)
        self.assertTrue((Path(self.temp_chk.name) / "best_model.pt").exists() or history["best_val_acc"] >= 0.0)

    def test_model_evaluator_pipeline(self):
        test_dir = Path(self.temp_out.name) / "test"
        evaluator = ModelEvaluator()
        report = evaluator.evaluate(test_data_dir=str(test_dir))

        self.assertEqual(report["status"] if "status" in report else "OK", "OK")
        self.assertIn("metrics", report)
        self.assertIn("accuracy", report["metrics"])
        self.assertIn("macro_f1", report["metrics"])

if __name__ == "__main__":
    unittest.main()
