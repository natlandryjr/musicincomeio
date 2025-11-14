"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, XCircle } from "lucide-react";
import { createStatementFromCSV } from "@/lib/actions/statements";
import { useToast } from "@/lib/hooks";

export function StatementUploader() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);

    try {
      // Read file content
      const content = await file.text();

      // Upload and parse
      const result = await createStatementFromCSV(content, file.name);

      if (result.success) {
        toast.success(
          `Statement uploaded! Created ${result.data.entriesCreated} income entries`
        );
        setFile(null);
        // Reset file input
        const input = document.getElementById("csv-upload") as HTMLInputElement;
        if (input) input.value = "";
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to read file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Statement
        </CardTitle>
        <CardDescription>
          Upload a CSV file from DistroKid, TuneCore, or CD Baby
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileText className="h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {file ? file.name : "Click to select CSV file"}
              </p>
              <p className="text-xs text-gray-500">
                Max file size: 10MB
              </p>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFile(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload & Parse"}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>✓ Supports DistroKid, TuneCore, and CD Baby formats</p>
            <p>✓ Automatically detects CSV format</p>
            <p>✓ Creates income entries from statement</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
