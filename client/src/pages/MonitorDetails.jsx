import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
    getMonitors,
    getPings,
    analyseIncident,
    deleteMonitor,
    toggleMonitor,
} from "@/services/monitorService";

import MonitorHeader from "@/components/monitor/MonitorHeader";
import StatsCards from "@/components/monitor/StatsCards";
import LatencyChart from "@/components/monitor/LatencyChart";
import RecentChecks from "@/components/monitor/RecentChecks";
import AIInsights from "@/components/monitor/AIInsights";
import DeleteMonitorDialog from "@/components/monitor/DeleteMonitorDialog";

import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

function MonitorDetails() {
    const [monitor, setMonitor] = useState(null);
    const [pings, setPings] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [analysisTime, setAnalysisTime] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const aiSectionRef = useRef(null);

    async function fetchPings() {
        try {
            const data = await getPings(id);
            setPings(data.pings);
        } catch (err) {
            console.log(err.message);
        }
    }

    async function fetchMonitor() {
        try {
            const token = localStorage.getItem("token");
            const decodedToken = jwtDecode(token);
            const username = decodedToken.username;

            const data = await getMonitors(username);
            const monitor = data.monitors.find((m) => m.id === parseInt(id));

            if (monitor) {
                setMonitor(monitor);
            } else {
                setNotFound(true);
            }
        } catch {
            setNotFound(true);
        }
    }

    useEffect(() => {
        fetchPings();

        if (state?.monitor) {
            setMonitor(state.monitor);
        } else {
            fetchMonitor();
        }

        const interval = setInterval(() => {
            fetchPings();
            fetchMonitor();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const stats = useMemo(() => {
        const totalPingsCount = pings.length;
        const failedPings = pings.filter((p) => !p.is_up);
        const failedPingsCount = failedPings.length;

        const last24hPings = pings.filter((p) => {
            const checkedAt = new Date(p.checked_at).getTime();
            return checkedAt >= Date.now() - 24 * 60 * 60 * 1000;
        });

        const last24hFailedCount = last24hPings.filter((p) => !p.is_up).length;

        const last24hFailureRate =
            last24hPings.length > 0
                ? ((last24hFailedCount / last24hPings.length) * 100).toFixed(1)
                : 0;

        const chartData = [...pings]
            .sort(
                (a, b) =>
                    new Date(a.checked_at).getTime() -
                    new Date(b.checked_at).getTime()
            )
            .slice(-50)
            .map((p, index) => ({
                id: index,
                time: new Date(p.checked_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                fullTime: new Date(p.checked_at).toLocaleString([], {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
                latency: p.is_up ? p.latency : null,
                down: !p.is_up,
                actualLatency: p.latency,
            }));

        return {
            totalPingsCount,
            failedPingsCount,
            last24hFailedCount,
            last24hFailureRate,
            chartData,
        };
    }, [pings]);

    const handleToggle = async () => {
        try {
            await toggleMonitor(id);
            setMonitor({ ...monitor, is_active: !monitor.is_active });
        } catch (err) {
            console.log(err.message);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            await deleteMonitor(id);
            navigate("/dashboard");
        } catch (err) {
            console.log(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleAnalyse = async () => {
        setAiLoading(true);

        requestAnimationFrame(() => {
            aiSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });

        try {
            const data = await analyseIncident(id);

            if (data.analysed) {
                setAiResult(data.result);
            } else {
                setAiResult({
                    message: data.message,
                });
            }

            setAnalysisTime(new Date());
        } catch (err) {
            console.log(err.message);
        } finally {
            setAiLoading(false);
        }
    };

    if (notFound) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center text-center">
                <p className="mb-2 text-lg font-semibold">Monitor not found</p>
                <p className="mb-4 text-muted-foreground">
                    This monitor doesn't exist or you don't have access to it.
                </p>

                <Button onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    if (!monitor) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex cursor-pointer items-center gap-3 text-3xl font-bold tracking-tight"
                    >
                        ⬡ Sentinel
                    </button>

                    <Button
                        variant="ghost"
                        onClick={logout}
                        className="cursor-pointer"
                    >
                        Logout
                    </Button>
                </div>
            </header>

            <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
                <MonitorHeader
                    monitor={monitor}
                    hasAnalysis={!!aiResult}
                    aiLoading={aiLoading}
                    onBack={() => navigate("/dashboard")}
                    onAnalyse={handleAnalyse}
                    onToggle={handleToggle}
                    onDelete={() => setDeleteDialogOpen(true)}
                />

                <StatsCards
                    uptime={monitor.uptime}
                    latency={monitor.latency}
                    checks={pings.length}
                    failures={stats.failedPingsCount}
                    lastChecked={monitor.checked_at}
                />

                <LatencyChart chartData={stats.chartData} />

                <div ref={aiSectionRef}>
                    <AIInsights
                        loading={aiLoading}
                        result={aiResult}
                        generatedAt={analysisTime}
                        failedChecks={stats.last24hFailedCount}
                        failureRate={stats.last24hFailureRate}
                        onAnalyse={handleAnalyse}
                    />
                </div>

                <RecentChecks pings={pings} />

                <DeleteMonitorDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    monitorName={monitor.title}
                    loading={deleteLoading}
                    onConfirm={handleDelete}
                />
            </div>
        </>
    );
}

export default MonitorDetails;