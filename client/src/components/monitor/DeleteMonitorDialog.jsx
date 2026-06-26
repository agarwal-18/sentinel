import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteMonitorDialog({
    open,
    onOpenChange,
    monitorName,
    loading,
    onConfirm,
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-zinc-800 bg-zinc-950">
                <AlertDialogHeader>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                        <AlertTriangle className="h-7 w-7 text-red-400" />
                    </div>

                    <AlertDialogTitle className="text-2xl">
                        Delete Monitor
                    </AlertDialogTitle>

                    <AlertDialogDescription className="space-y-4 pt-2 text-base">
                        <span className="block">
                            You're about to permanently delete
                            <span className="font-semibold text-white">
                                {" "}
                                {monitorName}
                            </span>
                        </span>

                        <span className="block">
                            This action cannot be undone.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                    <p className="mb-3 text-sm font-medium text-red-400">
                        The following data will be permanently removed:
                    </p>

                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Monitor configuration</li>
                        <li>• Health check history</li>
                        <li>• Latency records</li>
                        <li>• AI incident reports</li>
                    </ul>
                </div>

                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel disabled={loading}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Monitor
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}