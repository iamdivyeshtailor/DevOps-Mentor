import { useParams, Link } from "wouter";
import { useGetDocTopic, getGetDocTopicQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";

export default function DocDetail() {
  const { id } = useParams<{ id: string }>();
  const topicId = parseInt(id || "0", 10);

  const { data: topic, isLoading } = useGetDocTopic(topicId, {
    query: { enabled: !!topicId, queryKey: getGetDocTopicQueryKey(topicId) }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-6 w-32" />
        <div className="space-y-4 pt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Topic not found</h2>
        <Link href="/docs">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Docs</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8 pb-20"
    >
      <div>
        <Link href="/docs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Documentation
        </Link>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{topic.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            Module Reference
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {topic.readingMinutes} min read
          </span>
        </div>
      </div>

      <div className="prose prose-invert prose-pre:bg-muted/50 prose-pre:border max-w-none text-foreground/90">
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          {topic.summary}
        </p>
        
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <MarkdownRenderer content={topic.content} />
        </div>
      </div>

      {topic.tags && topic.tags.length > 0 && (
        <div className="pt-8 border-t">
          <h4 className="text-sm font-medium mb-3">Related Tags</h4>
          <div className="flex flex-wrap gap-2">
            {topic.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-12 pt-8 border-t">
        <Link href="/docs">
          <Button variant="ghost">Return to Index</Button>
        </Link>
        <Link href={`/modules/${topic.moduleId}`}>
          <Button>Go to Module <ArrowLeft className="ml-2 h-4 w-4 rotate-180" /></Button>
        </Link>
      </div>
    </motion.div>
  );
}
