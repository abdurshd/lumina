'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const DATA = [
    { subject: 'Artistic', A: 90, fullMark: 100 },
    { subject: 'Investigative', A: 85, fullMark: 100 },
    { subject: 'Social', A: 65, fullMark: 100 },
    { subject: 'Enterprising', A: 50, fullMark: 100 },
    { subject: 'Conventional', A: 30, fullMark: 100 },
    { subject: 'Realistic', A: 40, fullMark: 100 },
];

export function ReportMockup() {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="glass p-6 md:p-10 relative overflow-hidden">

                <div className="flex flex-col md:flex-row gap-10">
                    {/* Left: Chart */}
                    <div className="flex-1 min-h-[300px] relative">
                        <div className="absolute top-0 left-0 z-10">
                            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 mb-2">RIASEC: AIS</Badge>
                            <h3 className="text-xl font-bold">Talent Profile</h3>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={DATA}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Talent"
                                    dataKey="A"
                                    stroke="#22d3ee"
                                    strokeWidth={3}
                                    fill="#22d3ee"
                                    fillOpacity={0.2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Right: Insights */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Top Matches</h4>
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">UX Researcher</p>
                                        <p className="text-xs text-muted-foreground">Tech & Design</p>
                                    </div>
                                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">98% Match</Badge>
                                </div>
                                <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">Investigative Journalist</p>
                                        <p className="text-xs text-muted-foreground">Media</p>
                                    </div>
                                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">94% Match</Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Hidden Talent</h4>
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                <p className="text-sm font-medium text-primary mb-1">Pattern Recognition</p>
                                <p className="text-xs text-muted-foreground">
                                    Your ability to connect disparate data points (Investigative) with aesthetic intuition (Artistic) is in the top 1% of our user base.
                                </p>
                            </div>
                        </div>

                        <Button className="w-full gap-2" variant="outline">
                            <Download className="h-4 w-4" /> Download Full PDF
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
