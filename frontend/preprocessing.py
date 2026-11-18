
import numpy as np
import pandas as pd


STOCK_FEATURES = [
    "daily_return",
    "overnight_gap",
    "intraday_return",
    "high_low_range",
    "volume_ratio",
    "sma20_distance",
    "sma50_distance",
    "volatility20",
    "rsi14"
]

INDEX_FEATURES = [
    "daily_return",
    "momentum_5",
    "momentum_10",
    "sma20_distance",
    "sma50_distance",
    "volatility20",
    "volatility60",
    "rsi14"
]


def calculate_rsi(close, period=14):
    delta = close.diff()

    gains = delta.clip(lower=0)
    losses = -delta.clip(upper=0)

    average_gain = gains.rolling(period).mean()
    average_loss = losses.rolling(period).mean()

    rs = average_gain / average_loss

    rsi = 100 - (100 / (1 + rs))

    rsi = rsi.mask(
        (average_loss == 0) & (average_gain > 0),
        100
    )

    rsi = rsi.mask(
        (average_loss == 0) & (average_gain == 0),
        50
    )

    return rsi


def prepare_history(asset, records):
    asset = asset.upper()

    if asset not in {"OGDC", "HBL", "MEBL", "ENGRO", "KSE100"}:
        raise ValueError("Unsupported market asset")

    if not isinstance(records, list) or len(records) < 1:
        raise ValueError("Historical records are required")

    df = pd.DataFrame(records)

    if "date" not in df.columns:
        raise ValueError("CSV must contain a date column")

    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    df = (
        df.dropna(subset=["date"])
        .sort_values("date")
        .drop_duplicates(subset=["date"], keep="last")
        .reset_index(drop=True)
    )

    if asset == "KSE100":
        required = ["close"]
        features = INDEX_FEATURES
    else:
        required = ["open", "high", "low", "close", "volume"]
        features = STOCK_FEATURES

    missing = [column for column in required if column not in df.columns]

    if missing:
        raise ValueError(
            f"Missing required columns: {', '.join(missing)}"
        )

    for column in required:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    if asset == "KSE100":
        close = df["close"]

        df["daily_return"] = close.pct_change()
        df["momentum_5"] = close / close.shift(5) - 1
        df["momentum_10"] = close / close.shift(10) - 1
        df["sma20_distance"] = close / close.rolling(20).mean() - 1
        df["sma50_distance"] = close / close.rolling(50).mean() - 1
        df["volatility20"] = df["daily_return"].rolling(20).std()
        df["volatility60"] = df["daily_return"].rolling(60).std()
        df["rsi14"] = calculate_rsi(close)

    else:
        close = df["close"]
        previous_close = close.shift(1)

        df["daily_return"] = close.pct_change()
        df["overnight_gap"] = df["open"] / previous_close - 1
        df["intraday_return"] = close / df["open"] - 1
        df["high_low_range"] = (
            df["high"] - df["low"]
        ) / previous_close

        df["volume_ratio"] = (
            df["volume"] / df["volume"].rolling(20).mean()
        )

        df["sma20_distance"] = (
            close / close.rolling(20).mean() - 1
        )

        df["sma50_distance"] = (
            close / close.rolling(50).mean() - 1
        )

        df["volatility20"] = df["daily_return"].rolling(20).std()
        df["rsi14"] = calculate_rsi(close)

    df[features] = df[features].replace(
        [np.inf, -np.inf], np.nan
    )

    df = df.dropna(subset=features).reset_index(drop=True)

    if len(df) < 60:
        raise ValueError(
            "At least 60 valid feature sessions are required. "
            "Upload more historical data."
        )

    latest = df.tail(60)

    feature_array = latest[features].to_numpy(dtype=np.float64)

    if not np.isfinite(feature_array).all():
        raise ValueError("Historical data contains invalid features")

    return {
        "features": feature_array.tolist(),
        "feature_columns": features,
        "current_close": float(latest["close"].iloc[-1]),
        "last_date": latest["date"].iloc[-1].strftime("%Y-%m-%d")
    }
