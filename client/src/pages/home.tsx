import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Copy } from "lucide-react";
import CountdownSection from "@/components/countdown-section";
import SubmissionForm from "@/components/submission-form";
import VotingSection from "@/components/voting-section";
import PumpFeed from "@/components/pump-feed";
import { Rocket } from "lucide-react";

export default function Home() {
  const { data: stats } = useQuery<{
    totalPool: number;
    totalVotes: number;
    submissionCount: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: pumpHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/pump-history"],
    refetchInterval: 4000,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-card flex items-center justify-center border border-border">
                <img src="/logo.png" alt="Community Cabal" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Community Cabal</h1>
                <p className="text-sm text-muted-foreground">$CC</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {pumpHistory.length > 0 && (
          <div className="border border-border rounded-xl p-4 bg-card/40">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Most Recent Pump</div>
                <div className="text-lg font-semibold">
                  {pumpHistory[0].tokenName} <span className="text-muted-foreground">({pumpHistory[0].tokenSymbol})</span>
                </div>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="font-mono text-muted-foreground">{pumpHistory[0].contractAddress?.slice(0,4)}…{pumpHistory[0].contractAddress?.slice(-4)}</span>
                  <button
                    aria-label="Copy contract address"
                    className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md hover:bg-muted/40 transition-colors"
                    onClick={() => navigator.clipboard.writeText(pumpHistory[0].contractAddress)}
                    data-testid="button-copy-latest-address"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
              </div>
              <a
                href={`https://pump.fun/coin/${pumpHistory[0].contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted/40 transition-colors"
                data-testid="link-latest-pumpfun"
              >
                <ExternalLink className="h-4 w-4" /> View on Pump.fun
              </a>
            </div>
          </div>
        )}
        <CountdownSection stats={stats} />
        <SubmissionForm />
        <VotingSection />
        <PumpFeed />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Rocket className="text-primary-foreground h-4 w-4" />
              </div>
              <span className="text-lg font-bold">Community Cabal</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="https://x.com/community_cabal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-x-account"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Follow @community_cabal</span>
              </a>

              <a 
                href="https://x.com/i/communities/1965797507914477791" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-x-community"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Join the Community</span>
              </a>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Community Cabal. Built on Solana. Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
