import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export default function LineChart({ labels, values, title }) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: title,
            data: values,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.4,
          },
        ],
      }}
    />
  );
}
