import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Vote, TrendingUp } from "lucide-react";

interface Stats {
  totalPool: number;
  totalVotes: number;
  submissionCount: number;
}

interface CountdownSectionProps {
  stats?: Stats;
}

export default function CountdownSection({ stats }: CountdownSectionProps) {
  const [timeRemaining, setTimeRemaining] = useState("10:00");
  const [phase, setPhase] = useState<"voting" | "tiebreak">("voting");
  const [candidates, setCandidates] = useState<Array<{ id: string; name: string; symbol: string }>>([]);
  const [currentCandidateIdx, setCurrentCandidateIdx] = useState(0);
  const remainingRef = useRef<number>(0);

  useEffect(() => {
    let tickInterval: number | undefined;
    let spinInterval: number | undefined;

    const format = (totalSeconds: number) => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const applyRound = (dto: any) => {
      if (dto.phase === 'voting') {
        setPhase('voting');
        remainingRef.current = dto.remainingSeconds ?? 0;
        setTimeRemaining(format(remainingRef.current));
      } else {
        setPhase('tiebreak');
        remainingRef.current = dto.remainingSeconds ?? 0;
        setTimeRemaining(`00:${(remainingRef.current || 0).toString().padStart(2,'0')}`);
        const cands = (dto.candidates || []).map((c: any) => ({ id: c.id, name: c.name, symbol: c.symbol }));
        setCandidates(cands);
      }
    };

    const poll = async () => {
      try {
        const res = await fetch('/api/round');
        if (!res.ok) throw new Error('Failed');
        const dto = await res.json();
        applyRound(dto);
      } catch {
        // ignore transient errors
      }
    };

    const tick = () => {
      remainingRef.current = Math.max(0, remainingRef.current - 1);
      if (phase === 'voting') {
        setTimeRemaining(format(remainingRef.current));
      } else {
        setTimeRemaining(`00:${(remainingRef.current || 0).toString().padStart(2,'0')}`);
        // during tiebreak, spin highlight faster
        setCurrentCandidateIdx((idx) => candidates.length ? (idx + 1) % candidates.length : 0);
      }
      if (remainingRef.current === 0) {
        // force refresh state boundary
        poll();
      }
    };

    // initial poll and start intervals
    poll();
    tickInterval = window.setInterval(tick, 1000) as unknown as number;
    // extra spin speed; if needed, uncomment to spin faster than 1s
    // spinInterval = window.setInterval(() => setCurrentCandidateIdx((i)=> candidates.length ? (i+1)%candidates.length : 0), 200) as unknown as number;

    return () => {
      if (tickInterval) window.clearInterval(tickInterval);
      if (spinInterval) window.clearInterval(spinInterval);
    };
  }, [phase, candidates.length]);

  return (
    <section className="text-center space-y-6">
      <div className="inline-block bg-gradient-to-r from-primary to-accent p-1 rounded-2xl">
        <div className="bg-background px-8 py-6 rounded-xl">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
            {phase === 'voting' ? 'Next Pump In' : 'Tiebreak: Picking winner'}
          </h2>
          <div 
            className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-pulse"
            data-testid="text-countdown"
          >
            {timeRemaining}
          </div>
          <p className="text-muted-foreground mt-2">Minutes : Seconds</p>
          {phase === 'tiebreak' && candidates.length > 0 && (
            <div className="mt-4 text-center">
              <div className="inline-block px-4 py-2 rounded-lg border border-border bg-card/40 animate-pulse">
                <span className="font-semibold">{candidates[currentCandidateIdx]?.name}</span>
                <span className="text-muted-foreground"> ({candidates[currentCandidateIdx]?.symbol})</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Tie detected — randomly selecting winner</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-lg mx-auto mb-4">
              <Vote className="text-primary text-xl" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Active Votes</h3>
            <p className="text-2xl font-bold text-primary" data-testid="text-total-votes">
              {stats?.totalVotes || 0}
            </p>
            <p className="text-sm text-muted-foreground">This round</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-warning/20 rounded-lg mx-auto mb-4">
              <TrendingUp className="text-warning text-xl" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Submissions</h3>
            <p className="text-2xl font-bold text-warning" data-testid="text-submission-count">
              {stats?.submissionCount || 0}
            </p>
            <p className="text-sm text-muted-foreground">Competing</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
