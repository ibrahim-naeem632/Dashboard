import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/login";

/* 🔥 FIX: SINGLE AUTH SOURCE */
const isAuth = () => {
  return !!localStorage.getItem("user"); // 👈 sirf user check hoga
};

/* 🔐 Protected Route */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuth() ? <>{children}</> : <Navigate to="/login" replace />;
};

/* 🔓 Public Route */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuth() ? <Navigate to="/" replace /> : <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;