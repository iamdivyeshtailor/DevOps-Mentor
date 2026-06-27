import { useState } from "react";
import { Link } from "wouter";
import { useListChallenges, getListChallengesQueryKey, useListModules, getListModulesQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Swords, CheckCircle2, Zap } from "lucide-react";

export default function ChallengesList() {
  const [moduleId, setModuleId] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: challenges, isLoading: isLoadingChallenges } = useListChallenges(
    { 
      moduleId: moduleId !== undefined ? moduleId : undefined,
      difficulty: difficulty !== "all" ? difficulty as any : undefined
    },
    { query: { queryKey: getListChallengesQueryKey({ moduleId: moduleId !== undefined ? moduleId : undefined, difficulty: difficulty !== "all" ? difficulty as any : undefined }) } }
  );

  const { data: modules, isLoading: isLoadingModules } = useListModules({
    query: { queryKey: getListModulesQueryKey() }
  });

  const filteredChallenges = challenges?.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
        <p className="text-muted-foreground mt-1">Test your skills with hands-on DevOps exercises.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search challenges..." 
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select 
          value={moduleId?.toString() || "all"} 
          onValueChange={(v) => setModuleId(v === "all" ? undefined : parseInt(v))}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="All Modules" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules?.map(m => (
              <SelectItem key={m.id} value={m.id.toString()}>{m.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={difficulty} 
          onValueChange={setDifficulty}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoadingChallenges || isLoadingModules ? (
        <div className="grid gap-4">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filteredChallenges.length > 0 ? (
        <div className="grid gap-4">
          {filteredChallenges.map((challenge, i) => {
            const moduleInfo = modules?.find(m => m.id === challenge.moduleId);
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/challenges/${challenge.id}`}>
                  <div className="group p-5 border rounded-xl bg-card hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {challenge.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <Swords className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{challenge.title}</h3>
                        <Badge variant="outline" className={
                          challenge.difficulty === 'beginner' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
                          challenge.difficulty === 'intermediate' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' :
                          'text-red-500 border-red-500/30 bg-red-500/10'
                        }>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-1 mb-3 md:mb-0">
                        {challenge.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 text-xs">
                      {moduleInfo && (
                        <span className="text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                          {moduleInfo.title}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-medium text-yellow-500">
                        <Zap className="h-3.5 w-3.5" /> 
                        {challenge.xpReward} XP
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-xl border-dashed bg-card/50">
          <Swords className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-1">No challenges found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </motion.div>
  );
}
