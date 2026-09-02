import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertTriangle,
  ExternalLink,
  Search,
} from "lucide-react";

import {
  checkTicketDuplicates,
  createTicket,
} from "../api/ticketApi";

import type {
  DuplicateSearchResponse,
  TicketPriority,
} from "../types/ticket";


function CreateTicketPage() {

  const navigate =
    useNavigate();


  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    priority,
    setPriority,
  ] =
    useState<TicketPriority>(
      "MEDIUM"
    );


  const [error, setError] =
    useState("");

  const [
    checkingDuplicates,
    setCheckingDuplicates,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    duplicateResult,
    setDuplicateResult,
  ] =
    useState<
      DuplicateSearchResponse | null
    >(null);


  /*
   * Only show results that actually
   * exceed the duplicate threshold.
   *
   * FastAPI may return additional
   * lower-ranked search results.
   */
  const strongDuplicateMatches =
    duplicateResult?.results.filter(
      (result) =>
        result.similarity >=
        duplicateResult.threshold
    ) ?? [];


  /*
   * Clear stale duplicate results if
   * the user changes the incident.
   */
  const handleTitleChange = (
    value: string
  ) => {

    setTitle(value);

    setDuplicateResult(null);

    setError("");
  };


  const handleDescriptionChange = (
    value: string
  ) => {

    setDescription(value);

    setDuplicateResult(null);

    setError("");
  };


  /*
   * =====================================================
   * CREATE TICKET
   * =====================================================
   *
   * This function intentionally skips
   * duplicate checking.
   *
   * It is called when:
   *
   * 1. No duplicate exists
   * 2. Duplicate detection is unavailable
   * 3. User explicitly chooses Create Anyway
   */
  const createNewIncident =
    async () => {

      try {

        setSubmitting(true);

        setError("");

        const ticket =
          await createTicket({
            title: title.trim(),
            description:
              description.trim(),
            priority,
          });

        navigate(
          `/tickets/${ticket.id}`
        );

      } catch (creationError) {

        console.error(
          creationError
        );

        setError(
          "Unable to create incident."
        );

      } finally {

        setSubmitting(false);

      }
    };


  /*
   * =====================================================
   * NORMAL SUBMIT
   * =====================================================
   *
   * Before creating the incident:
   *
   * 1. Validate
   * 2. Search semantic duplicates
   * 3. Warn user when match >= threshold
   * 4. Otherwise create normally
   */
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

      setCheckingDuplicates(
        true
      );

      const result =
        await checkTicketDuplicates({
          title: title.trim(),
          description:
            description.trim(),
        });


      const strongMatches =
        result.results.filter(
          (match) =>
            match.similarity >=
            result.threshold
        );


      /*
       * Duplicate found.
       *
       * Do NOT create yet.
       * Give the user a choice.
       */
      if (
        result.potentialDuplicate &&
        strongMatches.length > 0
      ) {

        setDuplicateResult(
          result
        );

        return;
      }


      /*
       * No meaningful duplicate.
       *
       * Proceed with ticket creation.
       */
      await createNewIncident();

    } catch (
      duplicateCheckError
    ) {

      /*
       * Duplicate detection is an
       * enhancement, not a requirement
       * for basic incident creation.
       *
       * If FastAPI/Ollama is unavailable,
       * users must still be able to
       * report incidents.
       */
      console.warn(
        "Duplicate detection unavailable. "
          + "Creating incident without duplicate check.",
        duplicateCheckError
      );

      await createNewIncident();

    } finally {

      setCheckingDuplicates(
        false
      );

    }
  };


  /*
   * =====================================================
   * CREATE ANYWAY
   * =====================================================
   */
  const handleCreateAnyway =
    async () => {

      setDuplicateResult(null);

      await createNewIncident();
    };


  const busy =
    submitting ||
    checkingDuplicates;


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

          {/* TITLE */}

          <div className="form-group">

            <label htmlFor="title">
              Incident title
            </label>

            <input
              id="title"
              value={title}
              onChange={(event) =>
                handleTitleChange(
                  event.target.value
                )
              }
              placeholder={
                "Example: Payment API "
                + "returning HTTP 500"
              }
            />

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label
              htmlFor="description"
            >
              Description
            </label>

            <textarea
              id="description"
              rows={8}
              value={description}
              onChange={(event) =>
                handleDescriptionChange(
                  event.target.value
                )
              }
              placeholder={
                "Describe the issue, "
                + "observed behavior, "
                + "and relevant context..."
              }
            />

          </div>


          {/* PRIORITY */}

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


          {/* DUPLICATE WARNING */}

          {strongDuplicateMatches.length >
            0 && (

            <div className="duplicate-warning">

              <div className="duplicate-warning-header">

                <div className="duplicate-warning-icon">

                  <AlertTriangle
                    size={20}
                  />

                </div>

                <div>

                  <h3>
                    Potential duplicate
                    incident detected
                  </h3>

                  <p>
                    ResolveAI found an
                    existing incident with
                    similar meaning.
                  </p>

                </div>

              </div>


              <div className="duplicate-match-list">

                {strongDuplicateMatches.map(
                  (match) => (

                    <div
                      className="duplicate-match-card"
                      key={match.ticketId}
                    >

                      <div className="duplicate-match-main">

                        <div className="duplicate-match-title">

                          <span>
                            Incident
                            {" "}
                            #{match.ticketId}
                          </span>

                          <strong>
                            {match.title}
                          </strong>

                        </div>


                        <p>
                          {match.description}
                        </p>

                      </div>


                      <div className="duplicate-match-side">

                        <div className="duplicate-similarity">

                          {Math.round(
                            match.similarity *
                              100
                          )}
                          %

                          <span>
                            similar
                          </span>

                        </div>


                        <button
                          type="button"
                          className="duplicate-view-button"
                          onClick={() =>
                            navigate(
                              `/tickets/${match.ticketId}`
                            )
                          }
                        >

                          <ExternalLink
                            size={15}
                          />

                          View Incident

                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>


              <div className="duplicate-warning-footer">

                <p>
                  If this is a different
                  issue, you can still
                  create a new incident.
                </p>

                <button
                  type="button"
                  className="duplicate-create-button"
                  disabled={busy}
                  onClick={
                    handleCreateAnyway
                  }
                >
                  {submitting
                    ? "Creating..."
                    : "Create Anyway"}
                </button>

              </div>

            </div>

          )}


          {/* ERROR */}

          {error && (

            <div className="error-message">
              {error}
            </div>

          )}


          {/* FORM ACTIONS */}

          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              disabled={busy}
              onClick={() =>
                navigate("/tickets")
              }
            >
              Cancel
            </button>


            {strongDuplicateMatches.length ===
            0 && (

              <button
                type="submit"
                className="primary-button"
                disabled={busy}
              >

                {checkingDuplicates ? (
                  <>
                    <Search size={17} />
                    Checking for duplicates...
                  </>
                ) : submitting ? (
                  "Creating..."
                ) : (
                  "Create Incident"
                )}

              </button>

            )}

          </div>

        </form>

      </section>

    </div>
  );
}


export default CreateTicketPage;