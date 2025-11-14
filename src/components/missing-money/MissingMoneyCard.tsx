"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, ExternalLink, DollarSign } from "lucide-react";
import type { MissingMoneyAnalysis } from "@/lib/missing-money/detector";

export function MissingMoneyCard({ analysis }: { analysis: MissingMoneyAnalysis }) {
  if (!analysis.hasCollectedIncome) {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Missing Money Detector
          </CardTitle>
          <CardDescription>
            Connect your income sources to detect missing royalties
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (analysis.totalEstimated === 0) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Missing Money Detector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-800 dark:text-green-200">
            Great! We didn't detect any major missing revenue streams.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Missing Money Detector
        </CardTitle>
        <CardDescription>
          Potential uncollected royalties based on your activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Estimate */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Estimated Uncollected (Annual)
          </p>
          <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">
            ${analysis.totalEstimated.toLocaleString()}
          </p>
        </div>

        {/* Individual Estimates */}
        <div className="space-y-3">
          {analysis.estimates.map((estimate) => (
            <div
              key={estimate.source}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{estimate.sourceName}</h3>
                    <Badge
                      variant={
                        estimate.priority === "critical"
                          ? "danger"
                          : estimate.priority === "high"
                            ? "default"
                            : "muted"
                      }
                    >
                      {estimate.priority}
                    </Badge>
                    <Badge variant="outline">
                      {estimate.confidenceLabel} confidence ({estimate.confidence}%)
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {estimate.reason}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    ${estimate.estimatedAnnual}
                  </p>
                  <p className="text-xs text-gray-500">per year</p>
                </div>
              </div>

              {estimate.actionUrl && (
                <Button size="sm" variant="secondary" asChild className="w-full">
                  <a
                    href={estimate.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {estimate.actionLabel || "Learn More"}
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Trends (if any dropoffs detected) */}
        {analysis.trends.filter((t) => t.hasDropoff).length > 0 && (
          <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              Income Dropoffs Detected
            </h4>
            <div className="space-y-2 text-sm">
              {analysis.trends
                .filter((t) => t.hasDropoff)
                .map((trend) => (
                  <div
                    key={trend.source}
                    className="flex items-center justify-between"
                  >
                    <span className="capitalize">
                      {trend.source.replace(/_/g, " ")}
                    </span>
                    <Badge variant="outline" className="text-orange-700">
                      -{trend.dropoffPercentage}%
                    </Badge>
                  </div>
                ))}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
              Recent income has dropped compared to previous periods. This might indicate missing payments or expired agreements.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
