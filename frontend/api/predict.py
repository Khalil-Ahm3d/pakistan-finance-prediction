
import json
import numpy as np
from http.server import BaseHTTPRequestHandler

from model_loader import load_trained_model


class handler(BaseHTTPRequestHandler):

    def send_json(self, status, data):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_POST(self):
        try:
            content_length = int(
                self.headers.get("Content-Length", 0)
            )

            if content_length <= 0 or content_length > 5_000_000:
                return self.send_json(
                    400,
                    {"error": "Invalid request size"}
                )

            body = self.rfile.read(content_length)
            data = json.loads(body)

            asset = str(data.get("asset", "")).upper()
            model_name = str(data.get("model", "")).upper()
            features = data.get("features")
            current_close = data.get("current_close")

            if not isinstance(features, list):
                return self.send_json(
                    400,
                    {"error": "Features must be a list"}
                )

            trained = load_trained_model(asset, model_name)

            config = trained["config"]
            expected_features = len(
                config["feature_columns"]
            )

            if len(features) != 60:
                return self.send_json(
                    400,
                    {"error": "Exactly 60 sessions are required"}
                )

            array = np.asarray(features, dtype=np.float64)

            if array.shape != (60, expected_features):
                return self.send_json(
                    400,
                    {
                        "error": "Incorrect feature shape",
                        "expected": [60, expected_features]
                    }
                )

            if not np.isfinite(array).all():
                return self.send_json(
                    400,
                    {"error": "Features contain invalid numbers"}
                )

            scaled = trained[
                "feature_scaler"
            ].transform(array)

            model_input = scaled.reshape(
                1, 60, expected_features
            )

            prediction_scaled = trained[
                "model"
            ].predict(model_input, verbose=0)

            prediction = trained[
                "target_scaler"
            ].inverse_transform(
                np.asarray(prediction_scaled).reshape(-1, 1)
            )[0, 0]

            result = {
                "status": "success",
                "asset": asset,
                "model": model_name,
                "predicted_next_day_return": float(prediction),
                "predicted_return_percent": float(
                    prediction * 100
                ),
                "target": config["target"]
            }

            if current_close is not None:
                current_close = float(current_close)

                if not np.isfinite(current_close) or current_close <= 0:
                    return self.send_json(
                        400,
                        {"error": "Invalid current closing price"}
                    )

                result["current_close"] = current_close
                result["estimated_next_close"] = float(
                    current_close * (1 + prediction)
                )

            return self.send_json(200, result)

        except json.JSONDecodeError:
            return self.send_json(
                400,
                {"error": "Invalid JSON request"}
            )

        except ValueError as error:
            return self.send_json(
                400,
                {"error": str(error)}
            )

        except Exception:
            return self.send_json(
                500,
                {
                    "error": "Prediction failed. Check model configuration and deployment logs."
                }
            )

    def do_GET(self):
        return self.send_json(
            405,
            {"error": "Use POST to generate predictions"}
        )
