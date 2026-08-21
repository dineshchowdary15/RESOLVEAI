import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BrainCircuit,
  Trash2,
} from "lucide-react";

import {
  deleteTicket,
  getTicketById,
  updateTicketStatus,
} from "../api/ticketApi";

import type {
  Ticket,
  TicketStatus,
} from "../types/ticket";

import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";

function TicketDetailsPage() {

  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [ticket, setTicket] =
    useState<Ticket | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    const loadTicket =
      async () => {

        try {

          if (!id) {
            return;
          }

          const data =
            await getTicketById(
              Number(id)
            );

          setTicket(data);

        } catch (error) {

          console.error(error);

          setError(
            "Incident could not be found."
          );

        } finally {

          setLoading(false);

        }

      };

    loadTicket();

  }, [id]);

  const handleStatusChange =
    async (
      status: TicketStatus
    ) => {

      if (!ticket) {
        return;
      }

      try {

        const updated =
          await updateTicketStatus(
            ticket.id,
            status
          );

        setTicket(updated);

      } catch (error) {

        console.error(error);

      }

    };

  const handleDelete =
    async () => {

      if (!ticket) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this incident?"
        );

      if (!confirmed) {
        return;
      }

      await deleteTicket(
        ticket.id
      );

      navigate("/tickets");

    };

  if (loading) {

    return (
      <div className="page">
        Loading incident...
      </div>
    );

  }

  if (
    error ||
    !ticket
  ) {

    return (
      <div className="page">

        <h1>
          Incident unavailable
        </h1>

        <p>
          {error}
        </p>

        <Link to="/tickets">
          Return to incidents
        </Link>

      </div>
    );

  }

  return (
    <div className="page">

      <Link
        to="/tickets"
        className="back-link"
      >
        <ArrowLeft size={18} />
        Back to incidents
      </Link>

      <header className="ticket-details-header">

        <div>

          <p className="eyebrow">
            Incident #{ticket.id}
          </p>

          <h1>
            {ticket.title}
          </h1>

          <div className="badge-row">

            <PriorityBadge
              priority={
                ticket.priority
              }
            />

            <StatusBadge
              status={
                ticket.status
              }
            />

          </div>

        </div>

        <button
          className="danger-button"
          onClick={handleDelete}
        >
          <Trash2 size={17} />
          Delete
        </button>

      </header>

      <div className="details-grid">

        <section className="content-card">

          <h2>
            Incident Description
          </h2>

          <p className="description-text">
            {ticket.description}
          </p>

          <div className="ticket-meta">

            <div>
              <span>Created</span>
              <strong>
                {new Date(
                  ticket.createdAt
                ).toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Category</span>
              <strong>
                {ticket.category ??
                  "Not classified"}
              </strong>
            </div>

          </div>

        </section>

        <section className="content-card">

          <h2>
            Incident Status
          </h2>

          <p>
            Update the incident's
            current lifecycle state.
          </p>

          <select
            className="status-select"
            value={ticket.status}
            onChange={(event) =>
              handleStatusChange(
                event.target
                  .value as TicketStatus
              )
            }
          >

            <option value="OPEN">
              Open
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="CLOSED">
              Closed
            </option>

          </select>

        </section>

      </div>

      <section className="ai-panel">

        <div className="ai-heading">

          <BrainCircuit size={24} />

          <div>

            <h2>
              AI Incident Analysis
            </h2>

            <p>
              ResolveAI intelligence
              engine
            </p>

          </div>

        </div>

        <div className="ai-placeholder">

          <BrainCircuit
            size={38}
          />

          <h3>
            AI analysis coming next
          </h3>

          <p>
            The Python AI service will
            analyze this incident,
            classify it and recommend
            possible resolutions.
          </p>

        </div>

      </section>

    </div>
  );
}

export default TicketDetailsPage;