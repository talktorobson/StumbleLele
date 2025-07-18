#!/bin/bash

# Test Runner Script for StumbleLele Friends Chat System
# Agent 5 - Integration & Testing Specialist

set -e

echo "🚀 Starting StumbleLele Friends Chat System Tests"
echo "=================================================="

# Check environment
echo "Environment check:"
echo "- Node version: $(node --version)"
echo "- NPM version: $(npm --version)"
echo "- Working directory: $(pwd)"
echo ""

# Set environment variables
export NODE_ENV=test
export CI=true

# Function to run test suite
run_test_suite() {
    local suite_name=$1
    local test_pattern=$2
    
    echo "📋 Running $suite_name tests..."
    echo "Pattern: $test_pattern"
    
    if npx jest --config=tests/jest.config.js --testPathPattern="$test_pattern" --verbose; then
        echo "✅ $suite_name tests passed"
    else
        echo "❌ $suite_name tests failed"
        exit 1
    fi
    echo ""
}

# Function to run performance tests
run_performance_tests() {
    echo "⚡ Running Performance Tests..."
    
    export PERFORMANCE_TEST_ENABLED=true
    export LOAD_TEST_CONCURRENCY=10
    
    if npx jest --config=tests/jest.config.js --testPathPattern="performance" --verbose --maxWorkers=1; then
        echo "✅ Performance tests passed"
    else
        echo "❌ Performance tests failed"
        exit 1
    fi
    echo ""
}

# Function to run security tests
run_security_tests() {
    echo "🔒 Running Security Tests..."
    
    export SECURITY_TEST_ENABLED=true
    
    if npx jest --config=tests/jest.config.js --testPathPattern="security" --verbose; then
        echo "✅ Security tests passed"
    else
        echo "❌ Security tests failed"
        exit 1
    fi
    echo ""
}

# Function to run real-time tests
run_realtime_tests() {
    echo "⚡ Running Real-time Tests..."
    
    export REALTIME_TEST_ENABLED=true
    export REALTIME_TEST_TIMEOUT=10000
    
    if npx jest --config=tests/jest.config.js --testPathPattern="realtime" --verbose --testTimeout=30000; then
        echo "✅ Real-time tests passed"
    else
        echo "❌ Real-time tests failed"
        exit 1
    fi
    echo ""
}

# Function to generate test report
generate_test_report() {
    echo "📊 Generating Test Report..."
    
    # Create test results directory
    mkdir -p test-results
    
    # Run all tests with coverage
    npx jest --config=tests/jest.config.js --coverage --verbose --passWithNoTests --testResultsProcessor=jest-junit || true
    
    # Generate HTML coverage report
    echo "Coverage report generated in coverage/lcov-report/index.html"
    echo ""
}

# Main execution
main() {
    local test_type=${1:-"all"}
    
    case $test_type in
        "integration")
            run_test_suite "Integration" "integration"
            ;;
        "performance")
            run_performance_tests
            ;;
        "security")
            run_security_tests
            ;;
        "realtime")
            run_realtime_tests
            ;;
        "e2e")
            run_test_suite "End-to-End" "e2e"
            ;;
        "friends")
            run_test_suite "Friends Management" "friends"
            ;;
        "chat")
            run_test_suite "Chat System" "chat"
            ;;
        "report")
            generate_test_report
            ;;
        "all")
            echo "🎯 Running Complete Test Suite"
            echo "=============================="
            
            # Run all test suites
            run_test_suite "Friends Management" "friends"
            run_test_suite "Chat System" "chat"
            run_realtime_tests
            run_test_suite "End-to-End Workflows" "e2e"
            run_performance_tests
            run_security_tests
            
            # Generate final report
            generate_test_report
            
            echo "🎉 All tests completed successfully!"
            echo "=================================="
            ;;
        *)
            echo "Usage: $0 [integration|performance|security|realtime|e2e|friends|chat|report|all]"
            echo ""
            echo "Test suites available:"
            echo "  integration  - Run integration tests"
            echo "  performance  - Run performance tests"
            echo "  security     - Run security tests"
            echo "  realtime     - Run real-time tests"
            echo "  e2e          - Run end-to-end tests"
            echo "  friends      - Run friends management tests"
            echo "  chat         - Run chat system tests"
            echo "  report       - Generate test report"
            echo "  all          - Run all tests (default)"
            exit 1
            ;;
    esac
}

# Trap to cleanup on script exit
cleanup() {
    echo "🧹 Cleaning up test environment..."
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
}

trap cleanup EXIT

# Run main function
main "$@"