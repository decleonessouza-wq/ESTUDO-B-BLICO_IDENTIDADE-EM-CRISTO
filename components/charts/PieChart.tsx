import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ labels, values }) {
  return (
    <Pie
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              "#3b82f6",
              "#10b981",
              "#8b5cf6",
              "#f59e0b",
              "#ef4444",
            ],
          },
        ],
      }}
    />
  );
}
