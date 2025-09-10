import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Vote, TrendingUp } from "lucide-react";

interface Stats {
  totalPool: number;
  totalVotes: number;
  submissionCount: number;
}

interface CountdownSectionProps {
  stats?: Stats;
}

export default function CountdownSection({ stats }: CountdownSectionProps) {
  const [timeRemaining, setTimeRemaining] = useState("06:23");

  useEffect(() => {
    let minutes = 6;
    let seconds = 23;

    const interval = setInterval(() => {
      seconds--;
      if (seconds < 0) {
        seconds = 59;
        minutes--;
      }
      if (minutes < 0) {
        minutes = 9; // Reset for demo
        seconds = 59;
      }

      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setTimeRemaining(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="text-center space-y-6">
      <div className="inline-block bg-gradient-to-r from-primary to-accent p-1 rounded-2xl">
        <div className="bg-background px-8 py-6 rounded-xl">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Next Pump In</h2>
          <div 
            className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-pulse"
            data-testid="text-countdown"
          >
            {timeRemaining}
          </div>
          <p className="text-muted-foreground mt-2">Minutes : Seconds</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-lg mx-auto mb-4">
              <Coins className="text-accent text-xl" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Total Pool</h3>
            <p className="text-2xl font-bold text-accent" data-testid="text-total-pool">
              {stats?.totalPool || 12.4} SOL
            </p>
            <p className="text-sm text-muted-foreground">~$2,486</p>
          </CardContent>
        </Card>
        
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
