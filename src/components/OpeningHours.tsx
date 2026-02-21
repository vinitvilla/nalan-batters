import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import moment from 'moment';
import "../styles/theme.css";

const hours = [
	{ day: "Monday", time: "9:00 AM – 9:30 PM", isToday: false },
	{ day: "Tuesday", time: "9:00 AM – 9:30 PM", isToday: false },
	{ day: "Wednesday", time: "9:00 AM – 9:30 PM", isToday: false },
	{ day: "Thursday", time: "9:00 AM – 9:30 PM", isToday: false },
	{ day: "Friday", time: "9:00 AM – 9:30 PM", isToday: false },
	{ day: "Saturday", time: "9:00 AM – 9:30 PM", isToday: false },
	{ day: "Sunday", time: "9:30 AM – 9:30 PM", isToday: false },
];

// Get current day to highlight today's hours
const getCurrentDay = () => {
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	return days[moment().day()];
};

export default function OpeningHours() {
	const currentDay = getCurrentDay();
	const hoursWithToday = hours.map(hour => ({
		...hour,
		isToday: hour.day === currentDay
	}));

	// Check if currently open
	const isCurrentlyOpen = () => {
		const now = moment();
		const currentTime = now.hour() + now.minute() / 60;

		const todayHours = hoursWithToday.find(h => h.isToday);
		if (!todayHours) return false;

		// Simple check - open between 9AM and 9:30PM (most days)
		const openTime = todayHours.day === 'Sunday' ? 9.5 : 9; // 9:30 AM on Sunday, 9 AM other days
		const closeTime = 21.5; // 9:30 PM

		return currentTime >= openTime && currentTime <= closeTime;
	};

	const isOpen = isCurrentlyOpen();

	return (
		<Card className="h-full bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
			<CardHeader className="pb-4 relative">
				{/* Background decoration */}
				<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full -translate-y-6 translate-x-6"></div>

				<div className="relative">
					<CardTitle className="text-2xl font-bold flex items-center gap-2 mb-2 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
						style={{ fontFamily: "'Dancing Script', cursive" }}>
						<div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center">
							<Clock className="w-4 h-4 text-white" />
						</div>
						Opening Hours
					</CardTitle>

					{/* Status Badge */}
					<div className="flex items-center gap-2">
						<div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${isOpen
								? 'bg-green-100 text-green-700 border border-green-200'
								: 'bg-red-100 text-red-700 border border-red-200'
							}`}>
							<div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
							{isOpen ? 'Open Now' : 'Closed'}
						</div>
						<div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
							<Calendar className="w-3 h-3" />
							Today
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-2">
				<div className="space-y-1">
					{hoursWithToday.map(({ day, time, isToday }) => (
						<div
							key={day}
							className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${isToday
									? 'bg-amber-100/80 border border-amber-200 shadow-sm'
									: 'bg-white/50 hover:bg-white/70'
								}`}
						>
							<div className="flex items-center gap-3">
								{isToday && (
									<div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
								)}
								<span className={`font-semibold text-sm ${isToday ? 'text-amber-800' : 'text-gray-700'
									}`}>
									{day}
								</span>
							</div>
							<span className={`text-sm font-medium ${isToday ? 'text-amber-700' : 'text-gray-600'
								}`}>
								{time}
							</span>
						</div>
					))}
				</div>

				{/* Footer info */}
				<div className="mt-4 pt-3 border-t border-amber-200/50">
					<p className="text-xs text-amber-600/80 text-center flex items-center justify-center gap-1">
						<Clock className="w-3 h-3" />
						We&apos;re here to serve you fresh batters daily!
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
