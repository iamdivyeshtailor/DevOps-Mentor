import { useParams, Link } from "wouter";
import { useGetModule, getGetModuleQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Terminal, CheckCircle2, Circle, Clock, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ModuleDetail() {
  const { id } = useParams<{ id: string }>();
  const moduleId = parseInt(id || "0", 10);

  const { data: module, isLoading } = useGetModule(moduleId, {
    query: { enabled: !!moduleId, queryKey: getGetModuleQueryKey(moduleId) }
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Module not found</h2>
        <p className="text-muted-foreground mb-6">This learning track might have been moved or doesn't exist.</p>
        <Link href="/modules">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Modules</Button>
        </Link>
      </div>
    );
  }

  const progress = module.totalChallenges > 0 
    ? (module.completedChallenges / module.totalChallenges) * 100 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div>
        <Link href="/modules" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Modules
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Terminal className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="capitalize">
                {module.category.replace('_', ' ')}
              </Badge>
              {module.isUnlocked ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Unlocked</Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">Locked</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{module.title}</h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {module.description}
            </p>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your Progress</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{module.completedChallenges} of {module.totalChallenges} challenges completed</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Challenges</h2>
        
        {!module.isUnlocked && (
          <div className="mb-6 p-4 border border-orange-500/20 bg-orange-500/10 rounded-lg text-orange-200 text-sm">
            This module is currently locked. Complete the previous modules to access these challenges.
          </div>
        )}

        <div className="space-y-4">
          {module.challenges.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
              <p className="text-muted-foreground">No challenges available for this module yet.</p>
            </div>
          ) : (
            module.challenges.map((challenge, idx) => (
              <Link 
                key={challenge.id} 
                href={module.isUnlocked ? `/challenges/${challenge.id}` : "#"}
              >
                <div className={`group relative p-5 border rounded-xl transition-all flex items-start gap-4 ${
                  module.isUnlocked 
                    ? "hover:border-primary/50 hover:bg-muted/50 cursor-pointer bg-card" 
                    : "opacity-75 cursor-not-allowed bg-muted/30"
                }`}>
                  <div className="mt-1">
                    {challenge.isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg">{challenge.title}</h3>
                      <Badge variant="outline" className={
                        challenge.difficulty === 'beginner' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
                        challenge.difficulty === 'intermediate' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' :
                        'text-red-500 border-red-500/30 bg-red-500/10'
                      }>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-yellow-500" /> 
                        {challenge.xpReward} XP
                      </span>
                      {challenge.tags && challenge.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          {challenge.tags.map(tag => (
                            <span key={tag} className="bg-muted px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
