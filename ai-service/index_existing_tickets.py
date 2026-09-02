from app.services.database_service import (
    get_connection,
)

from app.services.duplicate_service import (
    index_ticket,
)


def main():

    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    id,
                    title,
                    description
                FROM tickets
                ORDER BY id
                """
            )

            tickets = cursor.fetchall()

    print(
        f"Found {len(tickets)} tickets."
    )

    for (
        ticket_id,
        title,
        description,
    ) in tickets:

        print(
            f"Indexing ticket #{ticket_id}: "
            f"{title}"
        )

        index_ticket(
            ticket_id=ticket_id,
            title=title,
            description=description,
        )

    print()
    print(
        "Ticket embedding indexing complete."
    )


if __name__ == "__main__":
    main()