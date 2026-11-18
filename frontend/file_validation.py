
import io
import re
from pathlib import Path

import pandas as pd


STOCK_COLUMNS = [
    "date", "open", "high", "low", "close", "volume"
]

INDEX_COLUMNS = ["date", "close"]

COLUMN_ALIASES = {
    "date": ["date", "trading date", "trade date", "datetime"],
    "open": ["open", "opening price", "open price"],
    "high": ["high", "highest price", "high price"],
    "low": ["low", "lowest price", "low price"],
    "close": ["close", "closing price", "close price", "last"],
    "volume": ["volume", "vol", "traded volume", "shares traded"],
    "symbol": ["symbol", "ticker", "stock symbol"],
}


def normalize_header(value):
    value = str(value).strip().lower()
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return value.strip()


def normalize_columns(df):
    rename = {}

    for column in df.columns:
        normalized = normalize_header(column)

        for standard, aliases in COLUMN_ALIASES.items():
            if normalized == standard or normalized in aliases:
                rename[column] = standard
                break

    return df.rename(columns=rename)


def table_from_pdf(pdf_bytes):
    import pdfplumber

    tables = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables() or []:
                if not table or len(table) < 2:
                    continue

                headers = table[0]
                rows = table[1:]

                if not headers:
                    continue

                df = pd.DataFrame(rows, columns=headers)
                df = normalize_columns(df)

                if "date" in df.columns and "close" in df.columns:
                    tables.append(df)

    if not tables:
        raise ValueError(
            "No readable financial data table found in this PDF."
        )

    return pd.concat(tables, ignore_index=True)


def read_uploaded_file(filename, file_bytes):
    extension = Path(filename).suffix.lower()

    if not file_bytes:
        raise ValueError("The uploaded file is empty.")

    if extension == ".csv":
        try:
            return pd.read_csv(io.BytesIO(file_bytes))
        except Exception:
            raise ValueError("The CSV file could not be read.")

    if extension in [".xlsx", ".xls"]:
        try:
            sheets = pd.read_excel(
                io.BytesIO(file_bytes),
                sheet_name=None
            )

            candidates = []

            for sheet in sheets.values():
                sheet = normalize_columns(sheet)

                if "date" in sheet.columns and "close" in sheet.columns:
                    candidates.append(sheet)

            if not candidates:
                raise ValueError(
                    "No financial data table found in the Excel workbook."
                )

            return max(candidates, key=len)

        except ValueError:
            raise
        except Exception:
            raise ValueError("The Excel file could not be read.")

    if extension == ".pdf":
        return table_from_pdf(file_bytes)

    raise ValueError(
        "Unsupported file type. Upload CSV, XLSX, XLS, or PDF."
    )


def validate_financial_data(df, asset):
    asset = asset.upper()

    if asset not in {"OGDC", "HBL", "MEBL", "ENGRO", "KSE100"}:
        raise ValueError("Unsupported financial asset.")

    df = normalize_columns(df.copy())

    required = (
        INDEX_COLUMNS if asset == "KSE100"
        else STOCK_COLUMNS
    )

    missing = [col for col in required if col not in df.columns]

    if missing:
        raise ValueError(
            "This file is not valid for the selected asset. "
            "Missing financial columns: " + ", ".join(missing)
        )

    if "symbol" in df.columns:
        symbols = (
            df["symbol"]
            .dropna()
            .astype(str)
            .str.upper()
            .str.strip()
            .unique()
        )

        if len(symbols) > 0:
            allowed = {asset}

            if asset == "KSE100":
                allowed.update({"KSE-100", "^KSE100"})

            if not set(symbols).issubset(allowed):
                raise ValueError(
                    "The file contains a different financial symbol "
                    "than the selected asset."
                )

    df = df[required].copy()

    for column in required:
        df[column] = df[column].astype(str).str.strip()

    df = df.replace({"": None, "nan": None, "None": None})
    df = df.dropna(how="all")

    if df.empty:
        raise ValueError("No financial records were found.")

    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    if df["date"].isna().any():
        raise ValueError("Some financial records have invalid dates.")

    numeric_columns = [c for c in required if c != "date"]

    for column in numeric_columns:
        cleaned = (
            df[column]
            .astype(str)
            .str.replace(",", "", regex=False)
            .str.replace("$", "", regex=False)
            .str.strip()
        )

        df[column] = pd.to_numeric(cleaned, errors="coerce")

        if df[column].isna().any():
            raise ValueError(
                f"The {column} column contains non-numeric values."
            )

        if not df[column].map(
            lambda x: pd.notna(x) and abs(x) != float("inf")
        ).all():
            raise ValueError(
                f"The {column} column contains invalid numbers."
            )

    price_columns = (
        ["close"] if asset == "KSE100"
        else ["open", "high", "low", "close"]
    )

    for column in price_columns:
        if (df[column] <= 0).any():
            raise ValueError(
                f"The {column} prices must be greater than zero."
            )

    if asset != "KSE100":
        if (df["volume"] < 0).any():
            raise ValueError("Trading volume cannot be negative.")

        if (df["high"] < df["low"]).any():
            raise ValueError("High price cannot be below low price.")

        if (
            (df["high"] < df["open"]) |
            (df["high"] < df["close"]) |
            (df["low"] > df["open"]) |
            (df["low"] > df["close"])
        ).any():
            raise ValueError(
                "The OHLC prices are inconsistent."
            )

    df = df.sort_values("date")
    df = df.drop_duplicates(subset=["date"], keep="last")

    return [
        {
            "date": row["date"].strftime("%Y-%m-%d"),
            **{
                column: float(row[column])
                for column in numeric_columns
            }
        }
        for _, row in df.iterrows()
    ]


def process_uploaded_file(filename, file_bytes, asset):
    dataframe = read_uploaded_file(filename, file_bytes)
    return validate_financial_data(dataframe, asset)
