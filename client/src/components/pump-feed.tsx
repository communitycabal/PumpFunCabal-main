import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type PumpHistory } from "@shared/schema";
import { formatAddress } from "@/lib/solana-utils";
import { Trophy, Medal, Award, ExternalLink, TrendingUp } from "lucide-react";

const iconMap = {
  0: Trophy,
  1: Medal,
  2: Award,
};

export default function PumpFeed() {
  const { data: pumpHistory = [], isLoading } = useQuery<PumpHistory[]>({
    queryKey: ["/api/pump-history"],
  });

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (isLoading) {
    return (
      <section>
        <h2 className="text-3xl font-bold mb-8">Recent Pumps</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border border-border animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-3xl font-bold mb-8">Recent Pumps</h2>
      
      {pumpHistory.length === 0 ? (
        <Card className="bg-card border border-border">
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pumps Yet</h3>
            <p className="text-muted-foreground">Pump history will appear here once the first round completes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pumpHistory.map((pump, index) => {
            const IconComponent = iconMap[index as keyof typeof iconMap] || Award;
            
            return (
              <Card 
                key={pump.id} 
                className="bg-card border border-border hover:border-accent/50 transition-colors"
                data-testid={`card-pump-${pump.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                        <IconComponent className="text-primary-foreground h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg" data-testid={`text-pump-token-${pump.id}`}>
                          {pump.tokenName} (${pump.tokenSymbol})
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`text-pump-time-${pump.id}`}>
                          {formatTimeAgo(pump.createdAt!)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-accent" data-testid={`text-pump-amount-${pump.id}`}>
                        {pump.amountPumped} SOL
                      </p>
                      <p className="text-sm text-muted-foreground">pumped</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-muted-foreground">
                        Votes: <span className="text-foreground font-medium" data-testid={`text-pump-votes-${pump.id}`}>
                          {pump.votes}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Price Impact: <span className="text-accent font-medium" data-testid={`text-pump-impact-${pump.id}`}>
                          {pump.priceImpact || "+23.4%"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {pump.transactionHash && (
                        <a 
                          href={`https://solscan.io/tx/${pump.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors flex items-center"
                          data-testid={`link-solscan-${pump.id}`}
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Solscan
                        </a>
                      )}
                      <div className="text-2xl animate-bounce">🚀</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {pumpHistory.length > 0 && (
        <div className="text-center mt-8">
          <Button 
            variant="secondary" 
            className="px-6 py-3"
            data-testid="button-view-all-history"
          >
            View All Pump History
          </Button>
        </div>
      )}
    </section>
  );
}
