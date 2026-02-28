import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { categoryColor, formatCurrency } from "../../utils/format";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseDonutChart({ breakdown = [], total = 0 }) {
  const safe = breakdown.slice(0, 6);
  const data = {
    labels: safe.map((b) => b.category),
    datasets: [
      {
        data: safe.map((b) => b.amount),
        backgroundColor: safe.map((b) => categoryColor(b.category)),
        borderColor: "#FFFFFF",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F172A",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}`,
        },
      },
    },
  };
  return (
    <div data-testid="expense-donut-chart" className="relative h-64 flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-xs text-ink-500 font-medium">Total spent</p>
        <p className="text-2xl font-bold text-ink-900">{formatCurrency(total)}</p>
      </div>
    </div>
  );
}
