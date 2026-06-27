import { useGetProgressSummary, getGetProgressSummaryQueryKey, useGetActivityFeed, getGetActivityFeedQueryKey, useListModules, getListModulesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Terminal, Trophy, Zap, Clock, BookOpen, Flame, Lock } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: progress, isLoading: isLoadingProgress } = useGetProgressSummary({
    query: { queryKey: getGetProgressSummaryQueryKey() }
  });

  const { data: activities, isLoading: isLoadingActivity } = useGetActivityFeed({
    query: { queryKey: getGetActivityFeedQueryKey() }
  });

  const { data: modules, isLoading: isLoadingModules } = useListModules({
    query: { queryKey: getListModulesQueryKey() }
  });

  const progressPercentage = progress?.currentLevelXp !== undefined && progress?.nextLevelXp !== undefined
    ? (progress.currentLevelXp / progress.nextLevelXp) * 100
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Ready to learn some DevOps?</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingProgress ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : progress ? (
          <>
            <Card className="bg-card/50 border-primary/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                <Trophy className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{progress.levelName || `Level ${progress.level}`}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Level {progress.level} • {progress.totalXp} Total XP
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.currentLevelXp} XP</span>
                    <span>{progress.nextLevelXp} XP</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Challenges Done</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{progress.completedChallenges}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  out of {progress.totalChallenges} total challenges
                </p>
                <Progress 
                  value={(progress.completedChallenges / Math.max(progress.totalChallenges, 1)) * 100} 
                  className="h-1 mt-4" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Modules</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{progress.modulesCompleted} <span className="text-lg text-muted-foreground font-normal">/ {progress.modulesStarted || 0}</span></div>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed / Started
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{progress.streakDays} Days</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep it up!
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Learning Tracks</CardTitle>
            <CardDescription>Your available modules</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingModules ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            ) : modules && modules.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {modules.slice(0, 4).map(module => (
                  <Link key={module.id} href={`/modules/${module.id}`}>
                    <div className="group relative rounded-xl border p-5 hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer overflow-hidden h-full flex flex-col">
                      {!module.isUnlocked && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                          <Lock className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium text-muted-foreground">Complete previous modules to unlock</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                          <Terminal className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm leading-none">{module.title}</h3>
                          <span className="text-xs text-muted-foreground capitalize mt-1 block">{module.category.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {module.description}
                      </p>
                      <div className="flex items-center justify-between text-xs mt-auto">
                        <span className="text-muted-foreground">
                          {module.completedChallenges}/{module.totalChallenges} Challenges
                        </span>
                        {module.estimatedHours && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" /> {module.estimatedHours}h
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border rounded-xl border-dashed">
                <p className="text-muted-foreground">No modules available.</p>
              </div>
            )}
            {modules && modules.length > 4 && (
              <div className="mt-4 text-center">
                <Link href="/modules" className="text-sm text-primary hover:underline">
                  View all learning tracks
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest achievements</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-6">
                {activities.map(activity => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="mt-0.5 relative">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                      <div className="absolute top-4 bottom-[-24px] left-[3px] w-[2px] bg-border last:hidden" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        {activity.moduleName && <span>{activity.moduleName}</span>}
                        {activity.moduleName && <span>•</span>}
                        <span>{format(new Date(activity.occurredAt), 'MMM d, h:mm a')}</span>
                        {activity.xpEarned > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-medium">+{activity.xpEarned} XP</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <Terminal className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-sm text-muted-foreground">No recent activity.</p>
                <p className="text-xs text-muted-foreground mt-1">Start a challenge to see your progress here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
