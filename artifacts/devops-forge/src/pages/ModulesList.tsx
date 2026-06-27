import { useListModules, getListModulesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Terminal, Lock, Clock, BookOpen, Layers, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function ModulesList() {
  const { data: modules, isLoading } = useListModules({
    query: { queryKey: getListModulesQueryKey() }
  });

  const [searchQuery, setSearchQuery] = useState("");

  const filteredModules = modules?.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Tracks</h1>
          <p className="text-muted-foreground mt-1">Master DevOps concepts from foundations to advanced orchestration.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search modules..." 
            className="pl-9 bg-card"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : filteredModules.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((module, i) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/modules/${module.id}`}>
                <div className="group relative rounded-xl border bg-card p-6 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-primary/10 transition-all cursor-pointer overflow-hidden h-full flex flex-col">
                  {!module.isUnlocked && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 border border-transparent group-hover:border-primary/20">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-muted-foreground">Locked Module</h3>
                      <p className="text-sm text-muted-foreground">Complete previous modules in the learning path to unlock this content.</p>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Terminal className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                      {module.category.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{module.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {module.description}
                  </p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground font-medium">
                        <span>Progress</span>
                        <span>{Math.round((module.completedChallenges / Math.max(module.totalChallenges, 1)) * 100)}%</span>
                      </div>
                      <Progress value={(module.completedChallenges / Math.max(module.totalChallenges, 1)) * 100} className="h-1.5" />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" /> 
                        {module.completedChallenges}/{module.totalChallenges} Tasks
                      </span>
                      {module.estimatedHours && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> 
                          {module.estimatedHours}h est.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-xl border-dashed bg-card/50">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-1">No modules found</h3>
          <p className="text-muted-foreground">Adjust your search to find what you're looking for.</p>
        </div>
      )}
    </motion.div>
  );
}
