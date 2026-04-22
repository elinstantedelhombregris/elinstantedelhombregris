# Course Editorial Standard

Date: 2026-04-21

## Purpose

This is the source-of-truth content contract for all course packages under `SocialJusticeHub/content/courses`.

## Authoring Rules

- Write lessons in Markdown first.
- Use raw HTML only when it is strictly necessary for:
  - tables
  - inline SVG diagrams
  - code/preformatted blocks that need exact structure
- Do not use inline `style=` in lesson source.
- Do not use emoji as layout or heading decoration.

## Lesson Structure

Every lesson should normally include:

1. A strong opening paragraph that states what the lesson is about and why it matters.
2. Three to six sections with clear headings.
3. At least one concrete example, case, or scenario.
4. At least one practical exercise, reflection, or application block.
5. A short closing takeaway.

## Depth Targets

- Beginner lessons: 500 to 800 words.
- Intermediate lessons: 500 to 800 words.
- Advanced lessons: 650 to 1,000 words.
- Case-study and synthesis lessons may exceed this when justified, but not by accident.

## Language Standard

- Spanish-first across the entire catalog.
- Translate technical concepts on first mention and then stay consistent.
- Preferred terminology:
  - `teoría de juegos`
  - `bucles de retroalimentación`
  - `teoría de control`
  - `ciencia de la complejidad`
  - `mentalidad`
  - `agotamiento`
  - `cumplimiento`
  - `entradas y salidas`

## Metadata Rules

Every course must define:

- `seoTitle`
- `seoDescription`
- `searchSummary`
- `ogImageUrl`
- `lastReviewedAt`
- local `thumbnailUrl`

Every lesson should define:

- `description`
- `searchSummary` when useful
- `seoTitle` if the title needs clarification
- `seoDescription` if the default summary is weak

## Duration Rules

- Lesson duration must be derived from content reality.
- Use reading time plus exercise/media time.
- Course duration must match the sum of lesson durations within +/- 5 minutes.

## Quiz Rules

- Minimum target: one question per lesson.
- Questions should map to lesson outcomes, not just isolated trivia.
- Explanations should reinforce the lesson’s key idea.
