import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "../styles/theme.css";

const hours = [
	{ day: "Monday", time: "11:30a.m.–3 a.m" },
	{ day: "Tuesday", time: "11:30a.m.–3 a.m" },
	{ day: "Wednesday", time: "11:30a.m.–3 a.m" },
	{ day: "Thursday", time: "11:30a.m.–3 a.m" },
	{ day: "Friday", time: "11:30a.m.–3 a.m" },
	{ day: "Saturday", time: "11:30a.m.–3 a.m" },
	{ day: "Sunday", time: "11:30a.m.–3 a.m" },
];

export default function OpeningHours() {
	return (
		<Card className="bg-gold-card rounded-2xl shadow-gold-lg border border-gold-light flex flex-col h-full w-full p-0">
			<CardHeader className="w-full px-6 pt-6 pb-3 mb-0 flex-shrink-0">
				<CardTitle
					className="text-2xl sm:text-3xl font-extrabold text-left w-full tracking-tight font-cursive"
					style={{
						background: "var(--gradient-gold)",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						letterSpacing: "0.04em",
					}}
				>
					Opening Hours
				</CardTitle>
			</CardHeader>
			<CardContent className="w-full px-6 pb-6 pt-0 flex-1 flex flex-col justify-center">
				<ul className="w-full">
					{hours.map(({ day, time }) => (
						<li
							key={day}
							className="flex justify-between items-center py-1 border-b border-dotted border-gold last:border-b-0"
						>
							<span className="font-semibold text-black text-base text-left w-1/2">
								{day}
							</span>
							<span className="text-gold-dark text-base font-semibold tracking-wide w-1/2 text-right leading-tight font-sans">
								{time.split("–")[0]}
								<br className="sm:hidden" />
								–{time.split("–")[1]}
							</span>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
