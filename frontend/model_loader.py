
import os
import json
import pickle
from pathlib import Path
from functools import lru_cache

import tensorflow as tf
from huggingface_hub import snapshot_download


REPO_ID = os.getenv(
    "HF_REPO_ID",
    "khalilahmed0062/pakistan-finance-prediction-lab"
)

VALID_ASSETS = {"OGDC", "HBL", "MEBL", "ENGRO", "KSE100"}
VALID_MODELS = {"RNN", "LSTM", "GRU"}


@lru_cache(maxsize=15)
def load_trained_model(asset, model_name):
    asset = asset.upper()
    model_name = model_name.upper()

    if asset not in VALID_ASSETS:
        raise ValueError("Invalid market asset")

    if model_name not in VALID_MODELS:
        raise ValueError("Invalid model architecture")

    token = os.getenv("HF_TOKEN")

    if not token:
        raise RuntimeError("Hugging Face access token is missing")

    repository_path = snapshot_download(
        repo_id=REPO_ID,
        repo_type="model",
        token=token,
        allow_patterns=[
            f"deployment_artifacts/{asset}/*"
        ],
        cache_dir="/tmp/hf-model-cache"
    )

    asset_dir = (
        Path(repository_path)
        / "deployment_artifacts"
        / asset
    )

    config_path = asset_dir / "config.json"
    model_path = asset_dir / f"{model_name}.keras"
    feature_scaler_path = asset_dir / "feature_scaler.pkl"
    target_scaler_path = asset_dir / "target_scaler.pkl"

    for path in [
        config_path,
        model_path,
        feature_scaler_path,
        target_scaler_path
    ]:
        if not path.exists():
            raise FileNotFoundError(
                f"Required model artifact is missing: {path.name}"
            )

    with open(config_path, "r", encoding="utf-8") as file:
        config = json.load(file)

    if model_name not in config["available_models"]:
        raise ValueError("Model is not available for this asset")

    expected_features = len(config["feature_columns"])
    expected_shape = config["input_shape"]

    if expected_shape != [60, expected_features]:
        raise ValueError("Unexpected model input configuration")

    model = tf.keras.models.load_model(
        str(model_path),
        compile=False
    )

    with open(feature_scaler_path, "rb") as file:
        feature_scaler = pickle.load(file)

    with open(target_scaler_path, "rb") as file:
        target_scaler = pickle.load(file)

    return {
        "model": model,
        "feature_scaler": feature_scaler,
        "target_scaler": target_scaler,
        "config": config
    }
