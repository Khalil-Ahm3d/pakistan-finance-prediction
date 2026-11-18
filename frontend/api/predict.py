
import base64
import json

import numpy as np
import pandas as pd
from http.server import BaseHTTPRequestHandler

from model_loader import load_trained_model
from preprocessing import prepare_history
from file_validation import (
    process_uploaded_file,
    validate_financial_data,
)


# Vercel request limit is approximately 4.5 MB.
# A 3 MB file becomes larger after Base64 encoding.
MAX_REQUEST_BYTES = int(4.4 * 1024 * 1024)

VALID_ASSETS = {"OGDC", "HBL", "MEBL", "ENGRO", "KSE100"}
VALID_MODELS = {"RNN", "LSTM", "GRU"}


class handler(BaseHTTPRequestHandler):

    def send_json(self, status, data):
        response = json.dumps(data).encode("utf-8")

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))

            if length <= 0:
                raise ValueError("The request is empty.")

            if length > MAX_REQUEST_BYTES:
                raise ValueError(
                    "Request is too large. Please use a financial "
                    "file smaller than 3 MB."
                )

            body = self.rfile.read(length)
            payload = json.loads(body)

            asset = str(payload.get("asset", "")).upper()
            model_name = str(payload.get("model", "")).upper()

            if asset not in VALID_ASSETS:
                raise ValueError("Select a supported financial asset.")

            if model_name not in VALID_MODELS:
                raise ValueError("Select RNN, LSTM, or GRU.")

            # Uploaded file: CSV, Excel, or PDF
            if "file" in payload:
                uploaded = payload["file"]

                filename = uploaded.get("filename", "")
                encoded = uploaded.get("content_base64", "")

                if not filename or not encoded:
                    raise ValueError("Uploaded file is incomplete.")

                try:
                    file_bytes = base64.b64decode(
                        encoded,
                        validate=True
                    )
                except Exception:
                    raise ValueError("Uploaded file encoding is invalid.")

                if len(file_bytes) > 3 * 1024 * 1024:
                    raise ValueError(
                        "The uploaded financial file exceeds the 3 MB limit."
                    )

                records = process_uploaded_file(
                    filename,
                    file_bytes,
                    asset
                )

            # Manual financial history
            elif "records" in payload:
                records = validate_financial_data(
                    pd.DataFrame(payload["records"]),
                    asset
                )

            else:
                raise ValueError(
                    "Provide a financial data file or financial records."
                )

            # Prepare the financial history.
            features, feature_columns, current_close, last_date = (
                prepare_history(asset, records)
            )

            trained = load_trained_model(asset, model_name)
            config = trained["config"]

            if feature_columns != config["feature_columns"]:
                raise ValueError(
                    "Financial feature definitions do not match "
                    "the trained model."
                )

            lookback = int(config["lookback"])
            expected_features = len(config["feature_columns"])

            if features.shape != (lookback, expected_features):
                raise ValueError(
                    "Financial history has an incorrect input shape."
                )

            scaled_features = trained["feature_scaler"].transform(
                features
            )

            model_input = scaled_features.reshape(
                1,
                lookback,
                expected_features
            )

            scaled_prediction = trained["model"].predict(
                model_input,
                verbose=0
            )

            predicted_return = trained["target_scaler"].inverse_transform(
                np.asarray(scaled_prediction).reshape(-1, 1)
            )[0][0]

            if not np.isfinite(predicted_return):
                raise ValueError(
                    "The model produced an invalid prediction."
                )

            estimated_close = current_close * (1 + predicted_return)

            self.send_json(200, {
                "status": "success",
                "asset": asset,
                "model": model_name,
                "last_data_date": last_date,
                "current_close": float(current_close),
                "predicted_next_day_return_percent": float(
                    predicted_return * 100
                ),
                "estimated_next_close": float(estimated_close),
                "disclaimer": (
                    "Experimental academic prediction, not "
                    "investment advice."
                )
            })

        except ValueError as error:
            self.send_json(400, {
                "status": "error",
                "message": str(error)
            })

        except Exception:
            self.send_json(500, {
                "status": "error",
                "message": (
                    "Prediction service encountered an error. "
                    "Please check the financial data and try again."
                )
            })
