# Organization pitch notes — internal strategy

## The problem

Many team activities and internal learning sessions are passive. A meeting screen becomes another presentation instead of a shared experience. Ruckus gives people a small action and immediate feedback without asking for personal disclosure.

## The product

Conference-room screen + phone controller + live multiplayer. Originals supply instant activities; Studio turns a host’s custom questions into the same room-code, answer, reveal and results experience. Remote hosts share the stage through an existing video-call tool.

## Why QR matters

No app install, no participant account, and a short nickname/avatar join flow. The public frontend must be reachable from both office Wi-Fi and cellular; local development URLs are unsuitable for an internet pilot. Actual organization browser/network policies must be checked rather than promising universal IT approval.

## Custom board value and use cases

Company trivia, onboarding mixers, internal initiatives, knowledge refreshes, team building, department trivia, launch events, offsites and conferences. Custom questions remain plain text, with predictable timing and a clear reveal. Polls invite opinions without grades. A fictional Paper Moon Co. board demonstrates the workflow without implying an employer relationship.

## Pilot concept

Run a voluntary 8–12 person session for 10–15 minutes. First play an Original, then a five-question non-confidential custom board. Ask the host to create and preview the board unaided. Observe time to join, comprehension, reading distance, reconnects, accessibility barriers and desire to play again. Review an anonymous feedback summary; do not use game scores for employee evaluation.

## Current implementation

Local board drafts and file transfer; six Originals; server-authoritative custom questions, timing and scoring; independent phone controllers; bots; basic host controls; random session tokens; local refresh recovery; aggregate game summaries; deployment configuration for Netlify plus one persistent Render instance.

## Enterprise requirements before real rollout — future work

Security assessment and threat modeling; durable authoritative state and recovery; authenticated creators and workspace permissions; SSO consideration; access controls; audit logging; vulnerability/dependency management; scale/load testing; monitoring and incident ownership; retention/deletion policy; data inventory and legal/privacy/compliance review. Organizational network policy, contractual uptime expectations and approved hosting regions must be established.

This build does not have SSO, managed employee identities, certifications, organization dashboards, cloud board synchronization, formal moderation or enterprise support guarantees. QR/session tokens are a low-friction participation mechanism, not corporate authentication. Do not advertise invented client logos, adoption or training outcomes.
