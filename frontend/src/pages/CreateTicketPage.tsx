import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createTicket } from "../api/ticketApi";

import type {
  TicketPriority,
} from "../types/ticket";

function CreateTicketPage() {

  const navigate =
    useNavigate();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState<TicketPriority>("MEDIUM");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    setError("");

    if (
      !title.trim() ||
      !description.trim()
    ) {

      setError(
        "Title and description are required."
      );

      return;
    }

    try {

      setSubmitting(true);

      const ticket =
        await createTicket({
          title,
          description,
          priority,
        });

      navigate(
        `/tickets/${ticket.id}`
      );

    } catch (error) {

      console.error(error);

      setError(
        "Unable to create incident."
      );

    } finally {

      setSubmitting(false);

    }

  };

  return (
    <div className="page">

      <header className="page-header">

        <div>

          <p className="eyebrow">
            New Incident
          </p>

          <h1>
            Report an Incident
          </h1>

          <p>
            Provide details about the
            technical issue you encountered.
          </p>

        </div>

      </header>

      <section className="form-card">

        <form
          onSubmit={handleSubmit}
          className="incident-form"
        >

          <div className="form-group">

            <label htmlFor="title">
              Incident title
            </label>

            <input
              id="title"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Example: Payment API returning HTTP 500"
            />

          </div>

          <div className="form-group">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              rows={8}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the issue, observed behavior, and relevant context..."
            />

          </div>

          <div className="form-group">

            <label htmlFor="priority">
              Priority
            </label>

            <select
              id="priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target
                    .value as TicketPriority
                )
              }
            >

              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="CRITICAL">
                Critical
              </option>

            </select>

          </div>

          {error && (

            <div className="error-message">
              {error}
            </div>

          )}

          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/tickets")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? "Creating..."
                : "Create Incident"}
            </button>

          </div>

        </form>

      </section>

    </div>
  );
}

export default CreateTicketPage;