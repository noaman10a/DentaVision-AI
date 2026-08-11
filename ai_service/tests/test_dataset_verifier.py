"""
Unit tests for DatasetVerifier utility
Owner: Noaman (AI Model Lead)
"""

import os
import json
import tempfile
import unittest
from pathlib import Path
from ai_service.utils.dataset_verifier import DatasetVerifier

class TestDatasetVerifier(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory()
        self.dir_path = Path(self.test_dir.name)

    def tearDown(self):
        self.test_dir.cleanup()

    def test_empty_directory(self):
        verifier = DatasetVerifier(str(self.dir_path))
        report = verifier.scan_directory()
        self.assertEqual(report["status"], "EMPTY")
        self.assertEqual(report["valid_image_count"], 0)
        self.assertEqual(len(report["corrupted_files"]), 0)

    def test_non_existent_directory(self):
        verifier = DatasetVerifier(str(self.dir_path / "does_not_exist"))
        report = verifier.scan_directory()
        self.assertEqual(report["status"], "FAILED")

    def test_valid_and_unsupported_files(self):
        # Create dummy text file
        unsupported = self.dir_path / "note.bin"
        unsupported.write_text("dummy binary file")

        verifier = DatasetVerifier(str(self.dir_path))
        report = verifier.scan_directory()
        self.assertIn("note.bin", report["unsupported_files"])

if __name__ == "__main__":
    unittest.main()
