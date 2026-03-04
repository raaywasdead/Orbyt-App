import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AppWrapper from './App';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import IntroOnboarding from './pages/IntroOnboarding';
import TermoUsoPage from './pages/TermoUsoPage';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import ProfilePage from './pages/ProfilePage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminPage from './pages/AdminPage'
import FAQ from './pages/FAQ'
import ErrorBoundary from './components/ErrorBoundary'
import './i18n'
import { preloadServerData, setupSync } from './services/sync'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage  from './pages/ResetPasswordPage';

function RotaProtegida({ children }: { children: React.ReactNode }) {
  if (!localStorage.getItem('orbyt_onboarded')) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route path="/" element={
        localStorage.getItem('orbyt_onboarded')
          ? <Navigate to="/app" replace />
          : <LandingPage onStart={() => navigate('/login')} onSignup={() => navigate('/signup')} />
      } />
      <Route path="/login" element={<LoginPage onEnter={() => navigate('/intro')} onBack={() => navigate('/')} />} />
      <Route path="/signup" element={<LoginPage onEnter={() => navigate('/intro')} onBack={() => navigate('/')} defaultTab="signup" />} />
      <Route path="/intro" element={<IntroOnboarding onComplete={() => navigate('/app')} />} />
      <Route path="/app" element={<RotaProtegida><AppWrapper /></RotaProtegida>} />
      <Route path="/termos" element={<TermoUsoPage />} />
      <Route path="/privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/contato" element={<ContactPage />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/perfil" element={<RotaProtegida><ProfilePage /></RotaProtegida>} />
      <Route path="/admin" element={<RotaProtegida><AdminPage /></RotaProtegida>} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function Root() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

;(async () => {
  await Promise.race([
    preloadServerData(),
    new Promise<void>(resolve => setTimeout(resolve, 400)),
  ])
  setupSync()

  const rootElement = document.getElementById('root')
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <Root />
        </ErrorBoundary>
      </StrictMode>
    )
  }
})()