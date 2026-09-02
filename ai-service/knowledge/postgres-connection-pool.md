# PostgreSQL Connection Pool Troubleshooting

Applications using PostgreSQL commonly maintain a connection
pool such as HikariCP.

Connection pool exhaustion may appear as:

- Unable to acquire database connection.
- Connection timeout exceptions.
- HTTP 500 responses during high traffic.
- Long-running requests.
- High active connection counts.

Recommended troubleshooting steps:

1. Inspect HikariCP active, idle, and waiting connections.
2. Identify long-running database queries.
3. Check PostgreSQL max_connections.
4. Verify connections are returned to the pool.
5. Review recent application traffic increases.
6. Inspect database CPU and memory usage.
7. Review pool timeout and maximum pool size configuration.