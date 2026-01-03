#!/bin/bash
# =============================================================================
# Autoloop Driver for /sc:converge
# Inspired by Ralph Wiggum technique, but safer and more controllable
# =============================================================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TARGET="${1:-.}"
MAX_LOOPS="${2:-10}"
CHECK_CMD="${3:-npm test}"
CLAUDE_CMD="${4:-claude}"

# State file for tracking
STATE_FILE=".convergence-state"
ERROR_LOG=".convergence-error.log"

# Print banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            AUTOLOOP - Convergence Driver                   ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Target: $TARGET"
echo "║  Max Loops: $MAX_LOOPS"
echo "║  Check Command: $CHECK_CMD"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Initialize state
echo "0" > "$STATE_FILE"

# Main loop
for i in $(seq 1 $MAX_LOOPS); do
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Loop $i/$MAX_LOOPS${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    # Run verification command
    echo -e "${BLUE}Running verification: $CHECK_CMD${NC}"

    if eval "$CHECK_CMD" > "$ERROR_LOG" 2>&1; then
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  CONVERGENCE COMPLETE!                                     ║${NC}"
        echo -e "${GREEN}║  All checks passed after $i iteration(s)                   ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

        # Cleanup
        rm -f "$STATE_FILE" "$ERROR_LOG"
        exit 0
    fi

    # Show error summary
    echo -e "${RED}Verification failed. Error summary:${NC}"
    echo "----------------------------------------"
    tail -20 "$ERROR_LOG" 2>/dev/null || echo "(no error output)"
    echo "----------------------------------------"

    # Check for stuck loop (same error 3 times)
    CURRENT_HASH=$(md5sum "$ERROR_LOG" 2>/dev/null | cut -d' ' -f1 || echo "none")
    LAST_HASH=$(cat "${STATE_FILE}.hash" 2>/dev/null || echo "")
    REPEAT_COUNT=$(cat "${STATE_FILE}.repeat" 2>/dev/null || echo "0")

    if [ "$CURRENT_HASH" = "$LAST_HASH" ]; then
        REPEAT_COUNT=$((REPEAT_COUNT + 1))
        echo "$REPEAT_COUNT" > "${STATE_FILE}.repeat"

        if [ "$REPEAT_COUNT" -ge 3 ]; then
            echo ""
            echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
            echo -e "${RED}║  LOOP DETECTED!                                            ║${NC}"
            echo -e "${RED}║  Same error occurred 3 times in a row.                     ║${NC}"
            echo -e "${RED}║  Stopping to prevent infinite loop.                        ║${NC}"
            echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"

            # Cleanup
            rm -f "$STATE_FILE" "${STATE_FILE}.hash" "${STATE_FILE}.repeat" "$ERROR_LOG"
            exit 2
        fi

        echo -e "${YELLOW}Warning: Same error repeated $REPEAT_COUNT time(s)${NC}"
    else
        echo "0" > "${STATE_FILE}.repeat"
    fi
    echo "$CURRENT_HASH" > "${STATE_FILE}.hash"

    # Update loop count
    echo "$i" > "$STATE_FILE"

    # Call Claude to fix
    echo ""
    echo -e "${BLUE}Invoking Claude to fix...${NC}"
    echo ""

    # Build the prompt with error context
    ERROR_CONTEXT=$(tail -50 "$ERROR_LOG" 2>/dev/null || echo "No error log")

    $CLAUDE_CMD --print "/sc:converge --target $TARGET" <<EOF
Previous attempt failed. Error log:
\`\`\`
$ERROR_CONTEXT
\`\`\`

Please analyze and fix the issue. This is iteration $i of $MAX_LOOPS.
EOF

    # Brief pause between iterations
    echo ""
    echo -e "${BLUE}Waiting 2 seconds before next iteration...${NC}"
    sleep 2
done

# Max loops reached
echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  MAX ITERATIONS REACHED                                    ║${NC}"
echo -e "${RED}║  Convergence not achieved after $MAX_LOOPS attempts.       ║${NC}"
echo -e "${RED}║  Manual intervention required.                             ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"

# Show final error
echo ""
echo "Final error:"
cat "$ERROR_LOG" 2>/dev/null || echo "(no error log)"

# Cleanup
rm -f "$STATE_FILE" "${STATE_FILE}.hash" "${STATE_FILE}.repeat"

exit 1
