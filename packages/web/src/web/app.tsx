import * as React from "react";
import { Route, Switch, useLocation } from "wouter";
import { AgentFeedback } from "@runablehq/website-runtime";
import { ThemeProvider } from "./hooks/use-theme";
import { ToastProvider } from "./components/ui/toast";
import { AppShell, PageTransition } from "./components/app-shell";
import { canAccessPath, getStoredUser, homeForRole } from "./lib/session";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Awardees from "./pages/awardees";
import StudentDetails from "./pages/student-details";
import RegistrationDesk from "./pages/registration-desk";
import CertificateDesk from "./pages/certificate-desk";
import Reports from "./pages/reports";
import Users from "./pages/users";
import Settings from "./pages/settings";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";

function Shell() {
  const [location, navigate] = useLocation();
  const user = getStoredUser();

  React.useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!canAccessPath(user.role, location)) {
      navigate(homeForRole(user.role), { replace: true });
    }
  }, [location, navigate, user]);

  if (!user || !canAccessPath(user.role, location)) return null;

  return (
    <AppShell>
      <PageTransition key={location}>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/awardees" component={Awardees} />
          <Route path="/awardees/:id" component={StudentDetails} />
          <Route path="/registration" component={RegistrationDesk} />
          <Route path="/certificate" component={CertificateDesk} />
          <Route path="/reports" component={Reports} />
          <Route path="/users" component={Users} />
          <Route path="/settings" component={Settings} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </PageTransition>
    </AppShell>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Switch>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
          <Route component={Shell} />
        </Switch>

        {/* Do not remove — off by default, activated by parent iframe via postMessage */}
        {import.meta.env.DEV && <AgentFeedback />}
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
