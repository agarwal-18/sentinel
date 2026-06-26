import {
    Sparkles,
    RefreshCw,
    BrainCircuit,
    AlertTriangle,
    CircleCheck,
    LoaderCircle,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { formatDistanceToNow } from "date-fns";

const severityStyles = {
    critical: "border-red-500/30 bg-red-500/10 text-red-400",
    high: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    low: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

export default function AIInsights({
    loading,
    result,
    generatedAt,
    failedChecks,
    failureRate,
    onAnalyse,
}) {
    const recommendations = Array.isArray(result?.recommendations)
        ? result.recommendations
        : result?.suggestion?.split(". ").filter(Boolean).slice(0, 3) || [];

    return (
        <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Incident Report
                    </CardTitle>

                    {generatedAt && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            Generated{" "}
                            {formatDistanceToNow(generatedAt, {
                                addSuffix: true,
                            })}
                        </p>
                    )}
                </div>

                <Button
                    onClick={onAnalyse}
                    disabled={loading}
                    className="gap-2"
                >
                    {loading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}

                    {result ? "Refresh Report" : "Generate Report"}
                </Button>
            </CardHeader>

            <CardContent className="space-y-6">
                {!loading && !result && (
                    <div className="rounded-lg border border-dashed border-zinc-800 py-14 text-center">
                        <BrainCircuit className="mx-auto mb-5 h-12 w-12 text-zinc-500" />

                        <h3 className="text-xl font-semibold">
                            No AI Report Yet
                        </h3>

                        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
                            Generate an AI report to analyze recent failures and
                            receive recommendations.
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 py-14">
                        <LoaderCircle className="mb-5 h-10 w-10 animate-spin text-white" />

                        <h3 className="text-lg font-semibold">
                            Generating AI Report...
                        </h3>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Analyzing recent monitor activity.
                        </p>
                    </div>
                )}

                {!loading && result?.message && (
                    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-8">
                        <div className="flex items-center gap-3">
                            <CircleCheck className="h-6 w-6 text-green-400" />

                            <h3 className="text-lg font-semibold">
                                No Issues Detected
                            </h3>
                        </div>

                        <p className="mt-4 text-muted-foreground">
                            {result.message}
                        </p>
                    </div>
                )}

                {!loading && result && !result.message && (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Severity
                                </p>

                                <Badge
                                    variant="outline"
                                    className={`px-3 py-1 text-sm font-semibold ${
                                        severityStyles[
                                            result.severity?.toLowerCase()
                                        ] ?? severityStyles.low
                                    }`}
                                >
                                    {result.severity}
                                </Badge>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Failed Checks
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    {failedChecks}
                                </p>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4">
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Failure Rate
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    {failureRate}%
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5 text-purple-400" />

                                <h3 className="text-lg font-semibold">
                                    AI Summary
                                </h3>
                            </div>

                            <p className="text-[16px] leading-7 text-zinc-300">
                                {result.summary}
                            </p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" />

                                    <h3 className="text-lg font-semibold">
                                        Likely Root Cause
                                    </h3>
                                </div>

                                <p className="text-[15px] leading-6 text-zinc-300">
                                    {result.probable_cause}
                                </p>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <CircleCheck className="h-5 w-5 text-green-400" />

                                    <h3 className="text-lg font-semibold">
                                        Recommended Actions
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {recommendations.map((step, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 rounded-lg border border-zinc-700/70 bg-zinc-900/40 px-3 py-2"
                                        >
                                            <CircleCheck className="mt-1 h-4 w-4 shrink-0 text-green-400" />

                                            <p className="text-[15px] text-zinc-300">
                                                {step.trim()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}