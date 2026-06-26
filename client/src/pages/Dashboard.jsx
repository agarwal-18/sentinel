import { useState, useEffect } from "react";
import { getMonitors, createMonitor, deleteMonitor as deleteMonitorService, toggleMonitor as toggleMonitorService } from "../services/monitorService";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns"
import { jwtDecode } from "jwt-decode";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DeleteMonitorDialog from "@/components/monitor/DeleteMonitorDialog";
import { Globe } from "lucide-react";



function Dashboard() {
    const [monitors, setMonitors] = useState([]);
    const [isPopup, setIsPopup] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        url: ''
    });
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedMonitor, setSelectedMonitor] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    const username = decoded.username;
    
    const fetchMonitors = async () => {
        try {
            const data = await getMonitors(username);
            setMonitors(data.monitors);
        }   catch (err) {
            console.log(err.message);
        }   finally {
            setLoading(false);
        }
    }

    useEffect(() => {   
        fetchMonitors();

        const interval = setInterval(() => {
            fetchMonitors();
        }, 10000)

        return () => clearInterval(interval);
    }, []);

    

    const monitorSubmit = async () => {
        try {
            await createMonitor(formData.title, formData.url);
            await fetchMonitors();
            setIsPopup(false);
            setFormData({ title: '', url: ''})
        }
        catch (err) {
            console.log(err.message);
        }
    }

    const deleteMonitor = async () => {
        if (!selectedMonitor) return;

        try {
            setDeleteLoading(true);

            await deleteMonitorService(selectedMonitor.id);
            await fetchMonitors();

            setDeleteDialogOpen(false);
            setSelectedMonitor(null);
        } catch (err) {
            console.log(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const toggleMonitor = async (id) => {
        try {
            await toggleMonitorService(id)
            await fetchMonitors()
        }
        catch (err) {
            console.log(err.message)
        }
    }

    const totalMonitors = monitors.length;
    const activeMonitors = monitors.filter(
        (monitor) => monitor.is_active
    ).length;

    const pausedMonitors = totalMonitors - activeMonitors;

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/');
    }

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-3 text-3xl tracking-tight font-bold cursor-pointer hover:text-gray-300 transition-colors"
                    >
                        ⬡  Sentinel
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
            <div className="container mx-auto max-w-7xl px-4 py-8 animate-in fade-in duration-300">

            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        {username}'s Monitors
                    </h1>

                    <p className="mt-3 text-base text-zinc-400">
                        Track uptime and monitor service health.
                    </p>
                </div>

                <Button
                    onClick={() => setIsPopup(true)}
                    className="
                        self-start
                        bg-white
                        text-black
                        hover:bg-zinc-200
                        md:self-auto
                    "
                >
                    + Add Monitor
                </Button>
            </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

                <Card className="border-zinc-800 bg-zinc-950/70 backdrop-blur-sm">
                    <CardContent className="space-y-2 pt-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Total Monitors
                    </p>

                    <h2 className="text-4xl font-bold">
                        {totalMonitors}
                    </h2>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-950/70 backdrop-blur-sm">
                    <CardContent className="space-y-2 pt-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Active
                    </p>

                    <h2 className="text-4xl font-bold text-green-500">
                        {activeMonitors}
                    </h2>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-950/70 backdrop-blur-sm">
                    <CardContent className="space-y-2 pt-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                        Paused
                    </p>

                    <h2 className="text-4xl font-bold text-blue-500">
                        {pausedMonitors}
                    </h2>
                    </CardContent>
                </Card>

            </div>

            {loading 
                ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {[1,2,3].map(i => (
                            <Card
                                key={i}
                                className="border-zinc-800 bg-zinc-950/70 animate-pulse"
                            >
                                <CardContent className="h-32" />
                            </Card>
                        ))}
                    </div>
                    ) 
                : monitors.length === 0 
                    ? (
                        (
                            <Card className="border-zinc-800 bg-zinc-950/70">
                                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="mb-4 text-center">
                                        <h2 className="mb-2 text-lg font-semibold">
                                            No monitors yet
                                        </h2>

                                        <p className="text-muted-foreground">
                                            Create your first monitor and start tracking uptime.
                                        </p>
                                    </div>

                                    <Button 
                                        className="cursor-pointer" 
                                        onClick={() => setIsPopup(true)}
                                    >
                                        Create your first monitor
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                        ) 
                    : (
                        (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {monitors.map((monitor) => {
                                const status = !monitor.is_active
                                                    ? "paused"
                                                    : !monitor.checked_at 
                                                        ? "pending"
                                                        : monitor.is_up 
                                                            ? "up"
                                                            : "down"
                                return (<Card
                                    key={monitor.id}
                                    className="
                                        cursor-pointer
                                        border-zinc-800
                                        bg-zinc-950/70
                                        backdrop-blur-sm
                                        transition-all
                                        duration-200
                                        hover:-translate-y-1
                                        hover:border-zinc-700
                                        hover:shadow-xl
                                        "
                                        
                                    onClick={() => {
                                        navigate(`/monitor/${monitor.id}`,
                                            { state: { monitor } }
                                        )
                                    }}
                                >
                                    <CardHeader className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">

                                            <div className="flex min-w-0 items-center gap-2">

                                                <div className={`h-2 w-2 rounded-full shrink-0 animate-pulse ${
                                                        status === 'paused' ? 'bg-blue-500' :
                                                        status === 'pending' ? 'bg-zinc-400' :
                                                        status === 'up' ? 'bg-green-500' :
                                                        'bg-red-500'
                                                        }`
                                                    } 
                                                />

                                                <CardTitle className="truncate text-xl">
                                                    {monitor.title}
                                                </CardTitle>

                                            </div>

                                            <Badge
                                                className={`
                                                    rounded-full
                                                    border
                                                    px-3
                                                    py-1
                                                    font-medium
                                                    ${
                                                        status === "paused"
                                                            ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                                                            : status === "pending"
                                                            ? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                                                            : status === "up"
                                                            ? "border-green-500/20 bg-green-500/10 text-green-500"
                                                            : "border-red-500/20 bg-red-500/10 text-red-500"
                                                    }
                                                `}
                                            >
                                                {status === 'paused' ? 'Paused' :
                                                status === 'pending' ? 'Checking...' :
                                                status === 'up' ? 'Up' : 'Down'}
                                            </Badge>

                                        </div>

                                        <a
                                            href={monitor.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white"
                                        >
                                            <Globe className="h-4 w-4" />

                                            <span className="break-all">
                                                {monitor.url}
                                            </span>
                                        </a>
                                    </CardHeader>

                                    <CardContent className="pt-0">
                                        {/* Stats */}
                                        <div className="mb-4 grid grid-cols-2 gap-3">

                                            <div className="cursor-default
                                                rounded-xl
                                                border
                                                border-zinc-800
                                                bg-zinc-900/60
                                                p-4" 
                                                onClick={(e) => e.stopPropagation()}>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Uptime
                                                </p>

                                                <p className="mt-2 text-2xl font-bold">
                                                    {monitor.uptime}%
                                                </p>
                                            </div>

                                            <div className="cursor-default
                                                rounded-xl
                                                border
                                                border-zinc-800
                                                bg-zinc-900/60
                                                p-4" 
                                                onClick={(e) => e.stopPropagation()}>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Latency
                                                </p>

                                                <p className="mt-2 text-2xl font-bold">
                                                    {monitor.latency
                                                    ? `${monitor.latency} ms`
                                                    : "--"}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Last Check */}
                                        <p className="mb-6 border-t border-zinc-800 pt-4  text-zinc-500">
                                            {monitor.checked_at ? (
                                                <>
                                                    Last checked{" "}
                                                    {formatDistanceToNow(
                                                        new Date(monitor.checked_at),
                                                        { addSuffix: true }
                                                    )}
                                                </>
                                            ) : "This might take a while..."}
                                            </p>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2">

                                            <Button
                                                variant="outline"
                                                className="text-sm cursor-pointer"
                                                size="sm"
                                                onClick={() =>
                                                    navigate(`/monitor/${monitor.id}`, { state: { monitor } })
                                                }
                                            >
                                                View
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="text-sm cursor-pointer border-zinc-700"
                                                size="sm"
                                                onClick={(e) => {e.stopPropagation(), toggleMonitor(monitor.id)}}
                                            >
                                                {monitor.is_active ? "Pause" : "Resume"}
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                className="text-sm cursor-pointer border-b-2 border-red-900"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMonitor(monitor);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )})}
                        </div>
                        )
                    )
                }
            {/* Create Monitor Dialog */}
            <Dialog
                open={isPopup}
                onOpenChange={setIsPopup}
            >
                <DialogContent className="w-[95vw] max-w-lg rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Create Monitor
                        </DialogTitle>

                        <p className="text-sm text-muted-foreground">
                            Add a website or endpoint to start tracking uptime.
                        </p>
                    </DialogHeader>

                    <div className="space-y-6">

                    <div className="space-y-4">
                        <Label>
                            Monitor Name
                        </Label>

                        <Input
                            placeholder="My Website"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                ...formData,
                                title: e.target.value,
                                })
                            }/>
                    </div>

                    <div className="space-y-4">
                        <Label>
                            URL
                        </Label>

                        <Input
                            type="url"
                            placeholder="https://example.com"
                            value={formData.url}
                            onChange={(e) =>
                                setFormData({
                                ...formData,
                                url: e.target.value,
                                })
                            } 
                        />
                        </div>

                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPopup(false)}>
                            Cancel
                        </Button>

                        <Button
                            onClick={monitorSubmit} >
                            Create
                        </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>
            <DeleteMonitorDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);

                    if (!open) {
                        setSelectedMonitor(null);
                    }
                }}
                monitorName={selectedMonitor?.title}
                loading={deleteLoading}
                onConfirm={deleteMonitor}
            />

        </div>
        </>
    );


}

export default Dashboard