import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Accounts } from './pages/Accounts';
import { Cards } from './pages/Cards';
import { Categories } from './pages/Categories';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { Transactions } from './pages/Transactions';

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas protegidas com Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />

              {/* Redirecionamento para rotas não encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
