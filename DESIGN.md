---
name: SMMS Workshop Service Monitoring Dashboard
description: Clean, modern, professional industrial design system for heavy equipment bay monitoring
colors:
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  text-primary: "#0f172a"
  text-secondary: "#475569"
  text-muted: "#64748b"
  border-subtle: "#e2e8f0"
  status-in-service: "#059669"
  status-complete: "#0284c7"
  status-overdue: "#e11d48"
typography:
  display:
    fontFamily: "var(--font-geist-sans), -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: "var(--font-geist-sans), -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "var(--font-geist-sans), -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "var(--font-geist-mono), monospace"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
---

# Design System: SMMS Workshop Service Monitoring Dashboard

## Overview

**Creative North Star: "The Modern Workshop Command Board"**

The visual language is clean, modern, professional, slightly futuristic, and industrial. It rejects the dark cyberpunk tropes of saturated neon glows, decorative glassmorphism, and low-contrast palettes in favor of a comfortable, light neutral working environment engineered for maximum glanceability from across an active maintenance facility.

**Key Characteristics:**
- High-contrast charcoal and dark navy typography set against a calm, light neutral ground.
- Tri-channel status semantics combining color, semantic SVG iconography, and explicit textual state names.
- Decoupled presentation architecture ensuring mock telemetry can transition to live hardware RFID streams without visual redesign.

## Colors

The palette is restrained, purposeful, and functional, using color strictly to convey operational status and structural grouping.

### Primary
- **Command Slate** (`#0f172a`): Used for primary headings, bay identifiers, and dominant telemetry numerals.

### Neutral
- **Facility Ground** (`#f8fafc`): Base canvas providing a clean, non-glare background under workshop lighting.
- **Surface White** (`#ffffff`): Card and header container background for crisp separation.
- **Divider Slate** (`#e2e8f0`): Crisp border boundaries.
- **Muted Steel** (`#64748b`): Secondary labels and structural subtitles.

### Functional Status Roles
- **Service Green** (`#059669`): Denotes active maintenance in progress (`IN SERVICE`).
- **Precision Blue/Teal** (`#0284c7`): Denotes finished service ready for equipment release (`COMPLETE`).
- **Alert Red** (`#e11d48`): Denotes services exceeding target turnaround duration (`OVERDUE`).

### Named Rules
**The Tri-Channel Status Rule.** Status is never communicated by color alone. Every status representation must pair distinct color with an SVG icon and explicit text.

## Typography

**Display & Body Font:** Geist Sans (with system sans-serif fallback)  
**Telemetry & Numerals:** Geist Mono (with monospace fallback, tabular numerals)

### Hierarchy
- **Header Title** (Bold 700, 1.25rem–1.5rem, leading-tight): Primary dashboard identity.
- **Bay Identifier** (Extrabold 800, 1.5rem, mono): Dominant card anchor for distance scanning.
- **Equipment ID** (Bold 700, 1.125rem–1.25rem, mono): Primary machinery asset tag.
- **Telemetry Numerals** (Bold 700, tabular-nums): Progress percentages, timers, and metric counts.
- **Labels & Captions** (Semibold 600, 0.6875rem–0.75rem, uppercase): Metadata and category tags.

## Layout

- **Hierarchy Structure:** Top Header → Summary Counters → Dominant 2x2 Bay Grid → Footer Legend.
- **Grid Strategy:** Fluid 2-column landscape grid (`grid-cols-1 lg:grid-cols-2`) scaling gracefully from 1080p wall displays to smaller workstation monitors.

## Elevation & Depth

Surfaces rely on tonal layering and crisp 1px borders rather than heavy decorative drop shadows. A subtle, soft shadow (`shadow-xs` / `shadow-sm`) provides gentle physical lift.

## Shapes

- **Bay Cards:** 12px rounded corners (`rounded-xl`) with 1px border.
- **Status Badges & Controls:** 6px–8px rounded corners (`rounded-md`).
- **Progress Track:** Pill-shaped rounded track (`rounded-full`).

## Components

### BayCard
The dominant visual container. Displays bay number, status badge, equipment ID, equipment visual asset, service progress bar, and elapsed/target timing.

### EquipmentVisual
Dedicated container for heavy equipment assets. Renders an HD875 rigid haul truck image with future-ready support for animated GIFs.

### StatusBadge
Accessible indicator providing high-visibility functional cues for `IN_SERVICE`, `COMPLETE`, and `OVERDUE`.

### SummaryBar
Compact row displaying aggregate dynamic counts derived from the active bay dataset.

## Do's and Don'ts

### Do:
- **Do** maintain high text contrast (>= 4.5:1) across all elements.
- **Do** format numeric times and percentages with `tabular-nums`.
- **Do** keep summary counts dynamically computed from the active dataset.

### Don't:
- **Don't** use dark-mode neon glows, matrix green, or glassmorphic blurs.
- **Don't** rely on color alone to indicate equipment status.
- **Don't** invent mandatory diagnostic fields such as RFID RSSI or technician names on this surface.
