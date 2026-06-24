import { useState, useEffect } from "react";
import { getMonitors, getPings } from "@/services/monitorService";
import { useParams, useNavigate } from "react-router-dom";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

function StatusPage() {
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [monitors, setMonitors] = useState([]);
    // pingsByMonitor maps monitor id -> that monitor's ping array,
    // since there is no single backend endpoint that returns pings
    // for every monitor a user owns in one call.
    const [pingsByMonitor, setPingsByMonitor] = useState({});

    const { username } = useParams();
    const navigate = useNavigate();

    async function loadData() {
        try {
            const monitorData = await getMonitors(username);
            const activeMonitors = monitorData.monitors.filter((m) => m.is_active);
            setMonitors(monitorData.monitors);
            setNotFound(false);

            
            const pingResults = await Promise.all(
                activeMonitors.map((m) => getPings(m.id))
            );

            const pingsMap = {};
            activeMonitors.forEach((m, i) => {
                pingsMap[m.id] = pingResults[i].pings;
            });
            setPingsByMonitor(pingsMap);
        } catch (err) {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();

        const interval = setInterval(() => {
            loadData();
        }, 60000);

        return () => clearInterval(interval);
    }, [username]);

    const activeMonitors = monitors.filter((m) => m.is_active);
    const allOperational = activeMonitors.every((m) => m.is_up);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto min-h-screen py-8 max-w-6xl px-4">
            <div className="mb-8 flex items-center justify-between">
                <button
                    onClick={() => navigate("/")}
                    className="
                        cursor-pointer
                        text-2xl
                        font-bold
                        tracking-tight
                        transition-colors
                        hover:text-zinc-300
                    "
                >
                    ⬡ Sentinel
                </button>
            </div>

            {notFound ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <h2 className="text-lg font-semibold mb-2">User not found</h2>
                    <p className="text-muted-foreground">
                        No status page exists for "{username}".
                    </p>
                </div>
            ) : (
                <>
                    <h1 className="mb-2 text-3xl font-bold tracking-tight">
                        {username}'s Status
                    </h1>
                    <p className="mb-6 text-muted-foreground">
                        Live service status and response times.
                    </p>

                    {activeMonitors.length === 0 ? (
                        <div className="py-16 text-center">
                            <h2 className="text-xl font-semibold mb-2">No active monitors</h2>
                            <p className="text-muted-foreground">
                                This user has no monitors currently being tracked.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Overall status banner */}
                            <div
                                className={`mb-8 rounded-lg border p-4 text-center font-medium ${
                                    allOperational
                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                }`}
                            >
                                {allOperational
                                    ? "✓ All Systems Operational"
                                    : "⚠ Some Systems Experiencing Issues"}
                            </div>

                            <div className="space-y-6">
                                {activeMonitors.map((monitor) => {
                                    const monitorPings = (pingsByMonitor[monitor.id] || [])
                                        .slice() // avoid mutating cached array on sort
                                        .sort(
                                            (a, b) =>
                                                new Date(a.checked_at) - new Date(b.checked_at)
                                        )
                                        .slice(-50);

                                    const chartData = monitorPings.map((ping) => ({
                                        time: new Date(ping.checked_at).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }),
                                        latency: ping.is_up ? ping.latency : null,
                                        down: !ping.is_up ? 0 : null,
                                    }));

                                    const hasChartData =
                                        chartData.length > 0 &&
                                        !chartData.every((d) => d.latency === null);

                                    return (
                                        <Card key={monitor.id}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between gap-3">
                                                    <CardTitle className="truncate">
                                                        {monitor.title}
                                                    </CardTitle>
                                                    <Badge
                                                        className={
                                                            monitor.is_up
                                                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                                        }
                                                    >
                                                        {monitor.is_up ? "Up" : "Down"}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="truncate">
                                                    {monitor.url}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                                                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-1">
                                                        <div className="rounded-lg border p-3">
                                                            <p className="text-l text-muted-foreground">
                                                                Uptime
                                                            </p>
                                                            <p className="text-xl font-semibold">
                                                                {monitor.uptime != null
                                                                    ? `${monitor.uptime}%`
                                                                    : "—"}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-lg border p-3">
                                                            <p className="text-l text-muted-foreground">
                                                                Latency
                                                            </p>
                                                            <p className="text-xl font-semibold">
                                                                {monitor.latency != null
                                                                    ? `${monitor.latency} ms`
                                                                    : "—"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="h-56 rounded-md border">
                                                        {!hasChartData ? (
                                                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                                                No successful checks to display yet.
                                                            </div>
                                                        ) : (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <LineChart
                                                                    data={chartData}
                                                                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                                                >
                                                                    <CartesianGrid strokeDasharray="3 3" />
                                                                    <XAxis dataKey="time" fontSize={11} />
                                                                    <YAxis fontSize={11} />
                                                                    <Tooltip />
                                                                    <Line
                                                                        type="monotone"
                                                                        dataKey="latency"
                                                                        stroke="#22c55e"
                                                                        connectNulls={false}
                                                                        dot={{ r: 2 }}
                                                                    />
                                                                    <Line
                                                                        type="monotone"
                                                                        dataKey="down"
                                                                        stroke="none"
                                                                        dot={{ r: 4, fill: "#ef4444" }}
                                                                        isAnimationActive={false}
                                                                    />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default StatusPage;
