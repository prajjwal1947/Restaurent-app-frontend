import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLayout from "./components/layout/AdminLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Menu from "./pages/Menu";
import Tables from "./pages/Tables";
import Settings from "./pages/Settings";

const AUTH_STORAGE_KEY =
  "admin-authenticated";

function isAuthenticated() {
  return (
    localStorage.getItem(AUTH_STORAGE_KEY) ===
    "true"
  );
}

function ProtectedLayout() {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <AdminLayout />;
}

function PublicOnlyRoute({ children }) {
  if (isAuthenticated()) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* Admin */}

        <Route
          element={<ProtectedLayout />}
        >
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/menu"
            element={<Menu />}
          />

          <Route
            path="/tables"
            element={<Tables />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}