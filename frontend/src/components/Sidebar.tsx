import {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  BrainCircuit,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-icon">
          <BrainCircuit size={26} />
        </div>

        <div>
          <h2>ResolveAI</h2>
          <span>Incident Intelligence</span>
        </div>

      </div>

      <nav className="sidebar-nav">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/tickets"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <ListTodo size={20} />
          Incidents
        </NavLink>

        <NavLink
          to="/tickets/new"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <PlusCircle size={20} />
          Create Incident
        </NavLink>

      </nav>

      <div className="sidebar-footer">
        <p>ResolveAI</p>
        <span>AI Engineering Platform</span>
      </div>

    </aside>
  );
}

export default Sidebar;