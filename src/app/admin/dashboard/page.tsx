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
        <div className="space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold">Welcome to the Admin Dashboard!</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">450</p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">1,230</p>
                    <p className="text-sm text-green-600">+8% from last month</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">₹45,670</p>
                    <p className="text-sm text-green-600">+15% from last month</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Products</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600">89</p>
                    <p className="text-sm text-gray-500">3 out of stock</p>
                </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4">User Growth</h2>
                    <div className="h-64 sm:h-80">
                        <Bar 
                            data={barData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4">User Status</h2>
                    <div className="h-64 sm:h-80">
                        <Pie 
                            data={pieData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
