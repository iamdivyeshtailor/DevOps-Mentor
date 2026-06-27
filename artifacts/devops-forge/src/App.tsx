import { AppLayout } from "./components/layout/AppLayout";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ModulesList from "@/pages/ModulesList";
import ModuleDetail from "@/pages/ModuleDetail";
import ChallengesList from "@/pages/ChallengesList";
import ChallengeDetail from "@/pages/ChallengeDetail";
import DocsList from "@/pages/DocsList";
import DocDetail from "@/pages/DocDetail";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/modules" component={ModulesList} />
        <Route path="/modules/:id" component={ModuleDetail} />
        <Route path="/challenges" component={ChallengesList} />
        <Route path="/challenges/:id" component={ChallengeDetail} />
        <Route path="/docs" component={DocsList} />
        <Route path="/docs/:id" component={DocDetail} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;