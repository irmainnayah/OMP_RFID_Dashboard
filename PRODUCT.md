# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Workshop supervisors, maintenance leads, and workshop operations teams managing and monitoring heavy equipment undergoing service inside industrial maintenance bays.

## Product Purpose

Real-time visibility into workshop bay utilization and equipment servicing for the SMMS WORKSHOP SERVICE MONITORING DASHBOARD (OMP RFID). It enables supervisors and operations teams to monitor equipment service status at a glance, detect overdue or stalled services immediately, track progress, and coordinate heavy equipment turnover efficiently across workshop bays.

## Positioning

SMMS Workshop Service Monitoring Dashboard (OMP RFID): industrial heavy equipment workshop bay monitoring system connecting physical workshop bay presence (RFID-tagged heavy equipment) with live operational telemetry, replacing manual status whiteboards and fragmented paperwork with automated, glanceable bay tracking.

## Operating Context

- Industrial heavy equipment workshops (e.g., mining, construction, or fleet maintenance facilities).
- Wall-mounted central display boards, supervisor workstations, and shop-floor terminals viewed in active industrial environments.
- High-glanceability environment where quick scanning of bay occupancy, active equipment ID, progress, and urgency (e.g., OVERDUE alerts) is essential.

## Capabilities and Constraints

- **Bay Monitoring**: Dedicated real-time view for 4 workshop bays: `BAY 01`, `BAY 02`, `BAY 07`, and `BAY 08`.
- **Equipment & Service Telemetry**: Focused on HD875-series heavy equipment. Displays bay number, equipment ID, HD875 equipment context, equipment visual, service status (`IN SERVICE`, `COMPLETE`, `OVERDUE`), service progress (when available), and service timing (when available), plus live header date/time.
- **Data Source**: Initial phase uses mock/dummy data decoupled in `OmpRfidDashboard/Data/DummyBays.cs` (fallback when the API is unavailable). RFID hardware readers, backend APIs, and database integration will be connected in later phases without altering the UI contract.
- **Visual Direction**: Clean, modern, professional, slightly futuristic industrial design with a comfortable light/neutral background, dark navy/charcoal text, restrained brand accents, and redundant status indicators (color + icon + text: IN SERVICE = green, COMPLETE = blue/teal, OVERDUE = red).
- **Stack**: ASP.NET Core MVC (.NET 10), C#, Razor views, Tailwind CSS v4 (build-time only), vanilla JavaScript.

## Evidence on Hand

- Project repository is an ASP.NET Core MVC (.NET 10) application styled with Tailwind CSS v4.
- Defined bay configuration: 4 target bays (`BAY 01`, `BAY 02`, `BAY 07`, `BAY 08`).
- Defined status vocabulary: `IN SERVICE`, `COMPLETE`, `OVERDUE`.
- RFID reader hardware and backend APIs are pending future phases (must use realistic mock telemetry without fabricating external connections).

## Product Principles

- **Industrial Glanceability**: Status, bay occupancy, equipment IDs, and time-critical warnings must be legible and immediately understandable from a distance.
- **Operational Urgency & Clarity**: Status states—especially `OVERDUE` vs `IN SERVICE` vs `COMPLETE`—must have high visual distinction to prevent downtime.
- **Future-Ready Decoupling**: Visual components and data hooks must clearly separate presentation from telemetry feeds to make future RFID API integration seamless.
