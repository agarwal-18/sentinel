import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getMonitors, getPings, analyseIncident, deleteMonitor, toggleMonitor } from "@/services/monitorService"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts'

import {
    Sparkles,
    AlertTriangle,
    CircleCheck,
    RefreshCw,
    Clock3
} from "lucide-react";

function MonitorDetails() {
    const [monitor, setMonitor] = useState(null);
    const [pings, setPings] = useState([]);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [analysisTime, setAnalysisTime] = useState(null);
    const [notFound, setNotFound] = useState(false);

    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    async function fetchPings() {
        try {
            const data = await getPings(id);
            setPings(data.pings)
        }
        catch (err) {
            console.log(err.message);
        }
    }

    async function fetchMonitor() {
        try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const username = decodedToken.username;

            const data = await getMonitors(username);
            const monitor = data.monitors.find(m => m.id === parseInt(id));
            if (monitor) {
                setMonitor(monitor);
            } else {
                setNotFound(true);
            }
        }
        catch {
            setNotFound(true);
        }
    }

    useEffect(() => {
        fetchPings();
        if (state?.monitor) {
            setMonitor(state?.monitor);
        } else {
            fetchMonitor();
        }

        const interval = setInterval(() => {
            fetchPings();
            fetchMonitor();
        }, 60000)

        return () => clearInterval(interval)
    }, []);

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <p className="text-lg font-semibold mb-2">Monitor not found</p>
                <p className="text-muted-foreground mb-4">This monitor doesn't exist or you don't have access to it.</p>
                <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
        )
    }

    if (!monitor) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    const totalPingsCount = pings.length;
    const failedPings = pings.filter(p => p.is_up === false);
    const failedPingsCount = failedPings.length;
    const { uptime, latency } = monitor;

    
    const last24hPings = pings.filter(p => {
        const checkedAt = new Date(p.checked_at).getTime();
        return checkedAt >= Date.now() - 24 * 60 * 60 * 1000;
    });
    const last24hFailedCount = last24hPings.filter(p => !p.is_up).length;
    const last24hFailureRate = last24hPings.length > 0
        ? ((last24hFailedCount / last24hPings.length) * 100).toFixed(1)
        : 0;

    const handleToggle = async () => {
        try {
            await toggleMonitor(id);
            setMonitor({ ...monitor, is_active: !monitor.is_active });
        } catch (err) {
            console.log(err.message);
        }
    }

    const handleDelete = async () => {
        try {
            await deleteMonitor(id);
            navigate('/dashboard');
        } catch (err) {
            console.log(err.message);
        }
    }

    const handleAnalyse = async () => {
        try {
            setIsAiOpen(true);
            setAiLoading(true);
            const data = await analyseIncident(id);
            if (data.analysed) {
                setAiResult(data.result)
            } else {
                setAiResult({
                    message: data.message
                })
            }
            setAnalysisTime(new Date());
        } catch (err) {
            console.log(err.message);
        } finally {
            setAiLoading(false);
        }
    }

    const chartData = [...pings]
        .sort((a, b) => new Date(a.checked_at) - new Date(b.checked_at))
        .slice(-50) // last 50 points, avoid overcrowding
        .map(p => ({
            time: new Date(p.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            latency: p.is_up ? p.latency : null,
            down: !p.is_up ? 0 : null
        }))


    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
            <Button
                variant="ghost"
                className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    px-3
                    py-2
                    text-sm
                    text-muted-foreground
                    transition-all
                    duration-200
                    hover:bg-zinc-800
                    hover:text-white
                "
                onClick={() => navigate("/dashboard")}
            >
                ← Back to Dashboard
            </Button>

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{monitor.title}</h1>

                    <a
                        href={monitor.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        {monitor.url}
                    </a>

                    <div className="mt-3">
                        <Badge
                            variant={
                                !monitor.is_active
                                    ? "secondary"
                                    : monitor.is_up
                                        ? "default"
                                        : "destructive"
                            }
                            className={
                                monitor.is_active === false
                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    : monitor.is_up === true
                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                            }
                        >
                            {!monitor.is_active
                                ? "PAUSED"
                                : monitor.is_up
                                    ? "UP"
                                    : "DOWN"}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={handleAnalyse}
                    >
                        ✨ Analyze with AI
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={handleToggle}
                    >
                        {monitor.is_active
                            ? "Pause"
                            : "Resume"}
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

                <Card>
                    <CardHeader>
                        <CardTitle>Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {uptime}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Avg Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {latency != null
                                ? `${latency} ms`
                                : '--'
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Checks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {totalPingsCount}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Failures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {failedPingsCount}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Last Checked</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            {new Date(
                                monitor.checked_at
                            ).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

            </div>

            {/* Chart Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Response Time History
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="h-82 rounded-md border flex items-center justify-center text-muted-foreground">
                        {chartData.length === 0 || chartData.every(d => d.latency === null) ? 
                                <p className="text-[18px]">No successful checks to display yet.</p>
                        : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="latency"
                                        stroke="#22c55e"
                                        connectNulls={false}
                                        dot={{ r: 3 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="down"
                                        stroke="none"
                                        dot={{ r: 5, fill: '#ef4444' }}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                         )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Checks */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Recent Checks
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3">
                                        Time
                                    </th>

                                    <th className="text-left py-3">
                                        Status
                                    </th>

                                    <th className="text-left py-3">
                                        Latency
                                    </th>

                                    <th className="text-left py-3">
                                        Status Code
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {pings.slice(0, 20).map((ping) => (
                                    <tr
                                        key={ping.id}
                                        className="border-b"
                                    >
                                        <td className="py-3">
                                            {new Date(
                                                ping.checked_at
                                            ).toLocaleString()}
                                        </td>

                                        <td className="py-3">
                                            <Badge
                                                variant={
                                                    ping.is_up
                                                        ? "default"
                                                        : "destructive"
                                                }
                                                className={
                                                    ping.is_up === true
                                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                                }
                                            >
                                                {ping.is_up
                                                    ? "UP"
                                                    : "DOWN"}
                                            </Badge>
                                        </td>

                                        <td className="py-3">
                                            {ping.latency != null
                                                ? `${ping.latency} ms`
                                                : '--'
                                            }
                                        </td>

                                        <td className="py-3">
                                            {ping.status_code ??
                                                "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Failures */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Recent Failures
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {failedPingsCount === 0 ? (
                        <p className="text-muted-foreground">
                            🎉 No failures recorded
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {failedPings
                                .slice(0, 10)
                                .map((ping) => (
                                    <div
                                        key={ping.id}
                                        className="rounded-md border p-3"
                                    >
                                        <p className="font-medium">
                                            {new Date(
                                                ping.checked_at
                                            ).toLocaleString()}
                                        </p>

                                        <p className="mt-1 text-sm text-red-500">
                                            {ping.error_log ||
                                                `HTTP ${ping.status_code}`}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Analysis Panel */}
            <Sheet
                open={isAiOpen}
                onOpenChange={setIsAiOpen}
            >
                <SheetContent
                    side="right"
                    className="
                        !w-[55vw]
                        !max-w-none
                        overflow-y-auto
                        p-0
                    "
                >

                    <SheetHeader className="px-8 pt-8 pb-6 border-b">
                        <div className="flex items-start justify-between">

                            <div>
                                <SheetTitle className="flex items-center gap-2 text-2xl">
                                    <Sparkles className="h-5 w-5 text-yellow-500" />
                                    AI Incident Analysis
                                </SheetTitle>

                                <p className="mt-2 text-muted-foreground">
                                    AI-powered investigation of recent monitor failures.
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAnalyse}
                                disabled={aiLoading}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Re-analyze
                            </Button>

                        </div>
                    </SheetHeader>

                    {aiLoading ? (

                        <div className=" px-8 pb-8">
                            <div className="text-center space-y-4">
                                <Sparkles className="mx-auto h-10 w-10 animate-pulse text-yellow-500" />
                                <h3 className="text-xl font-semibold">
                                    Analyzing Monitor History
                                </h3>
                                <p className="text-muted-foreground">
                                    Looking for patterns, failures and probable causes...
                                </p>
                            </div>

                        </div>

                    ) : !aiResult ? (
                        <div className="px-8 py-12 text-center text-muted-foreground">
                            No analysis available.
                        </div>
                    ) : aiResult.message ? (
                        <div className="px-8 pb-8">
                            <Card>
                                <CardContent className="pt-6">
                                    <p>{aiResult.message}</p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="px-8 pb-8 space-y-6">

                            {/* Status Row */}

                            <div className="mt-3 flex flex-wrap gap-3">

                                <Badge
                                    className={
                                        aiResult.severity === "high"
                                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                                            : aiResult.severity === "medium"
                                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                : "bg-green-500/10 text-green-500 border-green-500/20"
                                    }
                                >
                                    Severity: {aiResult.severity}
                                </Badge>

                                <Badge
                                    variant="outline"
                                >
                                    Confidence: {aiResult.confidence}
                                </Badge>

                            </div>

                            {/* Summary */}

                            <Card className="border-purple-500/20 bg-purple-500/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Sparkles className="h-4 w-4 text-purple-400" />
                                        Summary
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-[17px] leading-7">
                                        {aiResult.summary}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Cause + Recommendation */}

                            <div className="grid gap-4 md:grid-cols-2">

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            Diagnosis
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="leading-7">
                                            {aiResult.probable_cause}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <CircleCheck className="h-4 w-4 text-green-500" />
                                            Action Plan
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="leading-7">
                                            {aiResult.suggestion}
                                        </p>
                                    </CardContent>
                                </Card>

                            </div>

                            {/* Technical Details */}

                            <Card>

                                <CardHeader>
                                    <CardTitle>
                                        Technical Details
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Based on failures in the last 24 hours
                                    </p>
                                </CardHeader>

                                <CardContent className="space-y-6">

                                    <div>

                                        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                                            Pattern Detected
                                        </p>

                                        <p className="leading-7">
                                            {aiResult.pattern}
                                        </p>

                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">

                                        <div className="rounded-lg border p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Failure Rate (24h)
                                            </p>

                                            <p className="text-lg font-semibold">
                                                {last24hFailureRate}%
                                            </p>
                                        </div>

                                        <div className="rounded-lg border p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Affected Checks (24h)
                                            </p>

                                            <p className="text-lg font-semibold">
                                                {last24hFailedCount}
                                            </p>
                                        </div>

                                    </div>

                                </CardContent>

                            </Card>

                            {/* Footer */}

                            <div className="flex items-center justify-between border-t pt-4">

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">

                                    <Clock3 className="h-4 w-4" />

                                    {analysisTime && (
                                        <span>
                                            Generated {analysisTime.toLocaleString()}
                                        </span>
                                    )}

                                </div>

                            </div>

                        </div>

                    )}

                </SheetContent>
            </Sheet>

        </div>
    );
}

export default MonitorDetails;
