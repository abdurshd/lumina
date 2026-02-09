'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/fetch-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, Scale, Loader2, AlertTriangle } from 'lucide-react';
import type { BenchmarkResult } from '@/lib/eval/benchmark-runner';
import type { BiasAuditResult } from '@/lib/eval/bias-runner';

export default function EvalDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Evaluation Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Run benchmarks and bias audits to verify system quality and fairness.
        </p>
      </div>

      <Card className="mb-8 border-yellow-500/30 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-base text-yellow-500">
            <AlertTriangle className="h-4 w-4" />
            Compliance Gate
          </CardTitle>
          <CardDescription className="text-yellow-500/80">
            Keep 16+ deployment behind legal approval for Gemini API usage terms before public launch.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="benchmarks">
        <TabsList>
          <TabsTrigger value="benchmarks">
            <FlaskConical className="mr-1.5 h-4 w-4" />
            Benchmarks
          </TabsTrigger>
          <TabsTrigger value="bias">
            <Scale className="mr-1.5 h-4 w-4" />
            Bias Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="benchmarks" className="mt-6">
          <BenchmarkTab />
        </TabsContent>

        <TabsContent value="bias" className="mt-6">
          <BiasAuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BenchmarkTab() {
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<BenchmarkResult>('/api/eval/benchmark', { method: 'POST' });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Benchmark failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans">
            <FlaskConical className="h-5 w-5 text-primary" />
            Profile Builder Benchmark
          </CardTitle>
          <CardDescription>
            Tests synthetic profiles against the RIASEC profile builder and measures accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRun} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Benchmark
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans text-base">
                Summary
                <Badge variant={result.summary.passing ? 'default' : 'destructive'}>
                  {result.summary.passing ? 'PASS' : 'FAIL'}
                </Badge>
                {result.regressionDetected && (
                  <Badge variant="destructive">Regression Detected</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <SummaryMetric label="Profiles" value={String(result.summary.profileCount)} />
                <SummaryMetric label="RIASEC Accuracy" value={`${(result.summary.avgRiasecAccuracy * 100).toFixed(1)}%`} />
                <SummaryMetric label="Cluster Overlap" value={`${(result.summary.avgClusterOverlap * 100).toFixed(1)}%`} />
                <SummaryMetric label="Stability" value={`${(result.summary.stability * 100).toFixed(1)}%`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-base">Profile Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">ID</th>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Computed</th>
                      <th className="pb-2 pr-4">Expected</th>
                      <th className="pb-2 pr-4">RIASEC Acc</th>
                      <th className="pb-2">Cluster Overlap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.profiles.map((p) => (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">{p.id}</td>
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="py-2 pr-4 font-mono">{p.computedRiasec}</td>
                        <td className="py-2 pr-4 font-mono">{p.expectedRiasec}</td>
                        <td className="py-2 pr-4">{(p.riasecAcc * 100).toFixed(1)}%</td>
                        <td className="py-2">{(p.clusterOverlap * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function BiasAuditTab() {
  const [result, setResult] = useState<BiasAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<BiasAuditResult>('/api/eval/bias', { method: 'POST' });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bias audit failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans">
            <Scale className="h-5 w-5 text-primary" />
            Bias Audit
          </CardTitle>
          <CardDescription>
            Generates reports for paired profiles with identical scores but different names,
            then measures divergence to detect demographic bias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRun} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Bias Audit
          </Button>
          {loading && (
            <p className="mt-2 text-xs text-muted-foreground">
              This may take a couple of minutes as it generates 10 reports via Gemini.
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans text-base">
                Summary
                <Badge variant={result.summary.passing ? 'default' : 'destructive'}>
                  {result.summary.passing ? 'PASS' : 'FAIL'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <SummaryMetric label="Avg Overall Bias" value={`${(result.summary.avgOverallBias * 100).toFixed(1)}%`} />
                <SummaryMetric label="Max Bias" value={`${(result.summary.maxBias * 100).toFixed(1)}%`} />
                <SummaryMetric label="Threshold" value="< 15%" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-base">Pair Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Profile A</th>
                      <th className="pb-2 pr-4">Profile B</th>
                      <th className="pb-2 pr-4">Career Div.</th>
                      <th className="pb-2 pr-4">Strength Div.</th>
                      <th className="pb-2 pr-4">Radar Div.</th>
                      <th className="pb-2">Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.pairs.map((p, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 pr-4">{p.nameA}</td>
                        <td className="py-2 pr-4">{p.nameB}</td>
                        <td className="py-2 pr-4">{(p.careerDivergence * 100).toFixed(1)}%</td>
                        <td className="py-2 pr-4">{(p.strengthDivergence * 100).toFixed(1)}%</td>
                        <td className="py-2 pr-4">{(p.radarDivergence * 100).toFixed(1)}%</td>
                        <td className="py-2">
                          <span className={p.overall >= 0.15 ? 'text-destructive font-medium' : ''}>
                            {(p.overall * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
