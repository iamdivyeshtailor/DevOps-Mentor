import { useState } from "react";
import { Link } from "wouter";
import { useListDocTopics, getListDocTopicsQueryKey, useListModules, getListModulesQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Clock, ChevronRight } from "lucide-react";

export default function DocsList() {
  const [moduleId, setModuleId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data: topics, isLoading: isLoadingTopics } = useListDocTopics(
    { moduleId: moduleId !== undefined ? moduleId : undefined },
    { query: { queryKey: getListDocTopicsQueryKey({ moduleId: moduleId !== undefined ? moduleId : undefined }) } }
  );

  const { data: modules, isLoading: isLoadingModules } = useListModules({
    query: { queryKey: getListModulesQueryKey() }
  });

  const filteredTopics = topics?.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.summary.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground mt-1">Reference guides, cheatsheets, and deep dives.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documentation..." 
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
            <SelectValue placeholder="Filter by Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {modules?.map(m => (
              <SelectItem key={m.id} value={m.id.toString()}>{m.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoadingTopics || isLoadingModules ? (
        <div className="space-y-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filteredTopics.length > 0 ? (
        <div className="space-y-3">
          {filteredTopics.map((topic, i) => {
            const moduleInfo = modules?.find(m => m.id === topic.moduleId);
            
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/docs/${topic.id}`}>
                  <div className="group flex items-center p-4 bg-card border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary mr-4 shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {moduleInfo && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                            {moduleInfo.title}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-lg truncate group-hover:text-primary transition-colors">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{topic.summary}</p>
                    </div>

                    <div className="flex items-center gap-4 ml-4 shrink-0">
                      <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {topic.readingMinutes} min read
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-xl border-dashed bg-card/50">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-1">No topics found</h3>
          <p className="text-muted-foreground">We couldn't find any documentation matching your search.</p>
        </div>
      )}
    </motion.div>
  );
}
