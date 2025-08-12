---
description: Code Style Guidelines for Agent OS Task Execution System
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Code Style Guidelines - Agent OS Task Execution System

## General Principles
- **Consistency**: Apply the same style rules consistently across the entire codebase
- **Readability**: Prioritize code readability over clever or terse solutions
- **Maintainability**: Write code that is easy to understand, modify, and extend
- **Performance**: Balance code style with performance considerations

## TypeScript Style Guidelines
### Naming Conventions
- **Classes**: PascalCase (e.g., `TaskExecutor`, `FileReader`)
- **Interfaces**: PascalCase with 'I' prefix (e.g., `ITask`, `IConfig`)
- **Functions/Methods**: camelCase (e.g., `executeTask`, `readFile`)
- **Variables**: camelCase (e.g., `taskList`, `filePath`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Private Members**: camelCase with underscore prefix (e.g., `_internalState`)

### File Organization
- **File Names**: kebab-case (e.g., `task-executor.ts`, `file-reader.ts`)
- **Directory Structure**: Follow established project hierarchy
- **Import Order**: Standard library → External dependencies → Internal modules
- **Group Related Code**: Keep related functionality together in the same file

### Code Formatting
- **Indentation**: Use 2 spaces for indentation (no tabs)
- **Line Length**: Maximum 100 characters per line
- **Semicolons**: Use semicolons at the end of statements
- **Quotes**: Use single quotes for string literals
- **Trailing Commas**: Use trailing commas in multi-line structures

### Function Guidelines
- **Single Purpose**: Each function should do one thing and do it well
- **Parameter Limits**: Limit functions to 3-4 parameters maximum
- **Descriptive Names**: Use clear, descriptive function names
- **Error Handling**: Implement proper error handling with try-catch blocks

### Class Guidelines
- **Constructor Injection**: Use constructor injection for dependencies
- **Interface Segregation**: Implement specific interfaces rather than general ones
- **Access Modifiers**: Use explicit access modifiers (public, private, protected)
- **Property Validation**: Validate properties in setters or constructor

## Markdown Style Guidelines
### Task Documentation
- **Clear Titles**: Use descriptive titles for each task
- **Structured Lists**: Use bullet points and numbered lists for complex information
- **Code Blocks**: Use proper code blocks with language identifiers
- **Status Tracking**: Use consistent status markers ([ ], [x], [-])

### Comment Guidelines
- **Meaningful Comments**: Add comments that explain why, not what
- **TODO Comments**: Use TODO comments for future improvements
- **FIXME Comments**: Use FIXME comments for known issues
- **Comment Format**: Use // for single-line comments and /* */ for multi-line comments

## Testing Style Guidelines
### Test File Organization
- **Naming**: Use `.test.ts` or `.spec.ts` suffix for test files
- **Location**: Place test files alongside source files
- **Grouping**: Group related tests in describe blocks
- **Nesting**: Use nested describe blocks for test organization

### Test Writing Style
- **Descriptive Names**: Use clear, descriptive test names
- **Arrange-Act-Assert**: Structure tests with clear arrangement, action, and assertion phases
- **One Assertion**: Test one behavior per test case
- **Mocking**: Use proper mocking for external dependencies

## Error Handling Style
### Exception Handling
- **Specific Exceptions**: Catch specific exceptions rather than generic ones
- **Resource Cleanup**: Use try-finally blocks for resource cleanup
- **Error Propagation**: Re-throw exceptions with additional context when needed
- **Logging**: Log errors with appropriate severity levels

### Validation Style
- **Early Validation**: Validate inputs at the beginning of functions
- **Clear Messages**: Provide clear, actionable validation error messages
- **Type Safety**: Use TypeScript's type system for compile-time validation
- **Defensive Programming**: Assume inputs might be invalid and handle accordingly