import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Submission } from "@shared/schema";
import { formatAddress, generateMockTokenData } from "@/lib/solana-utils";
import { ThumbsUp, TrendingUp } from "lucide-react";

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
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select defaultValue="votes">
            <SelectTrigger className="w-[140px]" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="votes">Most Votes</SelectItem>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="market-cap">Market Cap</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {submissions.map((submission) => {
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
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                        {tokenData.emoji}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" data-testid={`text-token-name-${submission.id}`}>
                          {submission.tokenName || tokenData.name}
                        </h3>
                        <p className="text-muted-foreground" data-testid={`text-token-symbol-${submission.id}`}>
                          ${submission.tokenSymbol || tokenData.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1" data-testid={`text-contract-address-${submission.id}`}>
                          {formatAddress(submission.contractAddress)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent" data-testid={`text-vote-count-${submission.id}`}>
                        {submission.votes || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">votes</p>
                    </div>
                  </div>
                  
                  {/* Chart placeholder */}
                  <div className="h-32 rounded-lg mb-4 flex items-center justify-center border border-border bg-gradient-to-r from-primary/10 to-accent/10">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                      <p className="text-sm text-muted-foreground">Live Chart Integration</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">Market Cap: <span className="text-foreground font-medium">$2.1M</span></p>
                      <p className="text-muted-foreground">24h: <span className="text-accent font-medium">+15.3%</span></p>
                    </div>
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
      )}
      
      {submissions.length > 0 && (
        <div className="text-center mt-8">
          <Button 
            variant="secondary" 
            className="px-6 py-3"
            data-testid="button-load-more-submissions"
          >
            Load More Submissions
          </Button>
        </div>
      )}
    </section>
  );
}
