import * as React from "react";
import { Route, Switch, useLocation } from "wouter";
import { AgentFeedback } from "@runablehq/website-runtime";
import { ThemeProvider } from "./hooks/use-theme";
import { ToastProvider } from "./components/ui/toast";
import { AppShell, PageTransition } from "./components/app-shell";
import { canAccessPath, getStoredUser, homeForRole } from "./lib/session";

import Login from "./pages/login";

const Dashboard = React.lazy(() => import("./pages/dashboard"));
const Awardees = React.lazy(() => import("./pages/awardees"));
const StudentDetails = React.lazy(() => import("./pages/student-details"));
const RegistrationDesk = React.lazy(() => import("./pages/registration-desk"));
const CertificateDesk = React.lazy(() => import("./pages/certificate-desk"));
const Reports = React.lazy(() => import("./pages/reports"));
const Users = React.lazy(() => import("./pages/users"));
const Settings = React.lazy(() => import("./pages/settings"));
const Profile = React.lazy(() => import("./pages/profile"));
const NotFound = React.lazy(() => import("./pages/not-found"));

function PageLoading() {
  return (
    <div className="flex min-h-[360px] items-center justify-center text-sm text-muted-foreground">
      Loading...
    </div>
  );
}

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
        <React.Suspense fallback={<PageLoading />}>
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
        </React.Suspense>
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
