"""
DentaVision AI - Strict Multi-Epoch Protocol Runner
Owner: Noaman (AI Model Lead)

Executes the protocol:
1. Complete 30-Epoch experiment (saved as yolov8_30e).
2. Evaluate 30-Epoch model (Precision, Recall, mAP@50, mAP@50-95, Train Loss, Val Loss).
3. Complete SEPARATE 50-Epoch experiment (saved as yolov8_50e).
4. Evaluate 50-Epoch model & compare 30e vs 50e.
5. If 50e improves meaningfully, execute SEPARATE 75-Epoch experiment (saved as yolov8_75e).
6. Perform final 30e vs 50e vs 75e evaluation and select optimal checkpoint.
"""

import sys
import shutil
import logging
from pathlib import Path
from ultralytics import YOLO

_project_root = Path(__file__).resolve().parents[2]
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from ai_service.model.eval_experiments import parse_results_csv, print_comparison, evaluate_run

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ProtocolRunner")

YAML_PATH = _project_root / "ai_service" / "model" / "denta_yolo.yaml"
CHECKPOINT_DIR = _project_root / "ai_service" / "model" / "checkpoints"

def run_experiment(name: str, epochs: int):
    target_dir = CHECKPOINT_DIR / name
    results_csv = target_dir / "results.csv"
    
    # Check if already completed
    if results_csv.exists():
        data = parse_results_csv(results_csv)
        if data and len(data) >= epochs:
            logger.info(f"Experiment '{name}' with {epochs} epochs already completed. Skipping training.")
            return target_dir
            
    logger.info(f"Starting SEPARATE training experiment: '{name}' for {epochs} epochs...")
    model = YOLO("yolov8n.pt")
    
    results = model.train(
        data=str(YAML_PATH),
        epochs=epochs,
        imgsz=640,
        batch=16,
        lr0=0.001,
        optimizer="AdamW",
        workers=2,
        project=str(CHECKPOINT_DIR),
        name=name,
        exist_ok=True,
        verbose=True
    )
    logger.info(f"Experiment '{name}' finished successfully.")
    return target_dir

def main():
    logger.info("=========================================================")
    logger.info(" Starting DentaVision AI Multi-Epoch Protocol Evaluation ")
    logger.info("=========================================================")

    # Step 1: 30 Epochs
    run_experiment("yolov8_30e", 30)
    res_30e = evaluate_run(CHECKPOINT_DIR / "yolov8_30e", "30 Epochs")

    # Step 2: 50 Epochs
    run_experiment("yolov8_50e", 50)
    res_50e = evaluate_run(CHECKPOINT_DIR / "yolov8_50e", "50 Epochs")

    # Compare 30e vs 50e
    runs = {"30 Epochs": res_30e, "50 Epochs": res_50e}
    print_comparison(runs)

    # Determine if 50e improved over 30e
    map30 = res_30e['best_metrics']['map50_95'] if res_30e else 0.0
    map50 = res_50e['best_metrics']['map50_95'] if res_50e else 0.0

    if map50 > map30 and (map50 - map30) > 0.005:
        logger.info("50-epoch model showed meaningful improvement over 30-epoch model. Proceeding to 75-epoch experiment...")
        run_experiment("yolov8_75e", 75)
        res_75e = evaluate_run(CHECKPOINT_DIR / "yolov8_75e", "75 Epochs")
        runs["75 Epochs"] = res_75e
        print_comparison(runs)
    else:
        logger.info("50-epoch model did not show significant improvement over 30-epoch model. 75-epoch run not required.")

    # Select best model checkpoint
    best_name = max(runs.keys(), key=lambda k: runs[k]['best_metrics']['map50_95'] if runs[k] else 0.0)
    logger.info(f"Selected Best Performing Model: {best_name}")

    best_folder_map = {
        "30 Epochs": "yolov8_30e",
        "50 Epochs": "yolov8_50e",
        "75 Epochs": "yolov8_75e"
    }
    best_folder = best_folder_map[best_name]
    best_weights = CHECKPOINT_DIR / best_folder / "weights" / "best.pt"
    target_weights = CHECKPOINT_DIR / "yolov8_best.pt"

    if best_weights.exists():
        shutil.copy(best_weights, target_weights)
        logger.info(f"Copied optimal weights from {best_weights} to {target_weights}")

if __name__ == "__main__":
    main()
