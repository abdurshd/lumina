'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mic, Video, PhoneOff } from 'lucide-react';

export function SessionMockup() {
    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="glass overflow-hidden flex flex-col h-[500px]">
                {/* Header */}
                <div className="bg-card/50 p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 absolute -bottom-0.5 -right-0.5 border-2 border-card" />
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarImage src="/ai-avatar-placeholder.png" alt="Lumina AI" />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold">Lumina Guide</h4>
                            <p className="text-[10px] text-muted-foreground">04:12 • Recording...</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20 animate-pulse">LIVE</Badge>
                </div>

                {/* Video Area (Main) */}
                <div className="flex-1 relative bg-black/40 flex items-center justify-center p-4">
                    {/* Placeholder for AI Visualization */}
                    <div className="w-32 h-32 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping-slow" />
                        <div className="h-20 w-20 rounded-full bg-primary/10 backdrop-blur-md flex items-center justify-center">
                            <div className="flex gap-1">
                                <div className="w-1 h-3 bg-primary rounded-full animate-audio-bar" style={{ animationDelay: '0s' }} />
                                <div className="w-1 h-5 bg-primary rounded-full animate-audio-bar" style={{ animationDelay: '0.1s' }} />
                                <div className="w-1 h-3 bg-primary rounded-full animate-audio-bar" style={{ animationDelay: '0.2s' }} />
                            </div>
                        </div>
                    </div>

                    {/* User PIP */}
                    <div className="absolute bottom-4 right-4 w-24 h-32 bg-secondary rounded-lg border border-border overflow-hidden shadow-lg">
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <div className="text-[10px] text-muted-foreground">You</div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 bg-card/80 backdrop-blur-md border-t border-border flex justify-center gap-4">
                    <button className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                        <Mic className="h-5 w-5" />
                    </button>
                    <button className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                        <Video className="h-5 w-5" />
                    </button>
                    <button className="h-10 w-10 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20">
                        <PhoneOff className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
