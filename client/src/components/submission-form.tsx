import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSubmissionSchema } from "@shared/schema";
import { isValidSolanaAddress, generateMockTokenData } from "@/lib/solana-utils";
import { NotebookPen, Clipboard, Info } from "lucide-react";
import { z } from "zod";

const formSchema = insertSubmissionSchema.extend({
  contractAddress: z.string().min(1, "Contract address is required").refine(isValidSolanaAddress, {
    message: "Invalid Solana address format"
  })
});

export default function SubmissionForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractAddress: "",
      tokenName: "",
      tokenSymbol: "",
      submittedBy: ""
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const tokenData = generateMockTokenData(data.contractAddress);
      const submissionData = {
        ...data,
        tokenName: tokenData.name,
        tokenSymbol: tokenData.symbol,
        submittedBy: "7K4x...9mL2" // Mock wallet address
      };
      
      const response = await apiRequest("POST", "/api/submissions", submissionData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Token submitted successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      if (error.message.includes("409")) {
        toast({
          title: "Already Submitted",
          description: "This contract address has already been submitted. Your submission counts as a vote!",
          variant: "default",
        });
        form.reset();
      } else {
        toast({
          title: "Error",
          description: "Failed to submit token. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      form.setValue("contractAddress", text);
      form.trigger("contractAddress");
    } catch (err) {
      console.log("Failed to read clipboard");
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    submitMutation.mutate(data);
  };

  return (
    <section className="max-w-2xl mx-auto">
      <Card className="bg-card border border-border">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Submit Your Token</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="contractAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Contract Address <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Paste Solana contract address here..."
                          className="pr-10"
                          data-testid="input-contract-address"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={handlePaste}
                        data-testid="button-paste"
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">Only valid Pump.fun token contracts are accepted</p>
                  </FormItem>
                )}
              />
              
              <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                <Info className="text-accent h-5 w-5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Submission Rules:</p>
                  <ul className="text-muted-foreground mt-1 space-y-1">
                    <li>• One submission per wallet per round</li>
                    <li>• Duplicate submissions count as votes</li>
                    <li>• Must be valid Pump.fun contract</li>
                  </ul>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-4 px-6 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={submitMutation.isPending}
                data-testid="button-submit-token"
              >
                {submitMutation.isPending ? (
                  <>Loading...</>
                ) : (
                  <>
                    <NotebookPen className="mr-2 h-4 w-4" />
                    Submit Token
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
