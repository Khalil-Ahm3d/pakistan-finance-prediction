
import "./globals.css";

export const metadata = {
  title: "Pakistan Finance Prediction Lab",
  description:
    "AI-powered stock market forecasting for Pakistan Stock Exchange using RNN, LSTM and GRU models."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
