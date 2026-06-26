import {
    ArrowLeft,
    Sparkles,
    Pause,
    Play,
    Trash2,
    Globe,
    RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function MonitorHeader({
    monitor,
    hasAnalysis,
    aiLoading,
    onBack,
    onAnalyse,
    onToggle,
    onDelete,
}) {
    const status = !monitor.is_active
        ? {
              label: "Paused",
              className:
                  "border-blue-500/20 bg-blue-500/10 text-blue-400",
          }
        : monitor.is_up
          ? {
                label: "Up",
                className:
                    "border-green-500/20 bg-green-500/10 text-green-400",
            }
          : {
                label: "Down",
                className:
                    "border-red-500/20 bg-red-500/10 text-red-400",
            };

    return (
        <>
            <Button
                variant="ghost"
                onClick={onBack}
                className="mb-6 gap-2 text-muted-foreground hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Button>

            <Card className="border-zinc-800 bg-zinc-950">
                <CardContent className="flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight">
                                {monitor.title}
                            </h1>

                            <Badge
                                variant="outline"
                                className={status.className}
                            >
                                {status.label}
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
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={onAnalyse}
                            disabled={aiLoading}
                            className="min-w-[170px] gap-2 font-medium"
                        >
                            {aiLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : hasAnalysis ? (
                                <>
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh Report
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 text-purple-700" />
                                    Generate AI Report
                                </>
                            )}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={onToggle}
                            className="gap-2"
                        >
                            {monitor.is_active ? (
                                <>
                                    <Pause className="h-4 w-4" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4" />
                                    Resume
                                </>
                            )}
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={onDelete}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}