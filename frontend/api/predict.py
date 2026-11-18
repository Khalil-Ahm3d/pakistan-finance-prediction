
import json
import numpy as np
from http.server import BaseHTTPRequestHandler

from model_loader import load_trained_model
from preprocessing import prepare_history


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
                    400, {"error": "Invalid request size"}
                )

            data = json.loads(
                self.rfile.read(content_length)
            )

            asset = str(data.get("asset", "")).upper()
            model_name = str(data.get("model", "")).upper()
            records = data.get("records")

            if not isinstance(records, list):
                return self.send_json(
                    400, {"error": "Historical records are required"}
                )

            # Calculate the exact historical feature sequence.
            history = prepare_history(asset, records)

            # Load the actual trained model and saved scalers.
            trained = load_trained_model(asset, model_name)

            config = trained["config"]
            expected_columns = config["feature_columns"]

            if history["feature_columns"] != expected_columns:
                return self.send_json(
                    400,
                    {"error": "Feature configuration mismatch"}
                )

            features = np.asarray(
                history["features"],
                dtype=np.float64
            )

            if features.shape != tuple(config["input_shape"]):
                return self.send_json(
                    400, {"error": "Incorrect model input shape"}
                )

            # Apply the original training scaler.
            scaled = trained["feature_scaler"].transform(features)

            model_input = scaled.reshape(
                1,
                config["lookback"],
                len(expected_columns)
            )

            # Run the trained model.
            prediction_scaled = trained["model"].predict(
                model_input,
                verbose=0
            )

            prediction = trained["target_scaler"].inverse_transform(
                np.asarray(prediction_scaled).reshape(-1, 1)
            )[0, 0]

            if not np.isfinite(prediction):
                raise ValueError("Model returned an invalid prediction")

            current_close = history["current_close"]

            result = {
                "status": "success",
                "asset": asset,
                "model": model_name,
                "last_historical_date": history["last_date"],
                "predicted_next_day_return": float(prediction),
                "predicted_return_percent": float(prediction * 100),
                "current_close": current_close,
                "estimated_next_close": float(
                    current_close * (1 + prediction)
                ),
                "target": config["target"],
                "disclaimer": "Experimental academic forecast, not guaranteed trading advice."
            }

            return self.send_json(200, result)

        except json.JSONDecodeError:
            return self.send_json(
                400, {"error": "Invalid JSON request"}
            )

        except ValueError as error:
            return self.send_json(
                400, {"error": str(error)}
            )

        except Exception:
            return self.send_json(
                500,
                {
                    "error": "Prediction failed. Check Vercel deployment logs."
                }
            )

    def do_GET(self):
        return self.send_json(
            405, {"error": "Use POST to generate predictions"}
        )

    def do_GET(self):
        return self.send_json(
            405,
            {"error": "Use POST to generate predictions"}
        )
