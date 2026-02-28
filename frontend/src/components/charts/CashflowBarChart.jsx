import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CashflowBarChart({ data = [] }) {
  const labels = data.map((d) => d.label);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Income",
        data: data.map((d) => d.income),
        backgroundColor: "#10B981",
        borderRadius: 12,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
      {
        label: "Expense",
        data: data.map((d) => d.expense),
        backgroundColor: "#86EFAC",
        borderRadius: 12,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: "circle",
          color: "#475569",
          font: { family: "Inter", size: 12, weight: "600" },
        },
      },
      tooltip: {
        backgroundColor: "#0F172A",
        padding: 12,
        titleFont: { family: "Inter", weight: "600" },
        bodyFont: { family: "Inter" },
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94A3B8", font: { family: "Inter", size: 12 } },
      },
      y: {
        grid: { color: "#E2E8F0", drawBorder: false },
        ticks: {
          color: "#94A3B8",
          font: { family: "Inter", size: 11 },
          callback: (v) => `$${v / 1000}k`,
        },
      },
    },
  };
  return (
    <div data-testid="cashflow-chart" className="h-72">
      <Bar data={chartData} options={options} />
    </div>
  );
}
