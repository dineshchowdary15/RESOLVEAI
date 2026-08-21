import { useEffect, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  TicketCheck,
} from "lucide-react";

import { getTickets } from "../api/ticketApi";

import type { Ticket } from "../types/ticket";

import MetricCard from "../components/MetricCard";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";

import { Link } from "react-router-dom";

function Dashboard() {

  const [tickets, setTickets] =
    useState<Ticket[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const loadTickets = async () => {

      try {

        const data =
          await getTickets();

        setTickets(data);

      } catch (error) {

        console.error(
          "Failed to load tickets",
          error
        );

      } finally {

        setLoading(false);

      }
    };

    loadTickets();

  }, []);

  const totalTickets =
    tickets.length;

  const openTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "OPEN"
    ).length;

  const criticalTickets =
    tickets.filter(
      (ticket) =>
        ticket.priority === "CRITICAL"
    ).length;

  const resolvedTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "RESOLVED"
    ).length;

  const recentTickets =
    tickets.slice(0, 5);

  return (
    <div className="page">

      <header className="page-header">

        <div>
          <p className="eyebrow">
            Operations Overview
          </p>

          <h1>
            Dashboard
          </h1>

          <p>
            Monitor incidents and system
            activity across ResolveAI.
          </p>
        </div>

        <Link
          to="/tickets/new"
          className="primary-button"
        >
          Create Incident
        </Link>

      </header>

      <section className="metrics-grid">

        <MetricCard
          title="Total Incidents"
          value={totalTickets}
          icon={TicketCheck}
        />

        <MetricCard
          title="Open Incidents"
          value={openTickets}
          icon={Clock3}
        />

        <MetricCard
          title="Critical"
          value={criticalTickets}
          icon={AlertTriangle}
        />

        <MetricCard
          title="Resolved"
          value={resolvedTickets}
          icon={CheckCircle2}
        />

      </section>

      <section className="content-card">

        <div className="card-header">

          <div>
            <h2>
              Recent Incidents
            </h2>

            <p>
              Latest incidents reported
              to ResolveAI
            </p>
          </div>

          <Link
            to="/tickets"
            className="text-link"
          >
            View all
          </Link>

        </div>

        {loading ? (

          <p>Loading incidents...</p>

        ) : recentTickets.length === 0 ? (

          <div className="empty-state">
            No incidents have been created.
          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Incident</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>

              </thead>

              <tbody>

                {recentTickets.map(
                  (ticket) => (

                    <tr key={ticket.id}>

                      <td>
                        #{ticket.id}
                      </td>

                      <td>

                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="ticket-link"
                        >
                          {ticket.title}
                        </Link>

                      </td>

                      <td>
                        <PriorityBadge
                          priority={
                            ticket.priority
                          }
                        />
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            ticket.status
                          }
                        />
                      </td>

                      <td>
                        {new Date(
                          ticket.createdAt
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

export default Dashboard;