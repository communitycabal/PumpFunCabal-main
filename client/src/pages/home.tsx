import { useQuery } from "@tanstack/react-query";
import CountdownSection from "@/components/countdown-section";
import SubmissionForm from "@/components/submission-form";
import VotingSection from "@/components/voting-section";
import PumpFeed from "@/components/pump-feed";
import { Rocket, Wallet } from "lucide-react";

export default function Home() {
  const { data: stats } = useQuery<{
    totalPool: number;
    totalVotes: number;
    submissionCount: number;
  }>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Rocket className="text-primary-foreground text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Community Cabal</h1>
                <p className="text-sm text-muted-foreground">$CC</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-lg">
                <Wallet className="text-accent h-4 w-4" />
                <span className="text-sm font-medium">7K4x...9mL2</span>
              </div>
              <button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                data-testid="button-connect-wallet"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
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
            
            <a 
              href="https://x.com/CommunityCABAAL" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-twitter-community"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Follow Community Cabal</span>
            </a>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Community Cabal. Built on Solana. Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
