# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

qSpider is a web and desktop player for QSP (Quest Soft Player) games. It's built as a React application using NX workspace for monorepo management, with Tauri for desktop versions.

## Development Commands

### Starting Development Server
- `pnpm start` - Start the main web player development server (http://localhost:4200)
- `pnpm start:standalone` - Start standalone web player
- `pnpm start:desktop` - Start desktop version with Tauri (requires Rust installed)
- `pnpm start:docs` - Start documentation site

### Building
- `pnpm build` - Build all projects for production
- `pnpm build:standalone` - Build standalone web player
- `pnpm build:desktop` - Build desktop version
- `pnpm build:docs` - Build documentation

### Testing and Quality
- `pnpm test` - Run tests for all projects
- `pnpm lint` - Run ESLint on all projects
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### NX Specific Commands
- `nx build player` - Build specific player app
- `nx serve player` - Serve specific player app
- `nx affected` - Run commands on affected projects only
- `nx dep-graph` - View dependency graph

## Architecture

### Workspace Structure
The project uses NX monorepo with the following structure:

**Applications (`apps/`)**:
- `player` - Main web player application
- `player-standalone` - Standalone web player
- `player-desktop` - Desktop-specific player variant
- `docs` - Documentation site (Docusaurus)

**Libraries (`libs/`)**:
- `game-state` - Core game state management and QSP API integration
- `game-shelf` - Game library and storage management
- `renderer` - Game content rendering
- `html-renderer` - HTML content rendering
- `browser` - Browser-specific utilities
- `desktop` - Desktop-specific utilities
- `contracts` - TypeScript interfaces and types
- `i18n` - Internationalization support
- `importers` - Game file import functionality
- `utils` - Common utilities
- `tauri-storage` - Tauri-specific storage adapters

### Technology Stack
- **Frontend**: React 18.3, TypeScript, Vite
- **State Management**: Xoid for reactive state
- **UI Components**: Radix UI primitives with custom styling
- **Desktop**: Tauri (Rust backend)
- **Build System**: NX workspace with Vite
- **Styling**: TailwindCSS
- **Audio**: Howler.js
- **Game Engine**: @qsp/wasm-engine (WebAssembly QSP engine)

### Key Libraries and Dependencies
- `@qsp/wasm-engine` - Core QSP game engine (WebAssembly)
- `@qsp/converters` - Game file format converters
- `@radix-ui/*` - UI component primitives
- `@tauri-apps/api` - Tauri desktop integration
- `dexie` - IndexedDB wrapper for browser storage
- `i18next` - Internationalization framework
- `xoid` - Reactive state management

### Development Notes
- Default project is `player` as specified in nx.json
- Uses ESLint for linting with TypeScript support
- Prettier for code formatting
- Commitizen for conventional commits
- Husky for git hooks with lint-staged
- The project supports both web and desktop deployment
- Uses service workers for PWA functionality in web builds
- Desktop version requires Rust toolchain for Tauri

### Desktop Development
To set up desktop development:
1. Install Rust: https://rustup.rs/
2. Navigate to `src-tauri` directory and run `cargo install`
3. Use `pnpm start:desktop` for development

### Game Engine Integration
The application integrates with QSP games through the `@qsp/wasm-engine` WebAssembly module, providing:
- Game execution and state management
- Save/load functionality
- Resource handling (images, audio, etc.)
- HTML content rendering with custom themes