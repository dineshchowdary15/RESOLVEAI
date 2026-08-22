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
  analyzeTicket,
  deleteTicket,
  getTicketById,
  updateTicketStatus,
} from "../api/ticketApi";

import type {
  AiAnalysis,
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
  const [analysis, setAnalysis] =
    useState<AiAnalysis | null>(null);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [analysisError, setAnalysisError] =
    useState("");
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
      const handleAnalyze =
  async () => {

    if (!ticket) {
      return;
    }

    try {

      setAnalyzing(true);
      setAnalysisError("");

      const result =
        await analyzeTicket(ticket.id);

      setAnalysis(result);

    } catch (error) {

      console.error(error);

      setAnalysisError(
        "AI analysis is currently unavailable."
      );

    } finally {

      setAnalyzing(false);

    }
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

        {!analysis ? (

  <div className="ai-placeholder">

    <BrainCircuit size={38} />

    <h3>
      Analyze this incident with AI
    </h3>

    <p>
      ResolveAI will classify the incident,
      identify possible causes and recommend
      technical troubleshooting steps.
    </p>

    {analysisError && (
      <div className="error-message">
        {analysisError}
      </div>
    )}

    <button
      className="primary-button"
      onClick={handleAnalyze}
      disabled={analyzing}
    >
      <BrainCircuit size={18} />

      {analyzing
        ? "Analyzing..."
        : "Analyze with AI"}
    </button>

  </div>

) : (

  <div className="analysis-results">

    <div className="analysis-summary-grid">

      <div className="analysis-stat">
        <span>Category</span>
        <strong>
          {analysis.category}
        </strong>
      </div>

      <div className="analysis-stat">
        <span>
          Predicted Priority
        </span>
        <strong>
          {analysis.predicted_priority}
        </strong>
      </div>

      <div className="analysis-stat">
        <span>Confidence</span>
        <strong>
          {Math.round(
            analysis.confidence * 100
          )}
          %
        </strong>
      </div>

    </div>

    <div className="analysis-section">

      <h3>Summary</h3>

      <p>
        {analysis.summary}
      </p>

    </div>

    <div className="analysis-section">

      <h3>Possible Causes</h3>

      <ul>
        {analysis.possible_causes.map(
          (cause, index) => (

            <li key={index}>
              {cause}
            </li>

          )
        )}
      </ul>

    </div>

    <div className="analysis-section">

      <h3>
        Recommended Actions
      </h3>

      <ol>
        {analysis.recommended_actions.map(
          (action, index) => (

            <li key={index}>
              {action}
            </li>

          )
        )}
      </ol>

    </div>

    <button
      className="secondary-button"
      onClick={handleAnalyze}
      disabled={analyzing}
    >
      {analyzing
        ? "Analyzing..."
        : "Run Analysis Again"}
    </button>

  </div>

)}

      </section>

    </div>
  );
}

export default TicketDetailsPage;