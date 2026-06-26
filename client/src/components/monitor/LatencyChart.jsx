import { Activity, AlertTriangle } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from "recharts";

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;

    const point = payload[0].payload;

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 shadow-xl">
            <p className="mb-2 text-sm text-muted-foreground">
                {point.fullTime}
            </p>

            {point.down ? (
                <p className="font-medium text-red-400">
                    Monitor Unreachable
                </p>
            ) : (
                <p className="text-sm">
                    Latency
                    <span className="ml-2 font-semibold text-green-400">
                        {point.actualLatency} ms
                    </span>
                </p>
            )}
        </div>
    );
}

export default function LatencyChart({ chartData }) {
    const hasData = chartData.some((point) => point.latency !== null);

    const latencies = chartData
        .filter((p) => p.latency !== null)
        .map((p) => p.latency)
        .sort((a, b) => a - b);

    const percentile90 =
        latencies[Math.floor(latencies.length * 0.9)] ?? 1000;

    const yMax = Math.max(1000, percentile90 * 1.2);

    const failures = chartData.filter((point) => point.down);

    return (
        <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-green-400" />
                        Response Time
                    </CardTitle>

                    <p className="mt-1 text-[15px] text-muted-foreground">
                        Last 50 successful health checks
                    </p>
                </div>
            </CardHeader>

            <CardContent>
                {!hasData ? (
                    <div className="flex h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800">
                        <AlertTriangle className="mb-4 h-10 w-10 text-yellow-500" />

                        <h3 className="text-lg font-semibold">
                            No Response Data
                        </h3>

                        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
                            Once successful health checks are recorded, latency
                            trends will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="h-[240px] sm:h-[320px] lg:h-[360px]">
                        <ResponsiveContainer>
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 16,
                                    left: 8,
                                    bottom: 18,
                                }}
                            >
                                <CartesianGrid
                                    vertical={false}
                                    stroke="#27272a"
                                    strokeDasharray="4 4"
                                />

                                <XAxis
                                    dataKey="time"
                                    interval="preserveStartEnd"
                                    minTickGap={60}
                                    tick={{
                                        fill: "#a1a1aa",
                                        fontSize: 12,
                                        fontWeight: 500,
                                    }}
                                    tickMargin={12}
                                    axisLine={{
                                        stroke: "#3f3f46",
                                    }}
                                    tickLine={false}
                                />

                                <YAxis
                                    width={55}
                                    domain={[
                                        0,
                                        (dataMax) =>
                                            Math.max(yMax, dataMax),
                                    ]}
                                    tick={{
                                        fill: "#a1a1aa",
                                        fontSize: 12,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    unit="ms"
                                />

                                <Tooltip content={<CustomTooltip />} />

                                <Line
                                    type="monotone"
                                    dataKey="latency"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{
                                        r: 6,
                                        strokeWidth: 2,
                                    }}
                                    connectNulls
                                />

                                {failures.map((point) =>
                                    point.down === 0 ? (
                                        <ReferenceLine
                                            key={point.id}
                                            x={point.time}
                                            stroke="#ef4444"
                                            strokeWidth={1.5}
                                            strokeDasharray="4 4"
                                        />
                                    ) : null
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}