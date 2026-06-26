import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import { getMonitors } from "@/services/monitorService";

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
    ExternalLink,
    Activity,
    Gauge,
    Clock,
} from "lucide-react";

function StatusPage() {
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [monitors, setMonitors] = useState([]);

    const { username } = useParams();
    const navigate = useNavigate();

    async function loadData() {
        setLoading(true);
        setNotFound(false);
        setMonitors([]);

        try {
            const data = await getMonitors(username);
            setMonitors(data.monitors);
        } catch (err) {
            setNotFound(true);
            setMonitors([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [username]);

    const activeMonitors = monitors.filter(
        (monitor) => monitor.is_active
    );

    const allOperational =
        activeMonitors.length > 0 &&
        activeMonitors.every((monitor) => monitor.is_up);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="container mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 text-center">
                <button
                    onClick={() => navigate("/")}
                    className="mb-8 cursor-pointer text-3xl font-bold tracking-tight transition-colors hover:text-zinc-300"
                >
                    ⬡ Sentinel
                </button>

                <h2 className="mb-2 text-2xl font-semibold">
                    User not found
                </h2>

                <p className="text-muted-foreground">
                    No public status page exists for "{username}".
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
            <header className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div>
                    <button
                        onClick={() => navigate("/")}
                        className="mb-6 cursor-pointer text-3xl font-bold tracking-tight transition-colors hover:text-zinc-300"
                    >
                        ⬡ Sentinel
                    </button>

                    <h1 className="text-4xl font-bold tracking-tight">
                        {username}'s Status
                    </h1>

                    <p className="mt-3 text-zinc-400">
                        Live availability of monitored services.
                    </p>
                </div>

                <Card
                    className={`w-full max-w-sm border ${
                        allOperational
                            ? "border-green-500/20 bg-green-500/10"
                            : "border-red-500/20 bg-red-500/10"
                    }`}
                >
                    <CardContent className="flex items-center gap-4 py-6">
                        {allOperational ? (
                            <ShieldCheck className="h-10 w-10 text-green-400" />
                        ) : (
                            <ShieldAlert className="h-10 w-10 text-red-400" />
                        )}

                        <div>
                            <h2 className="text-lg font-semibold">
                                {allOperational
                                    ? "All Systems Operational"
                                    : "Some Systems Degraded"}
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                {activeMonitors.length} active monitor
                                {activeMonitors.length !== 1 && "s"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </header>

            {activeMonitors.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-950/70">
                    <CardContent className="py-20 text-center">
                        <h2 className="mb-2 text-xl font-semibold">
                            No Active Monitors
                        </h2>

                        <p className="text-muted-foreground">
                            This user is not monitoring any public services.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-5">
                                        {activeMonitors.map((monitor) => (
                        <Card
                            key={monitor.id}
                            className="border-zinc-800 bg-zinc-950/70 backdrop-blur-sm"
                        >
                            <CardHeader>
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0">
                                        <div className="mb-2 flex flex-wrap items-center gap-3">
                                            <CardTitle className="truncate text-2xl">
                                                {monitor.title}
                                            </CardTitle>

                                            <Badge
                                                className={
                                                    monitor.is_up
                                                        ? "border-green-500/20 bg-green-500/10 text-green-500"
                                                        : "border-red-500/20 bg-red-500/10 text-red-500"
                                                }
                                            >
                                                {monitor.is_up ? "Operational" : "Down"}
                                            </Badge>
                                        </div>

                                        <CardDescription>
                                            <a
                                                href={monitor.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm transition-colors hover:text-white"
                                            >
                                                <ExternalLink className="h-4 w-4 shrink-0" />

                                                <span className="break-all">
                                                    {monitor.url}
                                                </span>
                                            </a>
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <Card className="border-zinc-800 bg-zinc-900/50">
                                        <CardContent className="flex items-center gap-3 p-5">
                                            <Activity className="h-5 w-5 text-green-400" />

                                            <div>
                                                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                                                    Uptime
                                                </p>

                                                <p className="mt-1 text-2xl font-bold">
                                                    {monitor.uptime != null
                                                        ? `${monitor.uptime}%`
                                                        : "—"}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-zinc-800 bg-zinc-900/50">
                                        <CardContent className="flex items-center gap-3 p-5">
                                            <Gauge className="h-5 w-5 text-cyan-400" />

                                            <div>
                                                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                                                    Latency
                                                </p>

                                                <p className="mt-1 text-2xl font-bold">
                                                    {monitor.latency != null
                                                        ? `${monitor.latency} ms`
                                                        : "—"}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-zinc-800 bg-zinc-900/50">
                                        <CardContent className="flex items-center gap-3 p-5">
                                            <Clock className="h-5 w-5 text-amber-400" />

                                            <div>
                                                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                                                    Last Checked
                                                </p>

                                                <p className="mt-1 text-xl font-medium">
                                                    {monitor.checked_at
                                                        ? formatDistanceToNow(
                                                              new Date(monitor.checked_at),
                                                              {
                                                                  addSuffix: true,
                                                              }
                                                          )
                                                        : "Never"}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StatusPage;