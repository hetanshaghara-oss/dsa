import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ChallengeList } from './pages/ChallengeList';
import { DailyChallenge } from './pages/DailyChallenge';
import { ProblemsLibrary } from './pages/ProblemsLibrary';
import { Analytics } from './pages/Analytics';
import { RevisionList } from './pages/RevisionList';
import { Resources } from './pages/Resources';
import { SettingsPage } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="challenge" element={<ChallengeList />} />
            <Route path="challenge/:day" element={<DailyChallenge />} />
            <Route path="problems" element={<ProblemsLibrary />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="revision" element={<RevisionList />} />
            <Route path="resources" element={<Resources />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
