import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "../styles/theme.css";

const hours = [
	{ day: "Monday", time: "9:00a.m.–9:30p.m" },
	{ day: "Tuesday", time: "9:00a.m.–9:30p.m" },
	{ day: "Wednesday", time: "9:00a.m.–9:30p.m" },
	{ day: "Thursday", time: "9:00a.m.–9:30p.m" },
	{ day: "Friday", time: "9:00a.m.–9:30p.m" },
	{ day: "Saturday", time: "9:00a.m.–9:30p.m" },
	{ day: "Sunday", time: "9:30a.m.–9:30p.m" },
];

export default function OpeningHours() {
	return (
		<Card className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-xl border border-orange-200/60 flex flex-col h-full w-full p-0">
			<CardHeader className="w-full px-6 pt-6 pb-3 mb-0 flex-shrink-0">
				<CardTitle className="text-2xl sm:text-3xl font-extrabold text-left w-full tracking-tight text-orange-600">
					Opening Hours
				</CardTitle>
			</CardHeader>
			<CardContent className="w-full px-6 pb-6 pt-0 flex-1 flex flex-col justify-center">
				<ul className="w-full">
					{hours.map(({ day, time }) => (
						<li
							key={day}
							className="flex justify-between items-center py-2 border-b border-dotted border-orange-200/50 last:border-b-0"
						>
							<span className="font-semibold text-slate-700 text-base text-left w-1/2">
								{day}
							</span>
							<span className="text-slate-600 text-base font-semibold tracking-wide w-1/2 text-right leading-tight font-sans">
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
