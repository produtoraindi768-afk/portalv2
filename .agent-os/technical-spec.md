---
description: Technical Specifications for Agent OS Task Execution System
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Technical Specifications - Agent OS Task Execution System

## System Architecture
- **Framework**: Node.js + TypeScript
- **Orchestration Mode**: Orchestrator mode for task coordination
- **Specialized Modes**: Code, Ask, Debug, Architect modes for specific tasks
- **Workflow**: TDD (Test-Driven Development) approach
- **File Structure**: Hierarchical organization with clear separation of concerns

## Technology Stack
- **Core Language**: TypeScript
- **Execution Engine**: Node.js runtime
- **Configuration**: YAML-based instruction files
- **Task Management**: Markdown-based task tracking
- **Testing**: Integrated test runner with subagent support

## Implementation Standards
- **File Naming**: kebab-case for files, PascalCase for TypeScript classes
- **Directory Structure**: 
  - `.agent-os/instructions/core/` - Core instruction files
  - `.agent-os/instructions/meta/` - Meta-instructions and pre-flight checks
  - `.agent-os/standards/` - Best practices and code style guidelines
  - `tasks.md` - Task list and execution tracking
- **Code Organization**: Modular design with clear separation of concerns

## Integration Requirements
- **Subagent System**: Context-fetcher for best practices and code style retrieval
- **Test Runner**: Dedicated test-runner subagent for task-specific verification
- **File Management**: Support for reading, writing, and updating project files
- **Progress Tracking**: Real-time task status updates in tasks.md

## Performance Criteria
- **Task Execution**: Sequential processing with clear dependencies
- **Memory Usage**: Optimized for large project structures
- **Response Time**: Efficient file operations and task coordination
- **Error Handling**: Comprehensive error reporting and recovery mechanisms

## Feature Specifications
### Task Understanding Phase
- Parse parent task and sub-tasks from tasks.md
- Identify dependencies and relationships
- Extract expected outcomes and deliverables

### Technical Review Phase
- Search technical specifications for relevant sections
- Extract implementation details for current task
- Filter out unrelated specifications

### Best Practices Integration
- Retrieve context-specific best practices
- Apply relevant patterns to implementation
- Ensure consistency across project

### Code Style Enforcement
- Apply language-specific style rules
- Maintain consistent formatting patterns
- Ensure component pattern compliance

### TDD Implementation
- Write comprehensive test suites first
- Implement functionality to pass tests
- Refactor while maintaining test coverage
- Verify all tests pass before completion

### Test Verification
- Run task-specific test suites
- Debug and fix failures
- Ensure no regressions in related functionality

### Status Management
- Update task status in real-time
- Track completion progress
- Document blocking issues with clear criteria