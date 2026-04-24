# El Instante del Hombre Gris / ¡BASTA!
# Brand And Media Package

Prepared from the observed logo file `Logo.png`, the live website at https://www.elinstantedelhombregris.com, and the local repository content in `SocialJusticeHub/`.

Important fact standard: this package uses only facts visible in the current website/repo. Items needing confirmation are marked `TBC` or written as placeholders.

---

## 1. Executive Assessment

### A. Executive Diagnosis

El Instante del Hombre Gris is already carrying a rare and powerful strategic premise: it is not presenting itself as a party, campaign, startup, or media brand, but as civic infrastructure for a country that has grown tired of choosing between leaders and wants to participate in designing outcomes. The emotional core is strong: exhaustion converted into responsibility, prophecy reinterpreted as collective awakening, and political frustration redirected into tools, data, maps, plans, and distributed action.

The brand's central strength is its depth. The current site has philosophy, narrative energy, working product surfaces, a clear anti-caudillo stance, and a distinctive Argentine mythic frame. It does not feel like generic civic tech. It feels like a movement with a system behind it.

The central weakness is coherence under external scrutiny. Journalists, partners, institutions, and skeptical users will immediately ask: what is the legal entity, who is accountable, what is live versus planned, where are the downloadable assets, what claims are evidenced, and how should this be described in one sentence? The current brand has too many names competing for hierarchy: El Instante del Hombre Gris, ¡BASTA!, Hombre Gris, La Visión, La Semilla, El Mapa, Mandato Vivo, Círculos. The story is emotionally compelling, but the operating model is not yet packaged with enough factual discipline.

Strategic verdict: the brand should keep its mythic and philosophical force, but wrap it in a more press-ready architecture: one master brand, one movement name, one product/platform description, one evidence layer, one downloadable media center, and one clear explanation of what exists today.

### B. Highest-Priority Opportunities

1. Establish the brand hierarchy:
   - Master brand: `El Instante del Hombre Gris`
   - Movement/campaign framework: `¡BASTA!`
   - Platform category: `civic intelligence and public design platform`
   - Core products: `Diagnóstico Personal`, `El Mapa`, `Mandato Vivo`, `Círculos`, `Planes Estratégicos`

2. Replace ambiguity with factual press language:
   - Use "platform in active development" where appropriate.
   - Separate "available today" from "planned / in beta / strategic proposal."
   - Add a fact sheet with dates, founder identity, legal status, geography, and contact.

3. Make the visual system match the supplied emblem:
   - The live site uses blue/purple digital glassmorphism, while the supplied logo is metallic gold/silver with a heart at the center. The current press-kit SVG assets use placeholder `HG` marks rather than the actual emblem.
   - The emblem should become the primary symbol; blue/purple should become supporting digital accents, not the core identity.

4. Fix the media download system:
   - Live `/press-kit/*.svg` URLs currently resolve to the SPA HTML shell, not actual asset files.
   - Provide real ZIP/PDF/PNG/SVG downloads and verify them.

5. Add trust signals:
   - Founder name and headshot, team/advisors if any, legal entity status, public code repository link if intended, privacy/data handling summary, methodology notes, contact address, media email, product screenshots, current platform metrics with timestamp.

6. Normalize the claims:
   - Resolved: 22 planes estratégicos (al 23 de abril de 2026), framed as idealized design. Source of truth: `shared/arquitecto-data.ts` (ordinal 1 through 22). `PLANRUTA` is the meta/bootstrap plan and is not counted among the 22.

---

## 2. Brand Audit

### Logo Audit

Observed logo: a circular metallic emblem with a gold outer ring formed by repeated flame, laurel, sun-ray, or saw-tooth arcs; a silver inner cross/mandala/gear-like form; and a heart-shaped cutout at the center. The file is a high-resolution transparent PNG, 3393 x 3393, RGBA.

What it communicates intentionally:
- Transformation under pressure: brushed silver and gold suggest refinement, metallurgy, and Argentina's `argentum`/silver symbolism.
- Movement and ignition: the rotating gold edge reads as flame, sun, crown, or turbine.
- Civic/spiritual center: the heart cutout softens the martial or mechanical geometry and gives the mark a moral center.
- Synthesis: gold and silver, sharp and soft, machine and heart, order and fire.

What it may communicate unintentionally:
- Religious or crusader associations because the inner silver form can read as a cross.
- Esoteric/order symbolism because the emblem has seal-like geometry.
- Weapon/saw associations because the outer ring has blade-like points.
- Premium artifact over civic usability because the metallic rendering is more ceremonial than accessible.

Strengths:
- Highly memorable and ownable.
- Strong symbolic connection to silver, refinement, heat, and heart.
- Works well as a ceremonial mark, seal, app icon, badge, coin, medal, or deck cover.
- More distinctive than the current placeholder `HG` press-kit marks.

Weaknesses:
- Too detailed for small sizes without simplification.
- Metallic texture will not reproduce cleanly in one-color print, embroidery, favicons, low-resolution social avatars, or newspaper usage.
- The current web UI and downloadable assets do not fully express the emblem's gold/silver language.
- There is no observed vector master, flat version, monochrome version, reversed version, or minimum-size rule.

Recommendation:
Create a responsive logo system:
- `Hero emblem`: full metallic PNG for ceremonial use.
- `Flat emblem`: vector simplified gold/silver version for web and print.
- `Mono emblem`: black, white, and silver single-color versions.
- `Small icon`: simplified heart-in-silver-center or circular flame ring with fewer teeth for favicon/social avatars.
- `Wordmark lockup`: emblem + El Instante del Hombre Gris + optional ¡BASTA! endorsement line.

### Website Audit

Observed public positioning:
- The home page frames the project as a citizen-built platform for Argentina: "Votaste. Marchaste. Esperaste. Y todo sigue igual."
- The project says it offers real tools for coordinating direction without depending on a leader, party, or promise.
- The press kit describes the platform as Argentine collective intelligence with personal transformation, civic mapping, live citizen mandates, and strategic country-design plans.
- The site emphasizes "sin líder, sin partido", open/auditable plans, citizen data, and distributed action.

Tone:
- Cinematic, intimate, urgent, philosophical, anti-caudillo, Argentine, rioplatense.
- The voice is strongest when it says: "No es un líder mesiánico. Es alguien común..." and "No pedimos que nos crean; pedimos que lo lean."
- The tone is weakest when it overextends into absolute or unverifiable claims without evidence blocks.

Visual identity:
- Current web system: black base, blue/purple/emerald/amber accents, glass cards, gradients, Playfair Display for editorial titles, Inter for body, JetBrains Mono for codes/data.
- Current logo system: metallic emblem in `logo.png`, but placeholder `HG` assets in press kit.
- Current issue: the site looks like modern civic-tech/dark-mode software; the supplied logo looks like an alchemical civic seal. They can coexist, but the bridge is not yet explicit.

Structure:
- Main navigation: Visión, Hombre Gris, Semilla, Mapa, Mandato, Círculos, Recursos.
- Footer adds Blog, Rutas, Manifiesto, Kit de Prensa, Apoyá.
- Current route structure is rich, but the public information architecture is not optimized for journalists or first-time partners.

Recommended information architecture:
1. Home: what it is, why now, what exists today, primary CTA.
2. Platform: tools, screenshots, live/beta status.
3. Plans: 22 strategic planes (idealized design, al 23 de abril de 2026) with evidence and downloadable docs.
4. Method: design idealizado, intelligence collective, data/auditability.
5. Community: Círculos, participation model, commitments.
6. About: founder, origin story, legal/accountability, contact.
7. Press: media kit, fact sheets, approved assets.
8. Partners: collaboration options, distributors/affiliates if applicable.

### Current Brand Perception

Citizens tired of politics:
- Likely perception: emotionally resonant, energizing, different from party language.
- Risk: if the path to action is not simple, the narrative may feel inspiring but overwhelming.

Journalists:
- Likely perception: a distinctive Argentina civic movement with a strong story hook.
- Risk: insufficient founder/legal facts, broken downloads, and broad claims may reduce coverage confidence.

Partners, NGOs, academics, civic-tech collaborators:
- Likely perception: ambitious civic intelligence platform with serious systems thinking.
- Risk: need clearer methodology, governance, data ethics, partnership model, and product maturity.

Institutions and public-sector audiences:
- Likely perception: potentially useful citizen-signal infrastructure.
- Risk: anti-political language can sound confrontational unless paired with neutral, operational language.

Skeptics:
- Likely perception: mythic, prophetic, possibly esoteric or messianic despite the anti-messianic claim.
- Risk: the brand must repeatedly prove that "Hombre Gris" means distributed responsibility, not a cult of personality.

### Archetype And Positioning

Primary archetype: The Sage/Architect.
Secondary archetypes: The Everyperson, The Creator, The Caregiver, The Rebel.

Personality:
- Lucid, sober, warm, rigorous, anti-tribal, systems-minded, civic, intimate.

Emotional tone:
- "Cansancio convertido en diseño."
- "Bronca disciplinada por amor."
- "Esperanza sin ingenuidad."

Strategic positioning:
El Instante del Hombre Gris is a civic intelligence platform that turns personal awakening and citizen signals into shared maps, auditable plans, and coordinated action for Argentina.

---

## 3. Press Kit Copy

### Company Overview

El Instante del Hombre Gris is an Argentina-born civic intelligence platform and public design project. It helps citizens move from frustration to structured participation through personal diagnostics, civic mapping, live citizen signals, community circles, and strategic plans for national reconstruction.

The platform is associated with the movement framework `¡BASTA!`, which reframes "basta" not as anger alone, but as the moment a person stops waiting for a savior and starts building with others. The project is non-party in its public positioning and emphasizes distributed leadership, open documentation, data visibility, and auditable proposals.

Legal entity, incorporation status, founder full name, headquarters, and launch date: TBC.

### Short Brand Description

Concise:
El Instante del Hombre Gris is a civic intelligence platform for citizens who want to help redesign Argentina with data, values, and coordinated action.

Standard:
El Instante del Hombre Gris is an Argentine civic intelligence platform that turns citizen voices, personal diagnostics, open data, and strategic plans into tools for collective action.

Premium/editorial:
El Instante del Hombre Gris is a platform for the moment after disappointment: when citizens stop waiting for a leader and begin designing, measuring, and building the country they want to live in.

### Medium Brand Description

El Instante del Hombre Gris is an Argentine civic intelligence platform built around the `¡BASTA!` framework. It combines personal transformation tools, a citizen map of dreams, values, needs, commitments, and "bastas", community circles, live civic signals, and strategic plans for national reconstruction. The project rejects the idea of a single savior or caudillo; its premise is that ordinary citizens can generate direction when their lived reality becomes visible, structured, and actionable.

### Long Company Narrative

Argentina has spent decades asking citizens to choose between options designed by others. El Instante del Hombre Gris begins with a different question: what if citizens were not only voters, but designers of the country they want to inhabit?

The project takes its name from the figure of the "Hombre Gris", not as a messianic leader, but as an archetype of ordinary responsibility. The Hombre Gris is the neighbor, parent, teacher, worker, student, engineer, builder, or caregiver who stops delegating conscience and begins to act. "Gris" is not neutrality or weakness; in the project's language, it is synthesis: the refusal to stay trapped in the colors of political polarization.

The platform translates that philosophy into tools. At the personal level, it offers a diagnostic framework across 12 areas of life and 60 dimensions. At the collective level, it allows citizens to make dreams, values, needs, commitments, and limits visible in the territory through El Mapa and related civic-signal tools. At the strategic level, it publishes plans and documents intended to be read, challenged, improved, and audited.

The movement framework is called `¡BASTA!`. It is not positioned as a party or campaign slogan, but as a threshold: the moment a person decides that waiting is no longer enough. The promise is not that one leader will fix Argentina. The promise is that when citizens have better tools, clearer data, stronger principles, and ways to coordinate locally, they can change what is politically possible.

### Founder Bio

Current confirmed public details are limited. The current press-kit page describes the founder as an Argentine industrial engineer, father/family man, and the creator of the platform. His narrative is framed around systems thinking, family responsibility, and years of study connecting Russell Ackoff, Nietzsche, Buckminster Fuller, and the Kybalion.

Publication-ready bio with placeholders:

`[Founder Name]` is the founder of El Instante del Hombre Gris and the creator of the `¡BASTA!` civic intelligence framework. An Argentine industrial engineer and father, he built the platform from a systems-thinking conviction: Argentina's recurring crises are not destiny, but the result of processes that can be redesigned. His work combines civic technology, collective intelligence, personal transformation, public design, and open strategic planning. He does not position himself as a political candidate or caudillo; his stated aim is to build tools that help citizens see, design, demand, and coordinate for themselves.

### Short Founder Bio

`[Founder Name]` is an Argentine industrial engineer, father, and founder of El Instante del Hombre Gris, a civic intelligence platform that helps citizens transform frustration into shared data, strategic design, and coordinated action.

### Boilerplate For Media Use

El Instante del Hombre Gris is an Argentina-born civic intelligence platform associated with the `¡BASTA!` movement framework. The platform combines personal diagnostics, citizen mapping, open data, community coordination, and strategic plans for national reconstruction. Its central premise is that Argentina does not need a new caudillo; it needs citizens with tools to see, design, demand, and build together. Learn more at https://www.elinstantedelhombregris.com.

### Mission

To help citizens transform frustration into responsibility, shared intelligence, and coordinated action through tools that make personal reality, territorial signals, and strategic plans visible and auditable.

### Vision

An Argentina where citizens do not merely choose between predesigned options, but participate in defining the country's direction, measuring what matters, and building systems that produce dignity, trust, and long-term flourishing.

### Core Values

Radical humility:
Lower ego so reality can be seen more clearly.

Distributed leadership:
Build tools that create more leaders, not more followers.

Truth with evidence:
Name problems clearly and support claims with data, sources, and transparent reasoning.

Constructive synthesis:
Move beyond polarizing binaries and combine what works from multiple traditions.

Auditability:
Make plans, assumptions, numbers, and decisions open to inspection.

Service:
Design systems that work so well people can use them without needing a hero.

Amabilidad radical:
Treat dignity, courtesy, and care as civic infrastructure.

### What Makes The Company Different

- It combines movement narrative with actual product surfaces: diagnostics, maps, data, community, and plans.
- It rejects personality-driven politics while using a strong symbolic archetype.
- It frames civic participation as design, not just protest or voting.
- It connects personal transformation to public systems thinking.
- It uses open, auditable strategic documents rather than slogans alone.
- It is native to Argentina's emotional and political context while speaking in the language of modern civic tech.

### Key Products / Services / Capabilities

Observed current or claimed capabilities:
- Personal diagnostic across 12 life areas and 60 dimensions.
- AI coaching and learning tools. Current maturity: TBC.
- El Mapa / La Brújula Soberana: territorial civic signals.
- Mandato Vivo: public/citizen pulse and mandate concept.
- Círculos: community and action spaces.
- Strategic plan library: currently presented as 16 plans on the press-kit page.
- Open/public documents for national reconstruction proposals.
- Press kit and brand resources page. Current downloads need repair.

### Market Focus / Industries Served

Primary:
- Civic technology
- Public innovation
- Collective intelligence
- Community organizing
- Public policy design
- Social impact
- Argentine civic participation

Secondary:
- Education and personal development
- Open data
- Govtech / democratic innovation
- Media and civic storytelling
- Partner and affiliate community networks, if the model is confirmed

### Key Milestones

Use only after confirmation:
- `TBC`: Founder began developing the concept after applying systems thinking to Argentina's recurring institutional failures.
- `TBC`: Manifesto del Hombre Gris published.
- `TBC`: Platform launched publicly at elinstantedelhombregris.com.
- `TBC`: Personal diagnostic and civic participation tools released.
- `TBC`: El Mapa / La Brújula Soberana released.
- `TBC`: Strategic plan library of 22 planes estratégicos (idealized design, al 23 de abril de 2026) published.
- `TBC`: Press kit and media resources released.

### Brand Story

The brand begins with a refusal: enough waiting, enough outsourcing responsibility, enough pretending that a different leader alone will solve a design problem. In the language of the project, "El Instante" is the moment a person can no longer return to passive citizenship.

The "Hombre Gris" is not a single man. It is the ordinary citizen who has stepped out of the false colors of polarization. The grey is silver: refined by heat, reflective, grounded, and connected to Argentina's own name. At the center of the emblem is a heart, because the project insists that civic reconstruction cannot be only technical. It has to be humane.

`¡BASTA!` is the operational frame of that awakening. It turns the private feeling of "enough" into public tools: maps, commitments, data, plans, circles, and shared language. The story is not "follow us." The story is "see clearly, take responsibility, and help build."

### About Us For Website

El Instante del Hombre Gris is a platform for citizens who are done waiting.

We build tools for personal clarity, collective intelligence, and public design: diagnostics, maps, community spaces, civic signals, and strategic plans that can be read, challenged, improved, and audited.

The movement framework is called `¡BASTA!`. Not as a shout of rage, but as the quiet moment when a person decides to stop delegating responsibility. We do not believe Argentina needs another savior. We believe it needs citizens with better tools, better data, and the courage to build together.

### About Us For Press / Media

El Instante del Hombre Gris is an Argentine civic intelligence platform associated with the `¡BASTA!` framework. The platform combines personal diagnostics, citizen mapping, live civic signals, community coordination, and strategic plans for national reconstruction. Its core idea is that Argentina's future should not be designed only by political elites or charismatic leaders; it should be shaped by citizens whose lived realities become visible, structured, and actionable.

### About Us For Decks

El Instante del Hombre Gris helps citizens turn frustration into shared intelligence and coordinated action.

Platform layers:
- Personal clarity: diagnostics and learning.
- Collective intelligence: maps, signals, commitments, and mandates.
- Strategic design: open plans for national reconstruction.
- Community action: circles and partner networks.

Core belief:
Argentina does not need another caudillo. It needs citizens with tools to see, design, demand, and build.

### FAQ For Media And Partners

What is El Instante del Hombre Gris?
It is an Argentine civic intelligence platform and public design project that helps citizens participate through diagnostics, maps, open data, community tools, and strategic plans.

Is it a political party?
The current public positioning says no. It presents itself as non-party civic infrastructure. Legal/political registration status should be confirmed before publication.

Who is the Hombre Gris?
In this brand, the Hombre Gris is not a messianic leader. It is an archetype of ordinary citizens who stop waiting and start building.

What is ¡BASTA!?
`¡BASTA!` is the movement framework: the moment of civic threshold when frustration becomes responsibility and action.

What exists today?
Observed: a live website, manifesto/philosophy pages, map and mandate concepts, community/resources sections, public plan documents, and a press-kit page. Exact feature maturity should be labeled page by page.

How many strategic plans are there?
Resolved: 22 planes estratégicos (al 23 de abril de 2026), framed as idealized design. Source of truth: `shared/arquitecto-data.ts` (ordinal 1 through 22). `PLANRUTA` is the meta/bootstrap plan and is not counted among the 22.

Is the code open source?
The site copy references public/open code in places. Add the actual repository URL before making this claim in press materials.

Who founded it?
The current site describes the founder as an Argentine industrial engineer and father. Full name, headshot, and formal biography are needed for press readiness.

How can journalists contact the team?
Use `prensa@elinstantedelhombregris.com` if active and monitored. Add response time and backup contact.

### Suggested Pull Quotes

"Argentina does not need another savior. It needs citizens with tools."

"The point is not to follow the Hombre Gris. The point is to become responsible for what only citizens can build."

"Frustration is raw energy. The work is turning it into maps, plans, commitments, and measurable action."

"We are not asking people to believe a slogan. We are asking them to read, verify, contribute, and improve the design."

"The future of a country should not be limited to the options designed by others."

### Suggested Company Fact Sheet

Name:
El Instante del Hombre Gris

Movement framework:
¡BASTA!

Category:
Civic intelligence platform / public design project

Country:
Argentina

Website:
https://www.elinstantedelhombregris.com

Press contact:
prensa@elinstantedelhombregris.com

Founder:
`[Founder Name]`, TBC

Legal entity:
TBC

Core capabilities:
Personal diagnostics, civic mapping, live citizen signals, community circles, strategic plans, open documents.

Current plan count:
22 planes estratégicos (al 23 de abril de 2026), framed as idealized design. Source of truth: `shared/arquitecto-data.ts`.

Languages:
Spanish currently observed. English media kit recommended.

### Suggested Executive Fact Sheet

Name:
`[Founder Name]`

Role:
Founder, El Instante del Hombre Gris / creator of the ¡BASTA! framework.

Location:
Argentina, exact city TBC.

Background:
Industrial engineer; father/family man; systems-thinking orientation.

Core topics:
Civic intelligence, systems redesign, distributed leadership, public design, Argentina, open strategic planning, personal responsibility and collective action.

Speaking formats:
Podcast interview, civic-tech panel, public innovation event, university talk, partner briefing, community workshop.

Media needs:
Approved headshot, short/long bio, pronunciation guide, social links, interview topics, prior talks/publications if any.

### Speaking Introduction

Today we are joined by `[Founder Name]`, founder of El Instante del Hombre Gris, an Argentine civic intelligence platform built around the `¡BASTA!` framework. His work asks a direct question: what happens when citizens stop waiting for a savior and begin designing the country they want to live in? Through personal diagnostics, civic maps, citizen signals, community tools, and open strategic plans, El Instante del Hombre Gris is exploring a new model of distributed civic action in Argentina.

### One-Paragraph Intro For Email Outreach

I wanted to introduce El Instante del Hombre Gris, an Argentine civic intelligence platform built around the `¡BASTA!` framework. It combines personal diagnostics, citizen mapping, community coordination, live civic signals, and open strategic plans to help people move from frustration to structured participation. The project is explicitly anti-caudillo: it does not ask people to follow a leader, but to see, design, demand, and build together.

### Partnership Description

El Instante del Hombre Gris partners with aligned organizations, communities, educators, civic innovators, media projects, and local leaders who want to help citizens turn lived experience into shared intelligence and constructive action. Potential collaboration areas include civic workshops, data visualization, community circles, educational content, local mapping, plan review, public events, and distribution of approved resources.

### Distributor / Reseller / Affiliate Language

Use only if a partner/distribution model is confirmed:

Approved partners may share El Instante del Hombre Gris resources, invite communities into platform tools, host local circles, distribute educational materials, and refer users to official platform experiences. Partners must use approved brand assets, avoid presenting themselves as the official organization unless authorized, and clearly credit El Instante del Hombre Gris / ¡BASTA! as the source of the framework and materials.

---

## 4. Brand Design System

### Brand Essence

Responsible awakening becomes civic infrastructure.

### Positioning Statement

For Argentine citizens, communities, journalists, and partners who are tired of politics as spectacle, El Instante del Hombre Gris is a civic intelligence platform that turns personal clarity and citizen signals into maps, plans, mandates, and coordinated action, without depending on a caudillo or party apparatus.

### Messaging Pillars

1. Stop waiting:
Citizens are not spectators of national decline.

2. See clearly:
Personal and territorial reality must become visible before it can be changed.

3. Design together:
The country should be designed from lived experience, not only from elite abstractions.

4. Make it auditable:
Plans, data, assumptions, and progress must be open to challenge.

5. Build without caudillos:
The work is distributed leadership, not personality worship.

### Brand Voice Guidelines

Voice attributes:
- Clear, Argentine, direct, intimate, sober, systems-minded, warm.
- Uses "vos" in public/community copy.
- Uses rigorous neutral language in press, partner, and institutional materials.
- Balances poetic force with evidence.

Do:
- Say what exists and what is still in development.
- Use concrete nouns: map, plan, signal, diagnostic, circle, data, commitment.
- Pair emotional lines with operational proof.
- Use short memorable sentences for emphasis.
- Invite verification.

Don't:
- Overclaim impact without numbers and sources.
- Sound like a party slogan.
- Let prophecy become the lead for institutional audiences.
- Use "leader", "salvation", or "movement" without clarifying distributed responsibility.
- Use "open source" unless the repo link is public.

### Visual Identity Interpretation

The logo says "civic seal refined by fire." The website currently says "dark-mode civic technology." The unified system should combine both:
- Metallic emblem as the ceremonial and symbolic anchor.
- Dark charcoal field for seriousness and focus.
- Silver for Argentina, clarity, reflection, and the Hombre Gris.
- Gold for refinement, commitment, excellence, and warmth.
- Blue/cyan as the digital trust/data layer.
- Purple only as a restrained philosophical or transitional accent.

### Color Palette Recommendations

Core:
- Charcoal: `#0A0A0A` - primary background.
- Graphite: `#171A20` - panels and deep surfaces.
- Argentina Silver: `#C8CDD2` - emblem, headlines, dividers.
- Refined Gold: `#C8A64A` - emblem, highlight, premium accent.
- Warm Gold Shadow: `#8A6A24` - depth, borders, ceremonial accents.
- White: `#F8FAFC` - high-contrast text.

Digital support:
- Civic Blue: `#2F6FDB` - links, primary UI action.
- Signal Cyan: `#4DB6C8` - data/live indicators.
- Mandate Red: `#C0392B` - use only for `¡BASTA!`, warnings, strong civic threshold.
- Deep Violet: `#6D5BD0` - secondary philosophical accent; reduce dominance.

### Typography Recommendations

Keep current web fonts, with clearer roles:
- Playfair Display: editorial titles, manifesto moments, hero lines.
- Inter: body copy, UI, press pages, partner pages.
- JetBrains Mono: plan codes, data labels, timestamps, technical evidence.

Press-friendly fallback:
- Titles: Georgia.
- Body: Arial or Helvetica.
- Data: Courier New or system mono.

### Layout / Style Recommendations

- Keep the dark cinematic system, but reduce decorative gradients where information density matters.
- Use unframed sections for narrative and cards only for repeated assets/resources.
- Build a press page with white/light sections available for journalists who need clean copy.
- Add "status labels" to features: Live, Beta, In development, Strategic proposal.
- Make each plan card include code, title, one-line problem, status, last updated date, download.
- Use the metallic emblem in hero, press kit, social cards, and deck covers.

### Image Style Recommendations

Use:
- Real Argentine places, classrooms, workshops, neighborhoods, maps, people in collaborative settings.
- Screenshots of actual tools.
- Process images: planning walls, notebooks, data dashboards, local circles.
- Warm, natural light with documentary realism.

Avoid:
- Generic protest crowds.
- Apocalyptic city imagery.
- Abstract AI or blockchain stock visuals.
- Dark anonymous silhouettes that make the project feel conspiratorial.

### Iconography Guidance

- Continue using line icons such as Lucide for UI consistency.
- Use icons only as navigation aids, not as replacement for evidence.
- Preferred categories: map, compass, heart, file, shield-check, network, users, scales, seed, data chart.
- Maintain one stroke weight and one corner style.

### Logo Usage Guidance

Primary use:
- Metallic emblem on charcoal, white, or transparent background.

Secondary use:
- Flat emblem in silver/gold for small UI and print.

Minimum sizes:
- Metallic emblem: no smaller than 96 px digital.
- Flat emblem: 32 px minimum if simplified.
- Wordmark lockup: 180 px minimum width digital.

Clear space:
- Minimum clear space equals the radius of the central heart cutout or 12.5% of logo width, whichever is larger.

Backgrounds:
- Preferred: charcoal, white, soft silver, or uncluttered photo with dark overlay.
- Avoid: busy textures, low-contrast gold backgrounds, saturated blue/purple gradients behind the metallic logo.

Wrong usage examples:
- Do not stretch or crop the emblem.
- Do not place metallic logo over complex images without contrast.
- Do not recolor the gold ring purple or blue.
- Do not use the placeholder `HG` SVG as the official logo if the emblem is the brand mark.
- Do not add shadows/glows that obscure the heart.
- Do not use the detailed metallic emblem as tiny favicon without simplification.

### Web-Friendly And Press-Friendly Usage Rules

Web:
- Use SVG/flat logo for UI, PNG metallic emblem for hero moments.
- Use compressed transparent PNG at 512, 1024, and 2048 px.
- Provide accessible alt text: "El Instante del Hombre Gris emblem."

Press:
- Provide 300 DPI PNG and vector PDF/SVG/EPS.
- Include light/dark background versions.
- Include a one-page logo usage PDF.

### Social Media Style Direction

- Avatar: simplified emblem or heart-centered silver/gold mark.
- Header: emblem plus short line: "Ciudadanos con herramientas para diseñar Argentina."
- Posts: black/graphite base, silver/gold title, blue/cyan data accents.
- Use fewer manifesto-only posts; balance with screenshots, facts, plan excerpts, and practical calls to action.

### Presentation / Deck Style Direction

- Cover: metallic emblem large, title in Playfair/Georgia, dark charcoal background.
- Section dividers: one emblem detail or gold/silver line.
- Content slides: white or charcoal depending on audience; use tables for facts and statuses.
- Every proposal slide should include: problem, evidence, design response, current status, next action.

---

## 5. Website-Ready Copy

### Press Page Copy

Hero:
Press and media resources

Subcopy:
Approved descriptions, fact sheets, logos, images, screenshots, and contact information for journalists, partners, event organizers, and collaborators covering El Instante del Hombre Gris and the `¡BASTA!` framework.

Primary CTA:
Download media kit

Secondary CTA:
Contact press team

Intro:
El Instante del Hombre Gris is an Argentine civic intelligence platform that helps citizens turn frustration into shared data, strategic design, and coordinated action. This page contains approved language and assets for accurate coverage.

### Media Kit Page Copy

Use these descriptions when you need to explain the project quickly and accurately. For longer coverage, please refer to the fact sheet, founder bio, screenshots, and approved pull quotes.

Status note:
Some platform features are live, some are in active development, and some are strategic proposals. Please use the status labels in the fact sheet when describing product availability.

### Brand Assets Page Copy

These assets are approved for editorial, partner, event, and community use. Please do not alter the logo, recolor the emblem, crop it, add effects, or use outdated placeholder marks. When in doubt, use the primary logo pack.

### Download Center Copy

Download official assets:
- Logo pack
- Brand guidelines
- Company fact sheet
- Founder bio
- Platform screenshots
- Strategic plan overview
- Press release archive

If you need a custom format, email `prensa@elinstantedelhombregris.com`.

### Partner Resources Page Copy

Partner resources are for organizations, communities, educators, media projects, and local leaders who want to introduce El Instante del Hombre Gris responsibly.

Partners may share approved resources, host conversations, invite people into official platform tools, and coordinate local circles. Partners should not present themselves as the official organization unless explicitly authorized.

### Boilerplate Footer Copy

El Instante del Hombre Gris is a civic intelligence platform for citizens who want to help redesign Argentina through personal clarity, shared data, strategic plans, and coordinated action.

### Metadata / Directory Listing

El Instante del Hombre Gris is an Argentine civic intelligence platform that turns citizen voices, personal diagnostics, open data, maps, and strategic plans into tools for collective action.

### Social Bios

X:
Civic intelligence for Argentina. Maps, plans, data, and action. No caudillos: citizens with tools. #BASTA

LinkedIn:
El Instante del Hombre Gris is an Argentine civic intelligence platform helping citizens transform frustration into shared data, strategic design, and coordinated action.

Instagram:
Ciudadanos con herramientas para ver, diseñar y construir Argentina. Diagnóstico, mapas, planes y acción. El instante es ahora.

Facebook:
El Instante del Hombre Gris es una plataforma argentina de inteligencia cívica para transformar frustración en datos, diseño estratégico y acción coordinada.

### Email Signature

`[Name]`
`[Role]`
El Instante del Hombre Gris / ¡BASTA!
`[email]`
https://www.elinstantedelhombregris.com

Tagline:
Ciudadanos con herramientas para diseñar Argentina.

### Website CTA Suggestions

- Ver la plataforma
- Explorar El Mapa
- Leer los planes estratégicos
- Hacer mi diagnóstico
- Sumarse a un círculo
- Descargar kit de prensa
- Proponer una alianza
- Ver qué está activo hoy

### Download Instructions For Media Users

Use the logo files provided in the official logo pack. Use PNG for web and broadcast, SVG/PDF/EPS for print or design work. Include the company name as `El Instante del Hombre Gris`. When referring to the movement framework, write `¡BASTA!` with opening and closing exclamation marks.

### Terms Of Use For Brand Assets

You may use approved brand assets for editorial coverage, event promotion, partner announcements, and accurate public reference to El Instante del Hombre Gris. You may not imply endorsement, alter the logo, use the assets in misleading political advertising, sell the assets, or present modified versions as official.

### Credit / Reference Instructions

Preferred first reference:
El Instante del Hombre Gris, the Argentine civic intelligence platform associated with the `¡BASTA!` framework.

Short reference:
El Instante del Hombre Gris

Movement reference:
`¡BASTA!`

Avoid:
Calling the project a political party unless confirmed.
Calling the Hombre Gris a single messianic leader.
Using "HG" as the public brand name unless approved.

---

## 6. Shareable Media Resources

### Press Release Template

Headline:
El Instante del Hombre Gris Announces `[Announcement]`

Subheadline:
The Argentine civic intelligence platform expands tools for citizens to turn frustration into shared data, strategic design, and coordinated action.

Dateline:
`[City, Argentina] - [Date]`

Body:
El Instante del Hombre Gris today announced `[announcement]`, a new step in its effort to help citizens participate in the design of Argentina's future through personal diagnostics, civic mapping, open data, community coordination, and strategic plans.

"`[Quote]`," said `[Founder Name]`, founder of El Instante del Hombre Gris. "`[Second sentence connecting announcement to mission]`."

`[Add 2-3 paragraphs: what launched, why it matters, who it serves, what exists now, how to access it.]`

About:
`[Use boilerplate]`

Media contact:
`prensa@elinstantedelhombregris.com`

### Product Launch Announcement Template

El Instante del Hombre Gris launches `[Product Name]`, a new tool that helps citizens `[function]`. The tool is part of the `¡BASTA!` framework, which turns personal clarity, citizen signals, and strategic plans into coordinated civic action. `[Product Name]` is available at `[URL]` and is currently `[Live/Beta/In development]`.

### Partnership Announcement Template

El Instante del Hombre Gris and `[Partner]` announce a collaboration to `[purpose]`. The partnership will focus on `[workshops/data/community/education/media/local circles]`, helping more citizens turn lived experience into shared intelligence and constructive action.

### Event Participation Announcement Template

El Instante del Hombre Gris will participate in `[Event]` on `[Date]`, where `[Founder/Speaker]` will discuss `[topic]`. The session will explore how civic intelligence, open data, and distributed leadership can help citizens move beyond frustration and into public design.

### Award / Milestone Announcement Template

El Instante del Hombre Gris has reached `[milestone]`, marking a new stage in the development of the `¡BASTA!` civic intelligence framework. The milestone reflects growing public interest in tools that help citizens map reality, coordinate action, and engage with auditable strategic plans.

### Media Outreach Email Template

Subject:
Story idea: Argentine civic platform turns frustration into citizen intelligence

Hi `[Name]`,

I wanted to share El Instante del Hombre Gris, an Argentine civic intelligence platform built around the `¡BASTA!` framework. It is not a party or candidate project; it is a platform that helps citizens turn personal reality, territorial signals, and strategic plans into shared public intelligence.

The story angle: after years of political exhaustion, a growing civic project is asking whether citizens can move from choosing between options designed by others to helping design the country's direction themselves.

Useful links:
- Website: https://www.elinstantedelhombregris.com
- Press kit: `[URL]`
- Founder bio: `[URL]`

Would you be open to a short briefing or interview?

Best,
`[Name]`

### Journalist Reply Template

Hi `[Name]`,

Thanks for reaching out. The cleanest description is:

El Instante del Hombre Gris is an Argentine civic intelligence platform that helps citizens transform frustration into shared data, strategic design, and coordinated action.

A few important clarifications:
- It is publicly positioned as non-party civic infrastructure.
- "Hombre Gris" refers to ordinary citizens taking responsibility, not a single messianic leader.
- Some tools are live, some are in active development, and some are strategic proposals.

I am attaching the fact sheet, founder bio, approved logos, and screenshots. Happy to coordinate an interview.

### Speaker One-Sheet Structure

Title:
`[Founder Name]` - Founder, El Instante del Hombre Gris

Topics:
- Civic intelligence after political exhaustion
- Why Argentina needs tools, not caudillos
- Turning citizen signals into public design
- Distributed leadership and the future of civic action
- Designing systems that produce dignity

Includes:
Bio, headshot, talk descriptions, sample questions, media links, technical requirements, contact.

### Distributor One-Sheet Structure

Use only if distribution model is confirmed.

Sections:
- What the platform is
- Who it is for
- What partners may distribute
- Approved language
- Brand usage rules
- Referral/tracking process
- Compliance and ethics rules
- Contact and support

### Partner One-Sheet Structure

Sections:
- Partnership purpose
- Collaboration options
- Audience served
- What El Instante provides
- What partners provide
- Approved communications
- Data/privacy expectations
- Next steps

### Investor-Facing Company Snapshot

Use only if fundraising is planned.

El Instante del Hombre Gris is an Argentina-born civic intelligence platform at the intersection of civic tech, collective intelligence, open data, community coordination, and public design. It is building tools that help citizens convert personal and territorial signals into structured civic intelligence, strategic plans, and coordinated action. Current status, legal entity, traction metrics, business model, funding needs, team, and governance require confirmation before investor use.

### Public-Facing Company Snapshot

El Instante del Hombre Gris helps citizens stop waiting and start building. Through diagnostics, maps, community tools, civic signals, and open plans, the platform gives people a way to make their reality visible and participate in designing Argentina's future.

---

## 7. Recommended Download Assets

| Filename | Purpose | For Whom | Format | Contents |
|---|---|---|---|---|
| `el-instante-logo-pack.zip` | Complete official logo set | Press, partners, designers | ZIP | Metallic PNG, flat SVG, mono SVG, reversed logo, wordmark lockups |
| `el-instante-logo-primary.svg` | Scalable primary logo | Designers, web teams | SVG | Flat emblem + wordmark |
| `el-instante-logo-primary-transparent.png` | Web-ready transparent logo | Media, partners | PNG | 512, 1024, 2048 px transparent |
| `el-instante-logo-metallic-hero.png` | Ceremonial/high-impact mark | Decks, articles | PNG | High-res supplied metallic emblem, optimized |
| `el-instante-logo-mono-black.svg` | One-color print use | Press, print vendors | SVG | Black logo |
| `el-instante-logo-mono-white.svg` | Reversed one-color use | Event/deck designers | SVG | White logo |
| `el-instante-favicon-pack.zip` | Browser/app icons | Web developers | ZIP | favicon.ico, SVG, 16/32/48/180/192/512 PNG |
| `el-instante-social-icon-pack.zip` | Social avatars | Social/media teams | ZIP | Square simplified emblem for X, LinkedIn, Instagram, Facebook, YouTube |
| `el-instante-brand-guidelines.pdf` | Brand rules | Press, partners, designers | PDF | Logo, colors, type, voice, usage, credit rules |
| `el-instante-company-overview.pdf` | Fast project overview | Journalists, partners | PDF | One-page description, tools, status, contact |
| `el-instante-media-fact-sheet.pdf` | Verified facts | Journalists | PDF | Fact sheet, current metrics, dates, contact, legal info |
| `el-instante-founder-bio.pdf` | Founder profile | Journalists, event hosts | PDF | Short/long bio, headshot, speaker topics |
| `el-instante-founder-headshots.zip` | Founder imagery | Press/events | ZIP | Horizontal, vertical, square, color, B&W |
| `el-instante-team-photos.zip` | Human trust assets | Press/partners | ZIP | Team/community images with captions |
| `el-instante-platform-screenshots.zip` | Product proof | Journalists, partners | ZIP | Home, diagnostic, map, mandate, circles, plans |
| `el-instante-product-mockups.zip` | Approved visuals | Media, decks | ZIP | Device mockups, screenshots, caption files |
| `el-instante-process-images.zip` | Documentary proof | Press, social | ZIP | Workshops, planning, community, maps, process |
| `el-instante-strategic-plans-overview.pdf` | Plan library overview | Partners, journalists | PDF | Plan list, codes, one-line summaries, status |
| `el-instante-presentation-deck.pdf` | Shareable intro | Partners, events | PDF | 10-15 slide deck |
| `el-instante-speaker-one-sheet.pdf` | Event booking | Podcasts, organizers | PDF | Bio, topics, intro, headshot, contact |
| `el-instante-partner-one-sheet.pdf` | Partnership intake | Collaborators | PDF | Collaboration options, rules, next steps |
| `el-instante-distributor-one-sheet.pdf` | Distribution model | Affiliates/resellers | PDF | Only if model is confirmed |
| `el-instante-press-release-archive.zip` | Historical media | Journalists | ZIP/PDF | Dated press releases |
| `el-instante-approved-quotes.txt` | Fast quoting | Journalists/social team | TXT/PDF | Pull quotes and attribution |
| `el-instante-boilerplates.txt` | Copy/paste descriptions | Media/partners | TXT/PDF | One-line, short, medium, long descriptions |

---

## 8. Missing Assets / Priority Next Steps

### Critical

1. Fix broken press-kit downloads.
Current `/press-kit/logo-principal.svg` and related live URLs return HTML instead of SVG assets. In the repo, press-kit files are under `SocialJusticeHub/public/press-kit`, but Vite's public root is `SocialJusticeHub/client/public`. Move assets to `SocialJusticeHub/client/public/press-kit` or configure `publicDir`, then redeploy and verify content types.

2. Replace placeholder press-kit logos.
Current press-kit SVGs use an `HG` placeholder mark and blue/purple gradients. They do not match the supplied metallic emblem. Create official logo assets from `Logo.png`.

3. Confirm founder identity and legal accountability.
Add founder full name, approved bio, headshot, role, city/country, legal entity status, and contact. Anonymous/unnamed founder language is a barrier for journalists and partners.

4. Resolve plan-count inconsistency.
Resolved: 22 planes estratégicos (al 23 de abril de 2026), framed as idealized design. Sourced from `shared/arquitecto-data.ts`.

5. Separate live features from in-development concepts.
Add status badges across press and platform pages: Live, Beta, In development, Strategic proposal.

6. Add evidence and source discipline.
Claims about plan costs, ROI, public statistics, code openness, and platform stats need sources, timestamps, and links.

### High Priority

7. Add an official downloadable brand guidelines PDF.
Include logo usage, colors, typography, voice, and legal use terms.

8. Add media fact sheet and founder fact sheet PDFs.
Journalists need fast, verified details.

9. Add approved screenshots and product captions.
Press needs visual proof of the platform, not only copy.

10. Add real social cards using the emblem.
Current social-card assets are placeholder `HG` cards and are not deployed correctly.

11. Add separate legal pages.
Footer links Privacy, Terms, and Cookies all point to the privacy route. Create separate terms and cookies pages.

12. Make newsletter form operational or remove it.
Footer newsletter submit handler currently does not perform an observed subscription action.

13. Add partner inquiry path.
Create a clear partner page/form with collaboration categories and response expectations.

14. Add data ethics / privacy summary.
Because the platform maps citizen dreams, values, needs, location, and commitments, explain data collection, consent, anonymization, moderation, and deletion.

15. Add public repository link if "open code" remains a claim.
If code is not public, change language to "public documents" or "transparent methodology" instead of "open source."

### Design / Messaging

16. Unify visual language around gold/silver/charcoal.
Keep blue/cyan for data and actions. Reduce purple as dominant brand color unless intentionally retained as a philosophical accent.

17. Simplify first-time explanation.
Add a "What exists today" section on the home page with five concrete modules and status.

18. Clarify naming hierarchy.
Do not make users infer the relationship between El Instante del Hombre Gris, ¡BASTA!, Hombre Gris, and the named modules.

19. Reduce potential cult/esoteric misread.
Keep the prophecy origin as part of the story, but lead institutional/press materials with civic infrastructure, data, plans, and distributed leadership.

20. Build an English media kit.
Useful for international civic-tech, democracy innovation, and Argentina-focused coverage.

21. Add trust signals.
Possible signals: advisory board, methodology reviewers, GitHub/public docs, update log, partner logos, community stats with timestamps, media mentions, code/document license, moderation policy.

22. Create a one-page "How to describe us" guide.
Include approved and disapproved terms:
- Approved: civic intelligence platform, public design project, citizen signal infrastructure.
- Avoid unless confirmed: political party, campaign, candidate platform, prophecy movement, think tank, NGO, startup.

### Suggested Next Implementation Order

1. Fix asset serving and replace placeholder press-kit assets.
2. Publish a verified fact sheet.
3. Add founder identity/headshot and media contact confirmation.
4. Add platform status labels.
5. Create downloadable PDF kit.
6. Redesign press page around copy, facts, assets, screenshots, and contact.
7. Create partner page and inquiry workflow.
8. Add English press summary.

