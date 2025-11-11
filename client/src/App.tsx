import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
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

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/financial"} component={Financial} />
      <Route path={"/inventory"} component={Inventory} />
      <Route path={"/planning"} component={Planning} />
      <Route path={"/animals"} component={Animals} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/esg"} component={ESG} />
      <Route path={"/challenges"} component={Challenges} />
      <Route path={"/ranking"} component={Ranking} />
      <Route path={"/milk-production"} component={MilkProduction} />
      <Route path={"/reproduction"} component={Reproduction} />
      <Route path={"/health"} component={Health} />
      <Route path={"/pastures"} component={Pastures} />
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
