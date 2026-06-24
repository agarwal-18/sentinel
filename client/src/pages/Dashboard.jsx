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



function Dashboard() {
    const [monitors, setMonitors] = useState([]);
    const [isPopup, setIsPopup] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        url: ''
    });
    const [loading, setLoading] = useState(true);
    
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
        }, 300000)

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

    const deleteMonitor = async (id) => {
        try {
            await deleteMonitorService(id)
            await fetchMonitors()
        }
        catch (err) {
            console.log(err.message)
        }
    }

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
        <div className="container mx-auto min-h-screen py-8">

            {/* Navbar */}
            <div className="mb-8 flex items-center justify-between">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="
                        text-2xl
                        font-bold
                        tracking-tight
                        transition-colors
                        hover:text-zinc-300
                        cursor-pointer">
                    ⬡ Sentinel
                </button>
                
                <div className="flex items-center gap-3">
            
                    <span className="text-lg text-zinc-200 items-end">Welcome, {username}</span>
                    <Button 
                        onClick={() => logout()}
                        variant="ghost"
                        className="cursor-pointer text-zinc-300">
                        Logout
                    </Button>
                </div>
            </div>

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                    Your Monitors
                    </h1>

                    <p className="text-muted-foreground">
                    Track uptime and monitor service health.
                    </p>
                </div>

                <Button
                    className="
                    bg-white
                    text-black
                    hover:bg-zinc-200
                    hover:text-black
                    active:scale-95
                    transition-all
                    duration-150
                    cursor-pointer"
                    onClick={() => setIsPopup(true)}
                >
                    + Add Monitor
                </Button>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid gap-4 md:grid-cols-3">

                <Card>
                    <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                        Total Monitors
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {totalMonitors}
                    </h2>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                        Active
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-green-500">
                        {activeMonitors}
                    </h2>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                        Paused
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-blue-500">
                        {pausedMonitors}
                    </h2>
                    </CardContent>
                </Card>

            </div>

            {loading 
                ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1,2,3].map(i => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="h-32" />
                            </Card>
                        ))}
                    </div>
                    ) 
                : monitors.length === 0 
                    ? (
                        (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
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
                            {monitors.map((monitor) => (
                            <Card
                                key={monitor.id}
                                className="
                                    transition-all
                                    duration-200
                                    hover:-translate-y-1
                                    hover:border-zinc-700
                                    hover:shadow-lg
                                    cursor-pointer"
                                    
                                onClick={() => {
                                    navigate(`/monitor/${monitor.id}`,
                                        { state: { monitor } }
                                    )
                                }}
                                
                            >

                                <CardHeader>
                                    <div className="flex items-start justify-between gap-3">

                                        <div className="flex min-w-0 items-center gap-2">

                                            <div
                                                className={`h-2 w-2 rounded-full shrink-0 ${
                                                    monitor.is_active === false
                                                    ? "bg-blue-500"
                                                    : monitor.is_up === true
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                                }`}
                                                />

                                            <CardTitle className="truncate">
                                                {monitor.title}
                                            </CardTitle>

                                        </div>

                                        <Badge
                                            className={
                                                monitor.is_active === false
                                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                : monitor.is_up === true
                                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                            }
                                            >
                                            {monitor.is_active === false
                                                ? "Paused"
                                                : monitor.is_up === true
                                                ? "Up"
                                                : "Down"}
                                        </Badge>

                                    </div>

                                    <CardDescription className="mt-2 truncate">
                                        {monitor.url}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {/* Stats */}
                                    <div className="mb-4 grid grid-cols-2 gap-3">

                                        <div className="rounded-lg border p-3 cursor-default" onClick={(e) => e.stopPropagation()}>
                                            <p className="text-xs text-muted-foreground">
                                                Uptime
                                            </p>

                                            <p className="text-lg font-semibold">
                                                {monitor.uptime}%
                                            </p>
                                        </div>

                                        <div className="rounded-lg border p-3 cursor-default" onClick={(e) => e.stopPropagation()}>
                                            <p className="text-xs text-muted-foreground">
                                                Latency
                                            </p>

                                            <p className="text-lg font-semibold">
                                                {monitor.latency
                                                ? `${monitor.latency} ms`
                                                : "--"}
                                            </p>
                                        </div>

                                    </div>

                                    {/* Last Check */}
                                    <p className="mb-4 text-xs text-muted-foreground">
                                        {monitor.checked_at ? (
                                            <>
                                                Last checked{" "}
                                                {formatDistanceToNow(
                                                    new Date(monitor.checked_at),
                                                    { addSuffix: true }
                                                )}
                                            </>
                                        ) : (
                                            ""
                                        )}
                                        </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">

                                        <Button
                                            variant="outline"
                                            className="cursor-pointer"
                                            size="sm"
                                            onClick={() =>
                                                navigate(`/monitor/${monitor.id}`, { state: { monitor } })
                                            }
                                        >
                                            View
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="cursor-pointer"
                                            size="sm"
                                            onClick={(e) => {e.stopPropagation(), toggleMonitor(monitor.id)}}
                                        >
                                            {monitor.is_active ? "Pause" : "Resume"}
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            className="cursor-pointer"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(), deleteMonitor(monitor.id) }}
                                        >
                                            Delete
                                        </Button>
                                    </div>

                                </CardContent>

                            </Card>
                            ))}
                        </div>
                        )
                    )
                }
            {/* Create Monitor Dialog */}
            <Dialog
                open={isPopup}
                onOpenChange={setIsPopup}
            >
                <DialogContent className="sm:max-w-125">

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

        </div>
    );


}

export default Dashboard