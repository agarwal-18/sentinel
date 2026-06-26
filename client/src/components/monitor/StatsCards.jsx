import {
    TrendingUp,
    Gauge,
    ListChecks,
    HeartPulse,
    Clock3,
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";

export default function StatsCards({
    uptime,
    latency,
    checks,
    failures,
    lastChecked,
}) {
    const cards = [
        {
            title: "Uptime",
            value: `${uptime}%`,
            subtitle: "Last 90 days",
            icon: TrendingUp,
            color: "text-green-400",
        },
        {
            title: "Average Latency",
            value: latency != null ? `${latency} ms` : "--",
            subtitle: "Successful requests",
            icon: Gauge,
            color: "text-cyan-400",
        },
        {
            title: "Total Checks",
            value: checks,
            subtitle: `${failures} failed`,
            icon: ListChecks,
            color: "text-violet-400",
        },
        {
            title: "Health",
            value:
                uptime >= 99
                    ? "Excellent"
                    : uptime >= 95
                      ? "Healthy"
                      : uptime >= 90
                        ? "Warning"
                        : "Critical",
            subtitle: "Overall reliability",
            icon: HeartPulse,
            color:
                uptime >= 99
                    ? "text-green-400"
                    : uptime >= 95
                      ? "text-yellow-400"
                      : "text-red-400",
        },
        {
            title: "Last Check",
            value: formatDistanceToNow(new Date(lastChecked), {
                addSuffix: true,
            }),
            subtitle: "Latest ping",
            icon: Clock3,
            color: "text-orange-400",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <Card
                        key={card.title}
                        className="group border-zinc-900 bg-zinc-950 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl"
                    >
                        <CardContent className="flex h-full min-h-[185px] flex-col p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-medium text-muted-foreground">
                                    {card.title}
                                </p>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
                                    <Icon
                                        className={`h-5 w-5 ${card.color}`}
                                    />
                                </div>
                            </div>

                            {/* Main Stat */}
                            <div className="mt-7">
                                <h2 className="break-words text-3xl font-bold leading-tight tracking-tight">
                                    {card.value}
                                </h2>
                            </div>

                            {/* Footer */}
                            <p className="mt-auto pt-5 text-[15px] text-muted-foreground">
                                {card.subtitle}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}