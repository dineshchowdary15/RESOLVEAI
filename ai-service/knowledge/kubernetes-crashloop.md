# Kubernetes CrashLoopBackOff Troubleshooting

CrashLoopBackOff means Kubernetes repeatedly starts a
container that exits or fails health checks.

Common causes include:

- Application startup exceptions.
- Missing secrets or environment variables.
- Database connectivity problems.
- Invalid application configuration.
- Failed liveness or readiness probes.
- Memory limits causing container termination.

Recommended troubleshooting steps:

1. Run kubectl logs for the failing pod.
2. Inspect previous container logs.
3. Run kubectl describe pod and review Events.
4. Verify ConfigMaps and Secrets.
5. Check readiness and liveness probe configuration.
6. Verify dependencies such as databases are reachable.
7. Inspect memory and CPU limits.