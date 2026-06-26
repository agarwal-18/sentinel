import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMonitors, getPings } from "@/services/monitorService";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
    LoaderCircle,
    ShieldCheck,
    ShieldAlert,
    Activity,
    Gauge,
    ExternalLink
} from "lucide-react";

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
    const [pingsByMonitor, setPingsByMonitor] = useState({});

    const { username } = useParams();
    const navigate = useNavigate();

    async function loadData() {
        try {
            const monitorData = await getMonitors(username);
            const activeMonitors = monitorData.monitors.filter(monitor => monitor.is_active);

            setMonitors(monitorData.monitors);
            setNotFound(false);

            const pingResults = await Promise.all(
                activeMonitors.map(monitor => getPings(monitor.id))
            );

            const pingsMap = {};

            activeMonitors.forEach((monitor, index) => {
                pingsMap[monitor.id] = pingResults[index].pings;
            });

            setPingsByMonitor(pingsMap);
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();

        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, [username]);

    const activeMonitors = monitors.filter(monitor => monitor.is_active);
    const allOperational = activeMonitors.every(monitor => monitor.is_up);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <button
                    onClick={() => navigate("/")}
                    className="cursor-pointer text-2xl font-bold tracking-tight transition-colors hover:text-zinc-300"
                >
                    ⬡ Sentinel
                </button>
            </div>

            {notFound ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <h2 className="mb-2 text-lg font-semibold">User not found</h2>
                    <p className="text-muted-foreground">
                        No status page exists for "{username}".
                    </p>
                </div>
            ) : (
                <>
                    <div>
                        <h1 className="mb-2 text-3xl font-bold tracking-tight">
                            {username}'s Status
                        </h1>
                        <p className="text-muted-foreground">
                            Live service status and response times.
                        </p>
                    </div>

                    {activeMonitors.length === 0 ? (
                        <div className="py-16 text-center">
                            <h2 className="mb-2 text-xl font-semibold">
                                No active monitors
                            </h2>
                            <p className="text-muted-foreground">
                                This user has no monitors currently being tracked.
                            </p>
                        </div>
                    ) : (
                        <>
                            <Card
                                className={`border ${
                                    allOperational
                                        ? "border-green-500/20 bg-green-500/10"
                                        : "border-red-500/20 bg-red-500/10"
                                }`}
                            >
                                <CardContent className="flex items-center justify-between py-6">
                                    <div className="flex items-center gap-4">
                                        {allOperational ? (
                                            <ShieldCheck className="h-10 w-10 text-green-400" />
                                        ) : (
                                            <ShieldAlert className="h-10 w-10 text-red-400" />
                                        )}

                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                {allOperational
                                                    ? "All Systems Operational"
                                                    : "Some Systems Experiencing Issues"}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                {activeMonitors.length} active monitor(s)
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                {activeMonitors.map(monitor => {
                                    const monitorPings = (pingsByMonitor[monitor.id] ?? [])
                                        .slice()
                                        .sort(
                                            (a, b) =>
                                                new Date(a.checked_at).getTime() -
                                                new Date(b.checked_at).getTime()
                                        )
                                        .slice(-50);

                                    const chartData = monitorPings.map(ping => ({
                                        time: new Date(ping.checked_at).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }),
                                        latency: ping.is_up ? ping.latency : null,
                                        down: !ping.is_up ? 0 : null,
                                    }));

                                    const hasChartData =
                                        chartData.length > 0 &&
                                        !chartData.every(point => point.latency === null);

                                    return (
                                        <Card
                                            key={monitor.id}
                                            className="border-zinc-800 bg-zinc-950"
                                        >
                                            <CardHeader>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <CardTitle className="truncate">
                                                            {monitor.title}
                                                        </CardTitle>

                                                        <CardDescription className="mt-2 flex items-center gap-2 truncate font-mono text-[13px]">
                                                            <a
                                                                href={monitor.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 truncate font-mono text-xs transition-colors hover:text-white"
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="truncate">{monitor.url}</span>
                                                            </a>
                                                        </CardDescription>
                                                    </div>

                                                    <Badge
                                                        className={
                                                            monitor.is_up
                                                                ? "border-green-500/20 bg-green-500/10 text-green-500"
                                                                : "border-red-500/20 bg-red-500/10 text-red-500"
                                                        }
                                                    >
                                                        {monitor.is_up ? "Up" : "Down"}
                                                    </Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                                                        <Card className="border-zinc-800 bg-zinc-900/30">
                                                            <CardContent className="flex items-center gap-3 p-4">
                                                                <Activity className="h-5 w-5 text-green-400" />
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Uptime
                                                                    </p>
                                                                    <p className="text-xl font-semibold">
                                                                        {monitor.uptime != null
                                                                            ? `${monitor.uptime}%`
                                                                            : "—"}
                                                                    </p>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        <Card className="border-zinc-800 bg-zinc-900/30">
                                                            <CardContent className="flex items-center gap-3 p-4">
                                                                <Gauge className="h-5 w-5 text-cyan-400" />
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Latency
                                                                    </p>
                                                                    <p className="text-xl font-semibold">
                                                                        {monitor.latency != null
                                                                            ? `${monitor.latency} ms`
                                                                            : "—"}
                                                                    </p>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                                                        {!hasChartData ? (
                                                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                                                No successful checks to display yet.
                                                            </div>
                                                        ) : (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <LineChart
                                                                    data={chartData}
                                                                    margin={{
                                                                        top: 10,
                                                                        right: 20,
                                                                        left: 0,
                                                                        bottom: 0,
                                                                    }}
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