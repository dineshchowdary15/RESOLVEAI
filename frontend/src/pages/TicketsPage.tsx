import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Plus } from "lucide-react";

import { getTickets } from "../api/ticketApi";

import type { Ticket } from "../types/ticket";

import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";

function TicketsPage() {

  const [tickets, setTickets] =
    useState<Ticket[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const loadTickets =
      async () => {

        try {

          const data =
            await getTickets();

          setTickets(data);

        } catch (error) {

          console.error(error);

        } finally {

          setLoading(false);

        }

      };

    loadTickets();

  }, []);

  return (
    <div className="page">

      <header className="page-header">

        <div>

          <p className="eyebrow">
            Incident Management
          </p>

          <h1>
            Incidents
          </h1>

          <p>
            Review and manage all
            reported incidents.
          </p>

        </div>

        <Link
          to="/tickets/new"
          className="primary-button"
        >
          <Plus size={18} />
          New Incident
        </Link>

      </header>

      <section className="content-card">

        {loading ? (

          <p>
            Loading incidents...
          </p>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Incident</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Created</th>
                </tr>

              </thead>

              <tbody>

                {tickets.map(
                  (ticket) => (

                    <tr key={ticket.id}>

                      <td>
                        #{ticket.id}
                      </td>

                      <td>

                        <Link
                          className="ticket-link"
                          to={`/tickets/${ticket.id}`}
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
                        {ticket.category ??
                          "Unclassified"}
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

export default TicketsPage;