import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function SpendingLineChart({ points = [] }) {
  const labels = points.map((p) => p.date);
  const values = points.map((p) => p.amount);
  const data = {
    labels,
    datasets: [
      {
        label: "Daily spend",
        data: values,
        fill: true,
        backgroundColor: (ctx) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return "rgba(16,185,129,0.15)";
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, "rgba(16,185,129,0.25)");
          g.addColorStop(1, "rgba(16,185,129,0)");
          return g;
        },
        borderColor: "#10B981",
        borderWidth: 4,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: "#10B981",
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F172A",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#94A3B8",
          font: { family: "Inter", size: 11 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
        },
      },
      y: {
        grid: { color: "#E2E8F0" },
        ticks: { color: "#94A3B8", font: { family: "Inter", size: 11 } },
      },
    },
  };
  return (
    <div data-testid="spending-line-chart" className="h-64">
      <Line data={data} options={options} />
    </div>
  );
}
