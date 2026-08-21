import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard";
import TicketsPage from "./pages/TicketsPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route element={<AppLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/tickets"
            element={<TicketsPage />}
          />

          <Route
            path="/tickets/new"
            element={<CreateTicketPage />}
          />

          <Route
            path="/tickets/:id"
            element={<TicketDetailsPage />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;