import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Submission } from "@shared/schema";
import { formatAddress, generateMockTokenData } from "@/lib/solana-utils";
import { ThumbsUp, TrendingUp, ExternalLink, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function VotingSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  const voteMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await apiRequest("POST", `/api/submissions/${submissionId}/vote`, {
        voterAddress: "7K4x...9mL2" // Mock wallet address
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Vote Recorded!",
        description: `Your vote has been counted. Total votes: ${data.voteCount}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      if (error.message.includes("409")) {
        toast({
          title: "Already Voted",
          description: "You have already voted for this submission.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to record vote. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleVote = (submissionId: string) => {
    voteMutation.mutate(submissionId);
  };

  if (isLoading) {
    return (
      <section>
        <h2 className="text-3xl font-bold mb-8">Vote for Next Pump</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border border-border animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Vote for Next Pump</h2>
      </div>
      
      {submissions.length === 0 ? (
        <Card className="bg-card border border-border">
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
            <p className="text-muted-foreground">Be the first to submit a token for the community to vote on!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Most recent 10 submissions */}
          <div>
            {(() => {
              const recent = [...submissions]
                .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())
                .slice(0, 10);
              if (recent.length === 0) return null;
              return (
                <>
                  <h3 className="text-xl font-semibold mb-4">Most Recent Submissions</h3>
                  <ScrollArea className="h-[720px] pr-2">
                  <div className="space-y-6">
                    {recent.map((submission) => {
                      const tokenData = generateMockTokenData(submission.contractAddress);
                      return (
                        <Card 
                          key={submission.id} 
                          className="bg-card border border-border hover:border-primary/50 transition-all duration-300 group"
                          data-testid={`card-submission-${submission.id}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h3 className="text-xl font-bold" data-testid={`text-token-name-${submission.id}`}>
                                    {submission.tokenName || tokenData.name}
                                  </h3>
                                  <p className="text-muted-foreground" data-testid={`text-token-symbol-${submission.id}`}>
                                    ${submission.tokenSymbol || tokenData.symbol}
                                  </p>
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2" data-testid={`text-contract-address-${submission.id}`}>
                                    <span>{formatAddress(submission.contractAddress)}</span>
                                    <button
                                      aria-label="Copy contract address"
                                      className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md hover:bg-muted/40 transition-colors"
                                      onClick={() => navigator.clipboard.writeText(submission.contractAddress)}
                                      data-testid={`button-copy-address-${submission.id}`}
                                    >
                                      <Copy className="h-3 w-3" /> Copy
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-accent" data-testid={`text-vote-count-${submission.id}`}>
                                  {submission.votes || 0}
                                </div>
                                <p className="text-sm text-muted-foreground">votes</p>
                              </div>
                            </div>
                            <div className="mb-4">
                              <a 
                                href={`https://pump.fun/coin/${submission.contractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-full h-16 rounded-lg border border-border bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-all duration-300 text-muted-foreground hover:text-foreground"
                                data-testid={`link-chart-${submission.id}`}
                              >
                                <TrendingUp className="h-5 w-5 mr-2" />
                                <span className="font-medium">View Chart on Pump.fun</span>
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </a>
                            </div>
                            <div className="flex items-center justify-between">
                              <Button 
                                onClick={() => handleVote(submission.id)}
                                disabled={voteMutation.isPending}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 font-semibold transition-all transform hover:scale-105 active:scale-95"
                                data-testid={`button-vote-${submission.id}`}
                              >
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                {voteMutation.isPending ? "Voting..." : "Vote"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  </ScrollArea>
                </>
              );
            })()}
          </div>

          {/* Leaderboard top 5 by votes */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Leaderboard (Top 5)</h3>
            <div className="space-y-3">
              {[...submissions]
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                .slice(0, 5)
                .map((s, idx) => {
                  const tokenData = generateMockTokenData(s.contractAddress);
                  return (
                    <Card key={s.id} className="bg-card border border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-8 text-center text-muted-foreground font-semibold">{idx + 1}</div>
                            <div>
                              <div className="font-semibold" data-testid={`lb-name-${s.id}`}>
                                {s.tokenName || tokenData.name} <span className="text-muted-foreground">(${s.tokenSymbol || tokenData.symbol})</span>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2" data-testid={`lb-addr-${s.id}`}>
                                <span>{formatAddress(s.contractAddress)}</span>
                                <button
                                  aria-label="Copy contract address"
                                  className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-md hover:bg-muted/40 transition-colors"
                                  onClick={() => navigator.clipboard.writeText(s.contractAddress)}
                                  data-testid={`lb-copy-${s.id}`}
                                >
                                  <Copy className="h-3 w-3" /> Copy
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-accent" data-testid={`lb-votes-${s.id}`}>{s.votes || 0}</div>
                              <div className="text-xs text-muted-foreground">votes</div>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handleVote(s.id)}
                              disabled={voteMutation.isPending}
                              data-testid={`lb-vote-${s.id}`}
                            >
                              <ThumbsUp className="mr-2 h-4 w-4" /> Vote
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
