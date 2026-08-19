import React from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { appStyles as s } from './assets/dummyStyles';
import { Bookmark, CheckCircle2, Loader2, PenLine } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import CreatePollPage from './pages/CreatePollPage';
import PollListPage from './pages/PollListPage';
import { Button } from './components/UIElements';
import SettingsPage from './pages/SettingsPage';
import SinglePollPage from './pages/SinglePollPage';
import UserProfilePage from './pages/UserProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';

// protect route
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className={s.loadingContainer}>
        <Loader2 className={s.loadingSpinner} size={32} />
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-poll" element={<CreatePollPage />} />
          <Route path="/settings" element={<SettingsPage/>} />
          <Route path="/poll/:id" element={<SinglePollPage />} />
          <Route path="/user/:username" element={<UserProfilePage />} />
          <Route path="/poll/:id/analytics" element={<AnalyticsPage  />} />
          <Route path="/my-polls" element={<PollListPage title = "My Polls" path = "/polls/mine"
          owner Icon = {PenLine} emptyTitle = "No polls yet" emptyText = "You have't created any polls yet" />} />
          <Route path="/voted-polls" element={<PollListPage title = "Voted Polls" path = "/polls/voted"
          Icon = {CheckCircle2} emptyTitle = "No votes yet" emptyText = "You have't voted on any polls yet" />} />
          <Route path="/bookmarked-polls" element={<PollListPage title="Saved" path="/polls/bookmarks" 
           Icon={Bookmark} emptyTitle="No saved polls yet" emptyText="Save polls you want to revisit later."
           action={<Link to="/dashboard"><Button className=" mt-4">Explore Polls</Button></Link>} />} />
        </Route>

            <Route path="*" element={<Navigate to='/dashboard' replace />} />

      </Routes>
    </div>
  );
};
 
export default App;