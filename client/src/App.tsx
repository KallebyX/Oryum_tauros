import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Financial from "./pages/Financial";
import Inventory from "./pages/Inventory";
import Planning from "./pages/Planning";
import Animals from "./pages/Animals";
import Pricing from "./pages/Pricing";
import ESG from "./pages/ESG";
import Challenges from "./pages/Challenges";
import Ranking from "./pages/Ranking";
import MilkProduction from "./pages/MilkProduction";
import Reproduction from "./pages/Reproduction";
import Health from "./pages/Health";
import Pastures from "./pages/Pastures";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Budget from "./pages/Budget";
import Admin from "./pages/Admin";
import Projections from "./pages/Projections";
import BreakEven from "./pages/BreakEven";
import Subscription from "./pages/Subscription";

function Router() {
  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path={"/"} component={Home} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/onboarding"} component={Onboarding} />

      {/* Rotas protegidas que requerem assinatura ativa */}
      <Route path={"/dashboard"}>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      <Route path={"/financial"}>
        <DashboardLayout>
          <Financial />
        </DashboardLayout>
      </Route>
      <Route path={"/inventory"}>
        <DashboardLayout>
          <Inventory />
        </DashboardLayout>
      </Route>
      <Route path={"/planning"}>
        <DashboardLayout>
          <Planning />
        </DashboardLayout>
      </Route>
      <Route path={"/animals"}>
        <DashboardLayout>
          <Animals />
        </DashboardLayout>
      </Route>
      <Route path={"/esg"}>
        <DashboardLayout>
          <ESG />
        </DashboardLayout>
      </Route>
      <Route path={"/challenges"}>
        <DashboardLayout>
          <Challenges />
        </DashboardLayout>
      </Route>
      <Route path={"/ranking"}>
        <DashboardLayout>
          <Ranking />
        </DashboardLayout>
      </Route>
      <Route path={"/milk-production"}>
        <DashboardLayout>
          <MilkProduction />
        </DashboardLayout>
      </Route>
      <Route path={"/reproduction"}>
        <DashboardLayout>
          <Reproduction />
        </DashboardLayout>
      </Route>
      <Route path={"/health"}>
        <DashboardLayout>
          <Health />
        </DashboardLayout>
      </Route>
      <Route path={"/pastures"}>
        <DashboardLayout>
          <Pastures />
        </DashboardLayout>
      </Route>
      <Route path={"/reports"}>
        <DashboardLayout>
          <Reports />
        </DashboardLayout>
      </Route>
      <Route path={"/notifications"}>
        <DashboardLayout>
          <Notifications />
        </DashboardLayout>
      </Route>
      <Route path={"/goals"}>
        <DashboardLayout>
          <Goals />
        </DashboardLayout>
      </Route>
      <Route path={"/analytics"}>
        <DashboardLayout>
          <Analytics />
        </DashboardLayout>
      </Route>
      <Route path={"/alerts"}>
        <DashboardLayout>
          <Alerts />
        </DashboardLayout>
      </Route>
      <Route path={"/budget"}>
        <DashboardLayout>
          <Budget />
        </DashboardLayout>
      </Route>
      <Route path={"/projections"}>
        <DashboardLayout>
          <Projections />
        </DashboardLayout>
      </Route>
      <Route path={"/breakeven"}>
        <DashboardLayout>
          <BreakEven />
        </DashboardLayout>
      </Route>
      <Route path={"/subscription"}>
        <DashboardLayout requireSubscription={false}>
          <Subscription />
        </DashboardLayout>
      </Route>

      {/* Rota administrativa (requer role admin) */}
      <Route path={"/admin"}>
        <DashboardLayout requireAdmin={true}>
          <Admin />
        </DashboardLayout>
      </Route>

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
