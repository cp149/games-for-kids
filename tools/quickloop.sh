#!/bin/bash
# =============================================================================
# Quickloop - Simple convergence driver (no fancy output)
# Usage: ./quickloop.sh [target] [max_loops] [check_command]
# =============================================================================

TARGET="${1:-.}"
MAX="${2:-5}"
CHECK="${3:-npm test}"

for i in $(seq 1 $MAX); do
    echo "=== Loop $i/$MAX ==="

    if eval "$CHECK" 2>/dev/null; then
        echo "Done! Tests pass."
        exit 0
    fi

    # Save error and call Claude
    eval "$CHECK" > .err.log 2>&1 || true
    claude --print "/sc:converge --target $TARGET" < .err.log
done

echo "Max loops reached."
exit 1
