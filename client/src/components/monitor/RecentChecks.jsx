import {
    CheckCircle2,
    XCircle,
    Clock3,
    History,
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function RecentChecks({ pings }) {
    return (
        <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5 text-blue-400" />
                    Recent Health Checks
                </CardTitle>

                <p className="text-[15px] text-muted-foreground">
                    Latest monitoring events
                </p>
            </CardHeader>

            <CardContent className="max-h-[600px] overflow-y-auto">
                {pings.length === 0 ? (
                    <div className="flex h-40 items-center justify-center text-muted-foreground">
                        No health checks yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pings.slice(0, 20).map((ping) => (
                            <div
                                key={ping.id}
                                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900"
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        {ping.is_up ? (
                                            <CheckCircle2 className="h-8 w-8 text-green-400" />
                                        ) : (
                                            <XCircle className="h-8 w-8 text-red-400" />
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    ping.is_up
                                                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                                                        : "border-red-500/30 bg-red-500/10 text-red-400"
                                                }
                                            >
                                                {ping.is_up ? "UP" : "DOWN"}
                                            </Badge>

                                            <span className="text-sm text-muted-foreground">
                                                HTTP{" "}
                                                {ping.status_code ?? "--"}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock3 className="h-4 w-4" />

                                            {formatDistanceToNow(
                                                new Date(ping.checked_at),
                                                {
                                                    addSuffix: true,
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-xl font-semibold">
                                        {ping.latency != null
                                            ? `${ping.latency} ms`
                                            : "--"}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Response Time
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}