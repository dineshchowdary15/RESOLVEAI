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
  getTicketAnalysis,
  getTicketById,
  updateTicketStatus,
} from "../api/ticketApi";

import type {
  Ticket,
  TicketAnalysis,
  TicketStatus,
} from "../types/ticket";

import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";

function TicketDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [ticket, setTicket] =
    useState<Ticket | null>(null);

  const [analysis, setAnalysis] =
    useState<TicketAnalysis | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [analysisError, setAnalysisError] =
    useState("");

  /*
   * Load:
   * 1. Ticket information
   * 2. Previously saved AI analysis
   */
  useEffect(() => {
    const loadTicketData = async () => {
      if (!id) {
        setError("Invalid incident ID.");
        setLoading(false);
        return;
      }

      const ticketId = Number(id);

      if (Number.isNaN(ticketId)) {
        setError("Invalid incident ID.");
        setLoading(false);
        return;
      }

      try {
        /*
         * Load the incident first.
         */
        const ticketData =
          await getTicketById(ticketId);

        setTicket(ticketData);

        /*
         * Loading an AI analysis is optional.
         *
         * If no analysis exists, the incident
         * should still display normally.
         */
        try {
          const savedAnalysis =
            await getTicketAnalysis(ticketId);

          if (savedAnalysis) {
            setAnalysis(savedAnalysis);
          }
        } catch (analysisLoadError) {
          console.error(
            "Unable to load saved AI analysis:",
            analysisLoadError
          );

          /*
           * Do not fail the whole page just because
           * AI analysis could not be retrieved.
           */
          setAnalysisError(
            "Previous AI analysis could not be loaded."
          );
        }
      } catch (ticketLoadError) {
        console.error(
          "Unable to load incident:",
          ticketLoadError
        );

        setError(
          "Incident could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTicketData();
  }, [id]);

  /*
   * Update lifecycle status.
   */
  const handleStatusChange = async (
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
    } catch (statusError) {
      console.error(
        "Unable to update incident status:",
        statusError
      );
    }
  };

  /*
   * Delete incident.
   */
  const handleDelete = async () => {
    if (!ticket) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this incident?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTicket(ticket.id);

      navigate("/tickets");
    } catch (deleteError) {
      console.error(
        "Unable to delete incident:",
        deleteError
      );
    }
  };

  /*
   * Run a new AI analysis.
   *
   * Backend flow:
   *
   * React
   *   ↓
   * Spring Boot
   *   ↓
   * FastAPI
   *   ↓
   * Ollama
   *   ↓
   * PostgreSQL persistence
   *   ↓
   * React
   */
  const handleAnalyze = async () => {
    if (!ticket) {
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisError("");

      const result =
        await analyzeTicket(ticket.id);

      setAnalysis(result);
    } catch (analysisRequestError) {
      console.error(
        "AI analysis failed:",
        analysisRequestError
      );

      setAnalysisError(
        "AI analysis is currently unavailable."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div className="page">
        Loading incident...
      </div>
    );
  }

  /*
   * Ticket not found / failed to load.
   */
  if (error || !ticket) {
    return (
      <div className="page">
        <h1>
          Incident unavailable
        </h1>

        <p>
          {error ||
            "The requested incident could not be found."}
        </p>

        <Link
          to="/tickets"
          className="back-link"
        >
          <ArrowLeft size={18} />
          Return to incidents
        </Link>
      </div>
    );
  }

  return (
    <div className="page">

      {/* Back navigation */}

      <Link
        to="/tickets"
        className="back-link"
      >
        <ArrowLeft size={18} />
        Back to incidents
      </Link>

      {/* Incident heading */}

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
              priority={ticket.priority}
            />

            <StatusBadge
              status={ticket.status}
            />

          </div>

        </div>

        <button
          type="button"
          className="danger-button"
          onClick={handleDelete}
        >
          <Trash2 size={17} />
          Delete
        </button>

      </header>

      {/* Incident information */}

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
              <span>
                Created
              </span>

              <strong>
                {new Date(
                  ticket.createdAt
                ).toLocaleString()}
              </strong>
            </div>

            <div>
              <span>
                Category
              </span>

              <strong>
                {analysis?.category ??
                  ticket.category ??
                  "Not classified"}
              </strong>
            </div>

          </div>

        </section>

        {/* Status management */}

        <section className="content-card">

          <h2>
            Incident Status
          </h2>

          <p>
            Update the incident's current
            lifecycle state.
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

      {/* AI analysis */}

      <section className="ai-panel">

        <div className="ai-heading">

          <BrainCircuit size={24} />

          <div>
            <h2>
              AI Incident Analysis
            </h2>

            <p>
              ResolveAI intelligence engine
            </p>
          </div>

        </div>

        {!analysis ? (

          /*
           * No saved AI analysis yet.
           */
          <div className="ai-placeholder">

            <BrainCircuit size={38} />

            <h3>
              Analyze this incident with AI
            </h3>

            <p>
              ResolveAI will classify the
              incident, identify possible
              causes and recommend technical
              troubleshooting steps.
            </p>

            {analysisError && (
              <div className="error-message">
                {analysisError}
              </div>
            )}

            <button
              type="button"
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

          /*
           * Existing or newly-generated
           * AI analysis.
           */
          <div className="analysis-results">

            {/* Summary metrics */}

            <div className="analysis-summary-grid">

              <div className="analysis-stat">

                <span>
                  Category
                </span>

                <strong>
                  {analysis.category}
                </strong>

              </div>

              <div className="analysis-stat">

                <span>
                  Predicted Priority
                </span>

                <strong>
                  {analysis.predictedPriority}
                </strong>

              </div>

              <div className="analysis-stat">

                <span>
                  Confidence
                </span>

                <strong>
                  {Math.round(
                    analysis.confidence * 100
                  )}
                  %
                </strong>

              </div>

            </div>

            {/* Timestamp */}

            <p className="analysis-timestamp">
              Analysis generated{" "}
              {new Date(
                analysis.createdAt
              ).toLocaleString()}
            </p>

            {/* Summary */}

            <div className="analysis-section">

              <h3>
                Summary
              </h3>

              <p>
                {analysis.summary}
              </p>

            </div>

            {/* Possible causes */}

            <div className="analysis-section">

              <h3>
                Possible Causes
              </h3>

              <ul>

                {analysis.possibleCauses.map(
                  (cause, index) => (
                    <li
                      key={`${cause}-${index}`}
                    >
                      {cause}
                    </li>
                  )
                )}

              </ul>

            </div>

            {/* Recommendations */}

            <div className="analysis-section">

              <h3>
                Recommended Actions
              </h3>

              <ol>

                {analysis.recommendedActions.map(
                  (action, index) => (
                    <li
                      key={`${action}-${index}`}
                    >
                      {action}
                    </li>
                  )
                )}

              </ol>

            </div>

            {/* Analysis error */}

            {analysisError && (
              <div className="error-message">
                {analysisError}
              </div>
            )}

            {/* Re-run analysis */}

            <button
              type="button"
              className="secondary-button"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              <BrainCircuit size={17} />

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