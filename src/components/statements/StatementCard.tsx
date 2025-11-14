"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, RefreshCw, FileText, Calendar } from "lucide-react";
import { deleteStatement, reprocessStatement } from "@/lib/actions/statements";
import { useToast } from "@/lib/hooks";
import type { RawStatement } from "@/lib/db/statements";

export function StatementCard({ statement }: { statement: RawStatement }) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will delete the statement and all associated income entries.")) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteStatement(statement.id);

    if (result.success) {
      toast.success("Statement deleted successfully");
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  };

  const handleReprocess = async () => {
    setIsReprocessing(true);
    const result = await reprocessStatement(statement.id);

    if (result.success) {
      toast.success(`Reprocessed: ${result.data.entriesCreated} entries created`);
    } else {
      toast.error(result.error);
    }
    setIsReprocessing(false);
  };

  const handleDownload = () => {
    const payload = statement.raw_payload as { csvContent?: string };
    if (!payload.csvContent) {
      toast.error("No CSV content available");
      return;
    }

    const blob = new Blob([payload.csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = statement.file_name || `statement-${statement.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{statement.label}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{statement.provider}</Badge>
                <Badge variant="default">{statement.source_system}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              title="Download CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReprocess}
              disabled={isReprocessing}
              title="Reprocess statement"
            >
              <RefreshCw className={`h-4 w-4 ${isReprocessing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete statement"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Entries Parsed</p>
            <p className="font-semibold text-lg">
              {statement.parsed_entries_count || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">File Size</p>
            <p className="font-semibold">
              {statement.file_size
                ? `${(statement.file_size / 1024).toFixed(1)} KB`
                : "N/A"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Imported
            </p>
            <p className="font-semibold">
              {new Date(statement.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
