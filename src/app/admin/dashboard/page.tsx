"use client";
import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
        {
            label: "Users",
            data: [120, 190, 170, 210, 250, 300],
            backgroundColor: "#6366f1",
        },
    ],
};

const pieData = {
    labels: ["Active", "Inactive", "Pending"],
    datasets: [
        {
            label: "User Status",
            data: [300, 50, 100],
            backgroundColor: ["#10b981", "#f59e42", "#6366f1"],
        },
    ],
};

export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Welcome to the Admin Dashboard!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">User Growth</h2>
                    <Bar data={barData} />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">User Status</h2>
                    <Pie data={pieData} />
                </div>
            </div>
        </div>
    );
}
