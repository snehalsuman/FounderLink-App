import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, useRouteError } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import Button from '../shared/components/Button';

// ─── Shared UI ────────────────────────────────────────────────────────────────

const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

const ErrorPage: React.FC = () => {
  const error = useRouteError() as Error | undefined;
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 text-sm mb-6">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <Button
          variant="primary"
          leftIcon={<RefreshCw size={14} />}
          onClick={() => window.location.reload()}
          className="mx-auto"
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
};

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <p className="text-xl text-gray-500">404 - Page Not Found</p>
  </div>
);

const Unauthorized: React.FC = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <p className="text-xl text-gray-500">403 - Access Denied</p>
  </div>
);

// ─── Lazy Page Imports ────────────────────────────────────────────────────────

const LandingPage       = lazy(() => import('../features/common/LandingPage'));
const Login             = lazy(() => import('../features/auth/Login'));
const Register          = lazy(() => import('../features/auth/Register'));

const FounderDashboard  = lazy(() => import('../features/founder/FounderDashboard'));
const MyStartups        = lazy(() => import('../features/founder/MyStartups'));
const CreateStartup     = lazy(() => import('../features/founder/CreateStartup'));
const EditStartup       = lazy(() => import('../features/founder/EditStartup'));
const TeamManagement    = lazy(() => import('../features/founder/TeamManagement'));
const FounderInvestments = lazy(() => import('../features/founder/FounderInvestments'));
const ReceivedPayments  = lazy(() => import('../features/founder/ReceivedPayments'));
const FounderStartupDetail = lazy(() => import('../features/founder/FounderStartupDetail'));

const CoFounderDashboard = lazy(() => import('../features/cofounder/CoFounderDashboard'));
const MyInvitations     = lazy(() => import('../features/founder/MyInvitations'));

const InvestorDashboard = lazy(() => import('../features/investor/InvestorDashboard'));
const BrowseStartups    = lazy(() => import('../features/investor/BrowseStartups'));
const StartupDetail     = lazy(() => import('../features/investor/StartupDetail'));
const MyInvestments     = lazy(() => import('../features/investor/MyInvestments'));
const PaymentHistory    = lazy(() => import('../features/investor/PaymentHistory'));

const AdminDashboard    = lazy(() => import('../features/admin/AdminDashboard'));

const Notifications     = lazy(() => import('../features/common/Notifications'));
const Messages          = lazy(() => import('../features/common/Messages'));
const Chat              = lazy(() => import('../features/common/Chat'));
const Profile           = lazy(() => import('../features/common/Profile'));

// ─── Helper: wrap lazy component in Suspense ─────────────────────────────────

const s = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// ─── Router ───────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  // Public
  { path: '/',            element: s(LandingPage) },
  { path: '/login',       element: s(Login) },
  { path: '/register',    element: s(Register) },
  { path: '/unauthorized', element: <Unauthorized /> },
  { path: '*',            element: <NotFound /> },

  // Founder — ROLE_FOUNDER only
  {
    element: <ProtectedRoute allowedRoles={['ROLE_FOUNDER']} />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/founder/dashboard',           element: s(FounderDashboard) },
      { path: '/founder/startups',            element: s(MyStartups) },
      { path: '/founder/startups/create',     element: s(CreateStartup) },
      { path: '/founder/startups/:id',        element: s(FounderStartupDetail) },
      { path: '/founder/startups/:id/edit',   element: s(EditStartup) },
      { path: '/founder/team/:startupId',     element: s(TeamManagement) },
      { path: '/founder/investments',         element: s(FounderInvestments) },
      { path: '/founder/payments',            element: s(ReceivedPayments) },
    ],
  },

  // Co-Founder — ROLE_COFOUNDER only
  {
    element: <ProtectedRoute allowedRoles={['ROLE_COFOUNDER']} />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/cofounder/dashboard',         element: s(CoFounderDashboard) },
      { path: '/cofounder/startups',          element: s(BrowseStartups) },
      { path: '/cofounder/startups/:id',      element: s(StartupDetail) },
      { path: '/founder/invitations',         element: s(MyInvitations) },
    ],
  },

  // Investor — ROLE_INVESTOR only
  {
    element: <ProtectedRoute allowedRoles={['ROLE_INVESTOR']} />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/investor/dashboard',          element: s(InvestorDashboard) },
      { path: '/investor/startups',           element: s(BrowseStartups) },
      { path: '/investor/startups/:id',       element: s(StartupDetail) },
      { path: '/investor/investments',        element: s(MyInvestments) },
      { path: '/investor/payments',           element: s(PaymentHistory) },
    ],
  },

  // Admin — ROLE_ADMIN only
  {
    element: <ProtectedRoute allowedRoles={['ROLE_ADMIN']} />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/admin/dashboard',             element: s(AdminDashboard) },
    ],
  },

  // Common — any authenticated user
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/notifications',               element: s(Notifications) },
      { path: '/messages',                    element: s(Messages) },
      { path: '/messages/:conversationId',    element: s(Chat) },
      { path: '/profile',                     element: s(Profile) },
    ],
  },
]);

export default router;
