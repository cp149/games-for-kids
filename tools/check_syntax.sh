#!/bin/bash
# Syntax checker for web game projects
# Checks JavaScript, JSON, and CSS files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
PASSED=0
FAILED=0
ERRORS=()

# Print usage
usage() {
    echo "Usage: $0 [options] [path]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -j, --js       Check only JavaScript files"
    echo "  -c, --css      Check only CSS files"
    echo "  -n, --json     Check only JSON files"
    echo "  -a, --all      Check all supported files (default)"
    echo "  -v, --verbose  Verbose output"
    echo ""
    echo "Path: Directory or file to check (default: current directory)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Check all files in current directory"
    echo "  $0 -j ./js            # Check only JS files in ./js"
    echo "  $0 game.js            # Check single file"
}

# Check JavaScript syntax
check_js() {
    local file="$1"
    TOTAL=$((TOTAL + 1))

    if node -c "$file" 2>/dev/null; then
        PASSED=$((PASSED + 1))
        if [ "$VERBOSE" = true ]; then
            echo -e "${GREEN}✓${NC} $file"
        fi
        return 0
    else
        FAILED=$((FAILED + 1))
        echo -e "${RED}✗${NC} $file"
        ERRORS+=("$file")
        # Show actual error
        node -c "$file" 2>&1 | head -5
        return 1
    fi
}

# Check JSON syntax
check_json() {
    local file="$1"
    TOTAL=$((TOTAL + 1))

    if python3 -m json.tool "$file" > /dev/null 2>&1; then
        PASSED=$((PASSED + 1))
        if [ "$VERBOSE" = true ]; then
            echo -e "${GREEN}✓${NC} $file"
        fi
        return 0
    else
        FAILED=$((FAILED + 1))
        echo -e "${RED}✗${NC} $file"
        ERRORS+=("$file")
        python3 -m json.tool "$file" 2>&1 | head -3
        return 1
    fi
}

# Check CSS syntax (basic validation using Node.js css-tree if available, otherwise skip)
check_css() {
    local file="$1"
    TOTAL=$((TOTAL + 1))

    # Basic check: file exists and is readable
    if [ -r "$file" ]; then
        # Check for common CSS syntax errors using grep
        # Look for unmatched braces (simple heuristic)
        local open_braces=$(grep -o '{' "$file" | wc -l)
        local close_braces=$(grep -o '}' "$file" | wc -l)

        if [ "$open_braces" -eq "$close_braces" ]; then
            PASSED=$((PASSED + 1))
            if [ "$VERBOSE" = true ]; then
                echo -e "${GREEN}✓${NC} $file (braces balanced)"
            fi
            return 0
        else
            FAILED=$((FAILED + 1))
            echo -e "${RED}✗${NC} $file (unbalanced braces: { $open_braces vs } $close_braces)"
            ERRORS+=("$file")
            return 1
        fi
    else
        FAILED=$((FAILED + 1))
        echo -e "${RED}✗${NC} $file (not readable)"
        ERRORS+=("$file")
        return 1
    fi
}

# Parse arguments
CHECK_JS=false
CHECK_CSS=false
CHECK_JSON=false
CHECK_ALL=true
VERBOSE=false
TARGET_PATH="."

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -j|--js)
            CHECK_JS=true
            CHECK_ALL=false
            shift
            ;;
        -c|--css)
            CHECK_CSS=true
            CHECK_ALL=false
            shift
            ;;
        -n|--json)
            CHECK_JSON=true
            CHECK_ALL=false
            shift
            ;;
        -a|--all)
            CHECK_ALL=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            TARGET_PATH="$1"
            shift
            ;;
    esac
done

# If checking all, enable all types
if [ "$CHECK_ALL" = true ]; then
    CHECK_JS=true
    CHECK_CSS=true
    CHECK_JSON=true
fi

echo "=========================================="
echo "  Syntax Checker for Web Games"
echo "=========================================="
echo "Target: $TARGET_PATH"
echo ""

# Check if target exists
if [ ! -e "$TARGET_PATH" ]; then
    echo -e "${RED}Error: Path not found: $TARGET_PATH${NC}"
    exit 1
fi

# Check single file
if [ -f "$TARGET_PATH" ]; then
    case "$TARGET_PATH" in
        *.js)
            check_js "$TARGET_PATH"
            ;;
        *.json)
            check_json "$TARGET_PATH"
            ;;
        *.css)
            check_css "$TARGET_PATH"
            ;;
        *)
            echo -e "${YELLOW}Unknown file type: $TARGET_PATH${NC}"
            ;;
    esac
else
    # Check directory
    if [ "$CHECK_JS" = true ]; then
        echo -e "${YELLOW}Checking JavaScript files...${NC}"
        while IFS= read -r -d '' file; do
            check_js "$file" || true
        done < <(find "$TARGET_PATH" -name "*.js" -type f -print0 2>/dev/null)
    fi

    if [ "$CHECK_JSON" = true ]; then
        echo -e "${YELLOW}Checking JSON files...${NC}"
        while IFS= read -r -d '' file; do
            check_json "$file" || true
        done < <(find "$TARGET_PATH" -name "*.json" -type f -print0 2>/dev/null)
    fi

    if [ "$CHECK_CSS" = true ]; then
        echo -e "${YELLOW}Checking CSS files...${NC}"
        while IFS= read -r -d '' file; do
            check_css "$file" || true
        done < <(find "$TARGET_PATH" -name "*.css" -type f -print0 2>/dev/null)
    fi
fi

# Summary
echo ""
echo "=========================================="
echo "  Summary"
echo "=========================================="
echo -e "Total:  $TOTAL"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ ${#ERRORS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Files with errors:${NC}"
    for err in "${ERRORS[@]}"; do
        echo "  - $err"
    done
    exit 1
else
    echo ""
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
fi
