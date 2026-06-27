import { useParams, Link, useLocation } from "wouter";
import { useGetChallenge, getGetChallengeQueryKey, useCompleteChallenge } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Lightbulb, CheckCircle2, Play, Terminal } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const challengeId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: challenge, isLoading } = useGetChallenge(challengeId, {
    query: { enabled: !!challengeId, queryKey: getGetChallengeQueryKey(challengeId) }
  });

  const completeMutation = useCompleteChallenge({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Challenge Completed!",
          description: `You earned ${challenge?.xpReward} XP.`,
        });
        queryClient.invalidateQueries({ queryKey: getGetChallengeQueryKey(challengeId) });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to mark challenge as completed.",
          variant: "destructive",
        });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-2/3" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Challenge not found</h2>
        <Link href="/challenges">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Challenges</Button>
        </Link>
      </div>
    );
  }

  const handleComplete = () => {
    completeMutation.mutate({ id: challengeId });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <div>
        <Link href={`/modules/${challenge.moduleId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Module
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="outline" className={
            challenge.difficulty === 'beginner' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
            challenge.difficulty === 'intermediate' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' :
            'text-red-500 border-red-500/30 bg-red-500/10'
          }>
            {challenge.difficulty}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20">
            <Zap className="h-3.5 w-3.5" />
            {challenge.xpReward} XP
          </Badge>
          {challenge.isCompleted && (
            <Badge variant="outline" className="flex items-center gap-1 text-green-500 border-green-500/30 bg-green-500/10">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{challenge.title}</h1>
        {challenge.description && (
          <p className="text-lg text-muted-foreground leading-relaxed">
            {challenge.description}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="prose prose-invert prose-pre:bg-muted/50 prose-pre:border max-w-none">
            {/* Displaying simple content for now since we don't have a real markdown parser handy, 
                just formatting it nicely */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-primary font-medium border-b pb-4">
                <Terminal className="h-5 w-5" />
                <span>Challenge Brief</span>
              </div>
              <div className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">
                {challenge.content}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-card border rounded-xl p-4">
            <div>
              <h3 className="font-medium">Ready to submit?</h3>
              <p className="text-sm text-muted-foreground">Ensure you've completed all requirements before verifying.</p>
            </div>
            <Button 
              size="lg"
              disabled={challenge.isCompleted || completeMutation.isPending}
              onClick={handleComplete}
              className={challenge.isCompleted ? "bg-green-600 text-white hover:bg-green-700" : ""}
            >
              {challenge.isCompleted ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Completed
                </>
              ) : completeMutation.isPending ? (
                "Verifying..."
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" /> Verify Solution
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-5 sticky top-6">
            <h3 className="font-medium flex items-center gap-2 mb-4 border-b pb-4">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Hints & Tips
            </h3>
            
            {challenge.hints && challenge.hints.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {challenge.hints.map((hint, idx) => (
                  <AccordionItem key={idx} value={`hint-${idx}`}>
                    <AccordionTrigger className="text-sm">Hint {idx + 1}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {hint}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground">No hints available for this challenge. You got this!</p>
            )}

            {challenge.tags && challenge.tags.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-xs font-medium uppercase text-muted-foreground mb-3">Concepts</h4>
                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
