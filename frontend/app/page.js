
"use client";

import { useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Upload,
  TrendingUp,
  Database,
  ArrowUpRight,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

const stocks = ["OGDC", "HBL", "MEBL", "ENGRO", "KSE100"];
const models = ["LSTM", "GRU", "RNN"];

export default function Home() {
  const [stock, setStock] = useState("OGDC");
  const [model, setModel] = useState("GRU");
  const [mode, setMode] = useState("csv");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const isIndex = stock === "KSE100";

  function resetResult() {
    setMessage("");
    setResult(null);
  }

  function handleAssetChange(value) {
    setStock(value);
    setFile(null);
    resetResult();
  }

  function handleModelChange(value) {
    setModel(value);
    resetResult();
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
    resetResult();
  }

  async function handlePrediction(event) {
    event.preventDefault();

    setMessage("");
    setResult(null);

    if (mode !== "csv") {
      setMessage(
        "Manual historical data entry is being prepared. Please use file upload for now."
      );
      return;
    }

    if (!file) {
      setMessage("Please select a financial data file first.");
      return;
    }

    const extension = file.name.split(".").pop().toLowerCase();
    const allowedExtensions = ["csv", "xlsx", "xls", "pdf"];

    if (!allowedExtensions.includes(extension)) {
      setMessage(
        "Unsupported file. Please upload CSV, XLSX, XLS, or PDF."
      );
      return;
    }

    if (file.size === 0) {
      setMessage("The selected file is empty.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("The maximum file size is 10 MB.");
      return;
    }

    setLoading(true);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";

      for (let i = 0; i < bytes.length; i += 32768) {
        binary += String.fromCharCode(
          ...bytes.subarray(i, i + 32768)
        );
      }

      const contentBase64 = btoa(binary);

      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          asset: stock,
          model,
          file: {
            filename: file.name,
            content_base64: contentBase64
          }
        })
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(
          data.message || "Unable to generate prediction."
        );
      }

      setResult(data);
      setMessage("Prediction generated successfully.");

    } catch (error) {
      setMessage(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const architectures = [
    ["RNN", "Recurrent Neural Network", "Sequential learning"],
    ["LSTM", "Long Short-Term Memory", "Long-range dependencies"],
    ["GRU", "Gated Recurrent Unit", "Efficient sequence learning"]
  ];

  const stats = [
    {
      label: "Market Coverage",
      value: "05",
      detail: "PSX assets",
      icon: BarChart3
    },
    {
      label: "Model Architectures",
      value: "03",
      detail: "RNN · LSTM · GRU",
      icon: BrainCircuit
    },
    {
      label: "Sequence Length",
      value: "60",
      detail: "Trading sessions",
      icon: Activity
    },
    {
      label: "Model Storage",
      value: "Hugging Face",
      detail: "Private model repository",
      icon: Database
    }
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fb]">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 border-r border-slate-200 bg-white p-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-600 p-2.5 text-white">
            <Activity size={23} />
          </div>

          <div>
            <h1 className="font-bold text-slate-900">
              Finance Lab
            </h1>
            <p className="text-xs text-slate-500">
              Pakistan Stock Exchange
            </p>
          </div>
        </div>

        <div className="mt-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-emerald-700">
            <BarChart3 size={19} />
            Prediction Dashboard
          </div>
        </div>

        <div className="absolute bottom-7 left-6 right-6 rounded-2xl bg-slate-900 p-4 text-white">
          <BrainCircuit size={22} className="mb-3 text-emerald-400" />

          <p className="text-sm font-semibold">
            AI Forecasting
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-300">
            Three recurrent neural network architectures.
          </p>
        </div>
      </aside>

      {/* Main workspace */}
      <section className="lg:ml-64">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-600 p-2 text-white lg:hidden">
              <Activity size={20} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Workspace / Overview
              </p>

              <h2 className="text-lg font-bold text-slate-900">
                Prediction Dashboard
              </h2>
            </div>
          </div>

          <div className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">
            <span className="text-emerald-600">●</span> Model Lab
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-5 sm:p-8">

          {/* Hero */}
          <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#102c2b] to-[#123e37] p-6 text-white sm:p-9">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-emerald-200">
                <Activity size={14} />
                Pakistan Finance Prediction Lab
              </div>

              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                Understand the market.
                <br />
                Explore the next move.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Explore next-session return forecasts using trained RNN,
                LSTM and GRU deep learning models for selected PSX assets.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-lg bg-white/10 px-3 py-2">
                  5 Market Assets
                </span>
                <span className="rounded-lg bg-white/10 px-3 py-2">
                  3 AI Models
                </span>
                <span className="rounded-lg bg-white/10 px-3 py-2">
                  60-Session Lookback
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {item.label}
                    </p>

                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                      <Icon size={19} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {item.value}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Prediction workspace */}
          <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">

            {/* Prediction form */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2 text-emerald-700">
                  <TrendingUp size={19} />

                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Forecast configuration
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Generate a prediction
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a market asset, model, and historical financial data.
                </p>
              </div>

              <form onSubmit={handlePrediction} className="space-y-6">

                {/* Asset and model */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Market asset
                    </label>

                    <select
                      value={stock}
                      onChange={(e) => handleAssetChange(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      {stocks.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Deep learning model
                    </label>

                    <select
                      value={model}
                      onChange={(e) => handleModelChange(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      {models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Input method */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Input method
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("manual");
                        resetResult();
                      }}
                      disabled={loading}
                      className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                        mode === "manual"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Activity size={19} className="mb-2" />
                      Manual entry

                      <p className="mt-1 text-xs font-normal opacity-70">
                        Enter market history
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode("csv");
                        resetResult();
                      }}
                      disabled={loading}
                      className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                        mode === "csv"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Upload size={19} className="mb-2" />
                      File upload

                      <p className="mt-1 text-xs font-normal opacity-70">
                        CSV, Excel or PDF
                      </p>
                    </button>
                  </div>
                </div>

                {/* Manual mode */}
                {mode === "manual" ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="shrink-0 text-amber-600" size={20} />

                      <div>
                        <h3 className="text-sm font-semibold text-amber-900">
                          Historical data required
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-amber-800">
                          Each model requires 60 trading sessions of historical
                          financial data. The current single-day manual form
                          cannot generate a valid prediction. Historical
                          manual entry will be added in a later step.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-slate-800">
                      Upload historical financial data
                    </label>

                    <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition hover:border-emerald-500 hover:bg-emerald-50/40">
                      <Upload size={30} className="mb-3 text-emerald-600" />

                      <span className="text-sm font-semibold text-slate-700">
                        {file ? file.name : "Choose a financial data file"}
                      </span>

                      <span className="mt-2 text-xs text-slate-500">
                        CSV, XLSX, XLS or PDF
                      </span>

                      <span className="mt-1 text-xs text-slate-400">
                        Maximum file size: 10 MB
                      </span>

                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls,.pdf"
                        className="hidden"
                        disabled={loading}
                        onChange={handleFileChange}
                      />
                    </label>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="mb-3 text-xs font-semibold text-slate-700">
                        Required financial columns
                      </p>

                      {isIndex ? (
                        <p className="text-xs leading-6 text-slate-600">
                          <span className="font-medium">KSE100:</span>{" "}
                          Date, Close
                        </p>
                      ) : (
                        <p className="text-xs leading-6 text-slate-600">
                          <span className="font-medium">{stock}:</span>{" "}
                          Date, Open, High, Low, Close, Volume
                        </p>
                      )}

                      <p className="mt-2 text-xs text-slate-500">
                        At least 60 valid historical sessions are required
                        after feature preparation.
                      </p>
                    </div>

                    {file && (
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          resetResult();
                        }}
                        className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove selected file
                      </button>
                    )}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing financial data...
                    </>
                  ) : (
                    <>
                      Generate forecast
                      <ArrowUpRight size={18} />
                    </>
                  )}
                </button>

                {/* Message */}
                {message && (
                  <div
                    className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
                      result
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {result ? (
                      <CheckCircle2 size={18} className="shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="shrink-0" />
                    )}

                    <p>{message}</p>
                  </div>
                )}

              </form>
            </section>

            {/* Model information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Model information
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  Available architectures
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose the model that you want to evaluate.
                </p>
              </div>

              <div className="space-y-3">
                {architectures.map(([name, full, description]) => (
                  <div
                    key={name}
                    className={`flex items-center gap-3 rounded-xl border p-4 ${
                      model === name
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
                      <BrainCircuit size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {full}
                      </p>

                      <p className="mt-1 text-xs text-emerald-700">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Selected configuration
                </h3>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Asset</span>
                  <span className="font-semibold text-slate-800">
                    {stock}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Architecture</span>
                  <span className="font-semibold text-slate-800">
                    {model}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Lookback</span>
                  <span className="font-semibold text-slate-800">
                    60 sessions
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Prediction result */}
          {result && (
            <section className="mt-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <TrendingUp size={23} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Prediction result
                  </p>

                  <h2 className="text-xl font-bold text-slate-900">
                    {result.asset} next-session forecast
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-xs text-slate-500">
                    Predicted next-day return
                  </p>

                  <p className={`mt-2 text-2xl font-bold ${
                    result.predicted_next_day_return_percent >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}>
                    {Number(
                      result.predicted_next_day_return_percent
                    ).toFixed(4)}%
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-xs text-slate-500">
                    Current closing price
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {Number(result.current_close).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 4 }
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-xs text-slate-500">
                    Estimated next close
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {Number(result.estimated_next_close).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 4 }
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                <span>Model: {result.model}</span>
                <span>Asset: {result.asset}</span>
                <span>Last data date: {result.last_data_date}</span>
              </div>

              <p className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                {result.disclaimer}
              </p>
            </section>
          )}

          {/* Footer */}
          <footer className="mt-8 border-t border-slate-200 py-6 text-center text-xs leading-6 text-slate-500">
            <p className="font-semibold text-slate-700">
              Pakistan Finance Prediction Lab · Developed by Khalil
            </p>

            <p className="mt-1">
              Academic research project. Forecasts are experimental and are
              not guaranteed trading advice.
            </p>
          </footer>

        </div>
      </section>
    </main>
  );
}
