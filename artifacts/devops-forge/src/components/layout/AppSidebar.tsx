import { Link, useLocation } from "wouter";
import { 
  TerminalSquare, 
  LayoutDashboard,
  Box,
  Swords,
  BookOpen,
  Server,
  Container,
  Workflow,
  Cloud,
  Layers,
  Database,
  Wifi,
  WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useListModules, getListModulesQueryKey, useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebar() {
  const [location] = useLocation();

  const { data: modules, isLoading } = useListModules({
    query: { queryKey: getListModulesQueryKey() }
  });

  const { data: health, isError } = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 60000, retry: false }
  });

  const getModuleIcon = (slug: string) => {
    switch (slug) {
      case 'docker':
        return <Container />;
      case 'docker-compose':
        return <Layers />;
      case 'github-actions':
      case 'gitlab-ci':
        return <Workflow />;
      case 'aws':
        return <Cloud />;
      case 'terraform':
        return <Server />;
      case 'kubernetes':
        return <Database />;
      default:
        return <Box />;
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="py-6 px-4">
        <div className="flex items-center gap-2 font-mono text-xl font-bold tracking-tight text-primary">
          <TerminalSquare className="h-6 w-6" />
          <span>DevOps_Forge</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/"}>
                  <Link href="/">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/modules"}>
                  <Link href="/modules">
                    <Box />
                    <span>All Modules</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/challenges")}>
                  <Link href="/challenges">
                    <Swords />
                    <span>Challenges</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/docs")}>
                  <Link href="/docs">
                    <BookOpen />
                    <span>Documentation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Learning Tracks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                Array(7).fill(0).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <div className="flex items-center gap-2 px-2 py-1.5 w-full">
                      <Skeleton className="h-4 w-4 rounded-sm" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </SidebarMenuItem>
                ))
              ) : (
                modules?.map(module => (
                  <SidebarMenuItem key={module.id}>
                    <SidebarMenuButton asChild isActive={location === `/modules/${module.id}`}>
                      <Link href={`/modules/${module.id}`}>
                        {getModuleIcon(module.slug)}
                        <span className="truncate">{module.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {health?.status === 'ok' && !isError ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-green-500" />
              <span>System Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-destructive" />
              <span>System Offline</span>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
