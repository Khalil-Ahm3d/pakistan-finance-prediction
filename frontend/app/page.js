
"use client";

import { useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Upload,
  TrendingUp,
  Database,
  Menu,
  ArrowUpRight
} from "lucide-react";

const stocks = ["OGDC", "HBL", "MEBL", "ENGRO", "KSE100"];
const models = ["LSTM", "GRU", "RNN"];

export default function Home() {
  const [stock, setStock] = useState("OGDC");
  const [model, setModel] = useState("GRU");
  const [mode, setMode] = useState("manual");
  const [file, setFile] = useState(null);
  const [values, setValues] = useState({
    open: "",
    high: "",
    low: "",
    close: "",
    volume: ""
  });
  const [message, setMessage] = useState("");

  const isIndex = stock === "KSE100";

  function updateValue(e) {
    setValues({ ...values, [e.target.name]: e.target.value });
  }

  async function handlePrediction(e) {
    e.preventDefault();
    setMessage("Prediction service will be connected in the next setup step.");
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 border-r border-slate-200 bg-white p-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-600 p-2.5 text-white">
            <Activity size={23} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900">Finance Lab</h1>
            <p className="text-xs text-slate-500">Pakistan Stock Exchange</p>
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
          <p className="text-sm font-semibold">AI Forecasting</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            Three recurrent neural network architectures.
          </p>
        </div>
      </aside>

      <section className="lg:ml-64">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-600 p-2 text-white lg:hidden">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Workspace / Overview</p>
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
                <span className="rounded-lg bg-white/10 px-3 py-2">5 Market Assets</span>
                <span className="rounded-lg bg-white/10 px-3 py-2">3 AI Models</span>
                <span className="rounded-lg bg-white/10 px-3 py-2">60-Session Lookback</span>
              </div>
            </div>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
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
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                      <Icon size={19} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.value}</h3>
                  <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                </div>
              );
            })}
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
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
                  Select a market asset and model architecture.
                </p>
              </div>

              <form onSubmit={handlePrediction} className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Market asset
                    </label>
                    <select
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      {stocks.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Deep learning model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      {models.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Input method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMode("manual")}
                      className={`rounded-xl border p-4 text-left text-sm font-medium ${
                        mode === "manual"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      <Activity size={19} className="mb-2" />
                      Manual entry
                      <p className="mt-1 text-xs font-normal opacity-70">
                        Enter market values
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("csv")}
                      className={`rounded-xl border p-4 text-left text-sm font-medium ${
                        mode === "csv"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      <Upload size={19} className="mb-2" />
                      CSV upload
                      <p className="mt-1 text-xs font-normal opacity-70">
                        Upload market history
                      </p>
                    </button>
                  </div>
                </div>

                {mode === "manual" ? (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-800">
                      Latest market data
                    </h3>
                    {isIndex ? (
                      <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                        KSE-100 uses index-specific historical features.
                        Its input format will be configured separately.
                      </p>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          ["open", "Opening price"],
                          ["high", "Highest price"],
                          ["low", "Lowest price"],
                          ["close", "Closing price"],
                          ["volume", "Trading volume"]
                        ].map(([name, label]) => (
                          <div key={name}>
                            <label className="mb-2 block text-xs font-medium text-slate-600">
                              {label}
                            </label>
                            <input
                              name={name}
                              type="number"
                              step="any"
                              min="0"
                              required
                              value={values[name]}
                              onChange={updateValue}
                              placeholder={`Enter ${label.toLowerCase()}`}
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-slate-800">
                      Upload historical CSV data
                    </label>
                    <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center hover:border-emerald-500">
                      <Upload size={28} className="mb-3 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        {file ? file.name : "Choose a CSV file"}
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        Select your historical market data file
                      </span>
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Generate forecast
                  <ArrowUpRight size={18} />
                </button>

                {message && (
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    {message}
                  </p>
                )}
              </form>
            </section>

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
                {[
                  ["RNN", "Recurrent Neural Network", "Sequential learning"],
                  ["LSTM", "Long Short-Term Memory", "Long-range dependencies"],
                  ["GRU", "Gated Recurrent Unit", "Efficient sequence learning"]
                ].map(([name, full, description]) => (
                  <div key={name} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
                      <BrainCircuit size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">{full}</p>
                      <p className="mt-1 text-xs text-emerald-700">{description}</p>
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
                  <span className="font-semibold text-slate-800">{stock}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Architecture</span>
                  <span className="font-semibold text-slate-800">{model}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Lookback</span>
                  <span className="font-semibold text-slate-800">60 sessions</span>
                </div>
              </div>
            </section>
          </div>

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
