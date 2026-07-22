// ---------------------------------------------------------------------------
// Demo seed data. Everything here is clearly fictional — brand names are
// invented (not real companies), contact names/emails/phone numbers are
// synthetic, and two entries are deliberately whimsical/fictional to make
// that obvious at a glance ("Meridian & Vine" mascot brand, "Loop City FC").
// This is the ONLY module that manufactures demo content; storage.ts calls
// seedDatabase() exactly once, on first load / reset.
// ---------------------------------------------------------------------------
import type {
  Activity,
  Company,
  CompanyIntelligence,
  Contact,
  DailyProgress,
  IntegrationEvent,
  Message,
  Production,
  Recommendation,
  Relationship,
  RelationshipAsset,
  RelationshipMemory,
  RelationshipProductionMatch,
  ScoreSnapshot,
  Task,
} from "@/types";

const iso = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

// --- Companies --------------------------------------------------------
export const companies: Company[] = [
  { id: "co_northlight", name: "Northlight Studios", domain: "northlightstudios.com", industry: "Film & TV Production", hqCity: "Los Angeles", size: "201-1000", website: "https://northlightstudios.com", createdAt: iso(240), updatedAt: iso(2) },
  { id: "co_meridian", name: "Meridian Streaming", domain: "meridianstream.tv", industry: "Streaming Platform", hqCity: "New York", size: "1000+", website: "https://meridianstream.tv", createdAt: iso(210), updatedAt: iso(5) },
  { id: "co_harbor", name: "Harbor & Co. Talent", domain: "harborandco.com", industry: "Talent Agency", hqCity: "Los Angeles", size: "51-200", createdAt: iso(300), updatedAt: iso(9) },
  { id: "co_pinecrest", name: "Pinecrest Brand Partners", domain: "pinecrestbrand.com", industry: "Brand Marketing Agency", hqCity: "Chicago", size: "51-200", createdAt: iso(180), updatedAt: iso(14) },
  { id: "co_altitude", name: "Altitude Sports Network", domain: "altitudesports.net", industry: "Sports Media", hqCity: "Denver", size: "201-1000", createdAt: iso(160), updatedAt: iso(3) },
  { id: "co_lumen", name: "Lumen Post & VFX", domain: "lumenvfx.com", industry: "Post-Production / VFX", hqCity: "Vancouver", size: "51-200", createdAt: iso(140), updatedAt: iso(20) },
  { id: "co_wavelength", name: "Wavelength Records", domain: "wavelengthrecords.com", industry: "Music Label", hqCity: "Nashville", size: "11-50", createdAt: iso(120), updatedAt: iso(30) },
  { id: "co_driftwood", name: "Driftwood Documentary Collective", domain: "driftwooddocs.org", industry: "Documentary Production", hqCity: "Austin", size: "1-10", createdAt: iso(95), updatedAt: iso(40) },
  { id: "co_summit", name: "Summit Ridge Capital", domain: "summitridgecap.com", industry: "Media Investment", hqCity: "San Francisco", size: "11-50", createdAt: iso(260), updatedAt: iso(60) },
  { id: "co_cascade", name: "Cascade Casting", domain: "cascadecasting.com", industry: "Casting Agency", hqCity: "Los Angeles", size: "11-50", createdAt: iso(70), updatedAt: iso(7) },
  { id: "co_ironwood", name: "Ironwood Distribution", domain: "ironwooddist.com", industry: "Film Distribution", hqCity: "Toronto", size: "201-1000", createdAt: iso(330), updatedAt: iso(100) },
  { id: "co_brightline", name: "Brightline PR", domain: "brightlinepr.com", industry: "Public Relations", hqCity: "Los Angeles", size: "11-50", createdAt: iso(50), updatedAt: iso(1) },
  // Deliberately fictional / whimsical, per spec:
  { id: "co_meridianvine", name: "Meridian & Vine Mascot Works", domain: "meridianvine.fun", industry: "Costumed Mascot Talent (fictional)", hqCity: "Loop City", size: "1-10", createdAt: iso(400), updatedAt: iso(365) },
  { id: "co_loopcityfc", name: "Loop City FC", domain: "loopcityfc.fake", industry: "Fictional Minor-League Sports Club", hqCity: "Loop City", size: "11-50", createdAt: iso(400), updatedAt: iso(365) },
];

// --- Contacts -----------------------------------------------------------
export const contacts: Contact[] = [
  { id: "ct_dana", companyId: "co_northlight", firstName: "Dana", lastName: "Whitfield", title: "VP, Development", email: "dana.whitfield@northlightstudios.com", phone: "(310) 555-0142", linkedinUrl: "https://linkedin.com/in/danawhitfield", createdAt: iso(240), updatedAt: iso(2) },
  { id: "ct_marcus", companyId: "co_meridian", firstName: "Marcus", lastName: "Oyelaran", title: "Director, Content Acquisition", email: "marcus.oyelaran@meridianstream.tv", phone: "(212) 555-0199", createdAt: iso(210), updatedAt: iso(5) },
  { id: "ct_priya", companyId: "co_harbor", firstName: "Priya", lastName: "Chandrasekar", title: "Senior Agent", email: "priya.c@harborandco.com", createdAt: iso(300), updatedAt: iso(9) },
  { id: "ct_tom", companyId: "co_pinecrest", firstName: "Tom", lastName: "Deacon", title: "Partner", email: "tom.deacon@pinecrestbrand.com", createdAt: iso(180), updatedAt: iso(14) },
  { id: "ct_renee", companyId: "co_altitude", firstName: "Renee", lastName: "Kowalski", title: "Head of Original Programming", email: "renee.kowalski@altitudesports.net", createdAt: iso(160), updatedAt: iso(3) },
  { id: "ct_hyun", companyId: "co_lumen", firstName: "Hyun-woo", lastName: "Baek", title: "VFX Supervisor", email: "hyunwoo.baek@lumenvfx.com", createdAt: iso(140), updatedAt: iso(20) },
  { id: "ct_lena", companyId: "co_wavelength", firstName: "Lena", lastName: "Ostrowski", title: "A&R Director", email: "lena.ostrowski@wavelengthrecords.com", createdAt: iso(120), updatedAt: iso(30) },
  { id: "ct_arjun", companyId: "co_driftwood", firstName: "Arjun", lastName: "Mehta", title: "Founder / Director", email: "arjun@driftwooddocs.org", createdAt: iso(95), updatedAt: iso(40) },
  { id: "ct_sofia", companyId: "co_summit", firstName: "Sofia", lastName: "Reyes-Lindqvist", title: "Principal", email: "sofia@summitridgecap.com", createdAt: iso(260), updatedAt: iso(60) },
  { id: "ct_ben", companyId: "co_cascade", firstName: "Ben", lastName: "Okafor", title: "Casting Director", email: "ben.okafor@cascadecasting.com", createdAt: iso(70), updatedAt: iso(7) },
  { id: "ct_grace", companyId: "co_ironwood", firstName: "Grace", lastName: "Tremblay", title: "VP, Acquisitions", email: "grace.tremblay@ironwooddist.com", createdAt: iso(330), updatedAt: iso(100) },
  { id: "ct_will", companyId: "co_brightline", firstName: "Will", lastName: "Ferraro", title: "Account Director", email: "will.ferraro@brightlinepr.com", createdAt: iso(50), updatedAt: iso(1) },
  { id: "ct_mascot", companyId: "co_meridianvine", firstName: "Chester", lastName: "Vinewood", title: "Head Mascot & Vibes Officer (fictional)", email: "chester@meridianvine.fun", createdAt: iso(400), updatedAt: iso(365) },
  { id: "ct_coach", companyId: "co_loopcityfc", firstName: "Pat", lastName: "Fizzlebee", title: "Assistant Coach (fictional)", email: "pat.fizzlebee@loopcityfc.fake", createdAt: iso(400), updatedAt: iso(365) },
];

// --- Relationships (scores computed by scoring engine at runtime from
// activities/memories; seeded score/momentum here reflects a plausible
// resting state consistent with the seeded activity history below) --------
export const relationships: Relationship[] = [
  { id: "rel_dana", contactId: "ct_dana", companyId: "co_northlight", source: "Warm Intro", stage: "Active Client", momentum: "Accelerating", score: 92, priorityScore: 18, ownerName: "Mike Flores", tags: ["decision-maker", "priority"], lastContactedAt: iso(2), nextFollowUpAt: iso(-3), createdAt: iso(240), updatedAt: iso(2) },
  { id: "rel_marcus", contactId: "ct_marcus", companyId: "co_meridian", source: "Event / Conference", stage: "Warm", momentum: "Steady", score: 74, priorityScore: 22, ownerName: "Mike Flores", tags: ["streaming", "decision-maker"], lastContactedAt: iso(5), nextFollowUpAt: iso(-1), createdAt: iso(210), updatedAt: iso(5) },
  { id: "rel_priya", contactId: "ct_priya", companyId: "co_harbor", source: "Referral", stage: "Engaged", momentum: "Steady", score: 61, priorityScore: 15, ownerName: "Mike Flores", tags: ["talent"], lastContactedAt: iso(9), nextFollowUpAt: iso(1), createdAt: iso(300), updatedAt: iso(9) },
  { id: "rel_tom", contactId: "ct_tom", companyId: "co_pinecrest", source: "Instantly Outbound", stage: "Contacted", momentum: "Cooling", score: 38, priorityScore: 30, ownerName: "Mike Flores", tags: ["brand-partner"], lastContactedAt: iso(14), nextFollowUpAt: iso(-4), createdAt: iso(180), updatedAt: iso(14) },
  { id: "rel_renee", contactId: "ct_renee", companyId: "co_altitude", source: "Inbound", stage: "Warm", momentum: "Accelerating", score: 79, priorityScore: 20, ownerName: "Mike Flores", tags: ["sports", "decision-maker"], lastContactedAt: iso(3), nextFollowUpAt: iso(2), createdAt: iso(160), updatedAt: iso(3) },
  { id: "rel_hyun", contactId: "ct_hyun", companyId: "co_lumen", source: "Existing Client", stage: "Active Client", momentum: "Steady", score: 84, priorityScore: 10, ownerName: "Mike Flores", tags: ["vendor", "vfx"], lastContactedAt: iso(20), nextFollowUpAt: iso(10), createdAt: iso(140), updatedAt: iso(20) },
  { id: "rel_lena", contactId: "ct_lena", companyId: "co_wavelength", source: "Warm Intro", stage: "Engaged", momentum: "Steady", score: 57, priorityScore: 14, ownerName: "Mike Flores", tags: ["music", "sync-licensing"], lastContactedAt: iso(30), nextFollowUpAt: iso(-1), createdAt: iso(120), updatedAt: iso(30) },
  { id: "rel_arjun", contactId: "ct_arjun", companyId: "co_driftwood", source: "Referral", stage: "Cold", momentum: "Stalled", score: 22, priorityScore: 8, ownerName: "Mike Flores", tags: ["docs"], lastContactedAt: iso(95), createdAt: iso(95), updatedAt: iso(40) },
  { id: "rel_sofia", contactId: "ct_sofia", companyId: "co_summit", source: "Warm Intro", stage: "Dormant", momentum: "At Risk", score: 41, priorityScore: 27, ownerName: "Mike Flores", tags: ["investor"], lastContactedAt: iso(60), nextFollowUpAt: iso(-10), createdAt: iso(260), updatedAt: iso(60) },
  { id: "rel_ben", contactId: "ct_ben", companyId: "co_cascade", source: "Event / Conference", stage: "Contacted", momentum: "Steady", score: 45, priorityScore: 16, ownerName: "Mike Flores", tags: ["casting"], lastContactedAt: iso(7), nextFollowUpAt: iso(4), createdAt: iso(70), updatedAt: iso(7) },
  { id: "rel_grace", contactId: "ct_grace", companyId: "co_ironwood", source: "Existing Client", stage: "Lost", momentum: "At Risk", score: 12, priorityScore: 5, ownerName: "Mike Flores", tags: ["distribution"], lastContactedAt: iso(100), createdAt: iso(330), updatedAt: iso(100) },
  { id: "rel_will", contactId: "ct_will", companyId: "co_brightline", source: "Manual Add", stage: "Contacted", momentum: "Accelerating", score: 52, priorityScore: 24, ownerName: "Mike Flores", tags: ["pr"], lastContactedAt: iso(1), nextFollowUpAt: iso(0), createdAt: iso(50), updatedAt: iso(1) },
  { id: "rel_mascot", contactId: "ct_mascot", companyId: "co_meridianvine", source: "Manual Add", stage: "Engaged", momentum: "Steady", score: 33, priorityScore: 6, ownerName: "Mike Flores", tags: ["fictional", "fun"], lastContactedAt: iso(365), createdAt: iso(400), updatedAt: iso(365) },
  { id: "rel_coach", contactId: "ct_coach", companyId: "co_loopcityfc", source: "Manual Add", stage: "Cold", momentum: "Stalled", score: 9, priorityScore: 2, ownerName: "Mike Flores", tags: ["fictional"], createdAt: iso(400), updatedAt: iso(365) },
];

// --- Relationship memories (AI-interview-style human context) -----------
export const memories: RelationshipMemory[] = [
  { id: "mem_1", relationshipId: "rel_dana", category: "Personal", note: "Two kids, both in youth soccer. Mentions Sunday-morning games often — good rapport opener.", source: "AI Interview", createdAt: iso(60) },
  { id: "mem_2", relationshipId: "rel_dana", category: "Preferences", note: "Prefers a tight one-page treatment over a full deck on first pass.", source: "AI Interview", createdAt: iso(60) },
  { id: "mem_3", relationshipId: "rel_dana", category: "Goals", note: "Actively building out a prestige limited-series slate for next fiscal year.", source: "Manual", createdAt: iso(20) },
  { id: "mem_4", relationshipId: "rel_marcus", category: "Professional Context", note: "Reports directly to the Head of Content; his sign-off unlocks the acquisitions committee.", source: "Manual", createdAt: iso(40) },
  { id: "mem_5", relationshipId: "rel_marcus", category: "Sensitivities", note: "Burned by a prior producer who overpromised delivery dates — leads with realistic timelines.", source: "AI Interview", createdAt: iso(40) },
  { id: "mem_6", relationshipId: "rel_renee", category: "History", note: "We first met at the Rocky Mountain Sports Media Summit two years ago.", source: "Manual", createdAt: iso(90) },
  { id: "mem_7", relationshipId: "rel_sofia", category: "Sensitivities", note: "Fund is mid-cycle on capital calls; realistic near-term ask is a soft-circle, not a check.", source: "AI Interview", createdAt: iso(80) },
];

// --- Company intelligence (simulated AI research) ------------------------
export const intelligence: CompanyIntelligence[] = [
  { id: "ci_1", companyId: "co_northlight", summary: "Simulated AI: Northlight closed a first-look deal with a major streamer last quarter and is expanding its limited-series slate.", recentNews: ["Announced first-look deal (simulated)", "Promoted new Head of Scripted (simulated)"], competitiveContext: "Competing directly with Meridian Streaming's originals arm for prestige-drama talent.", budgetSignals: "Signals suggest expanded development budget for Q3-Q4.", generatedBy: "Simulated AI", generatedAt: iso(10) },
  { id: "ci_2", companyId: "co_meridian", summary: "Simulated AI: Meridian is prioritizing library-friendly, multi-season formats over single limited series this cycle.", recentNews: ["Subscriber growth beat estimates (simulated)"], budgetSignals: "Acquisitions budget flat vs. last year per simulated signal.", generatedBy: "Simulated AI", generatedAt: iso(15) },
  { id: "ci_3", companyId: "co_altitude", summary: "Simulated AI: Altitude is investing heavily in original docuseries around regional sports franchises.", recentNews: ["New regional broadcast rights deal (simulated)"], generatedBy: "Simulated AI", generatedAt: iso(8) },
];

// --- Activities -----------------------------------------------------------
export const activities: Activity[] = [
  { id: "act_1", relationshipId: "rel_dana", type: "Meeting", summary: "Pitch meeting for limited-series treatment", loggedBy: "User", occurredAt: iso(2) },
  { id: "act_2", relationshipId: "rel_dana", type: "Email Received", summary: "Dana replied with notes, asked for revised budget", loggedBy: "System", occurredAt: iso(4) },
  { id: "act_3", relationshipId: "rel_dana", type: "Call", summary: "15-min check-in call", loggedBy: "User", occurredAt: iso(8) },
  { id: "act_4", relationshipId: "rel_marcus", type: "Email Sent", summary: "Sent follow-up deck after conference", loggedBy: "User", occurredAt: iso(5) },
  { id: "act_5", relationshipId: "rel_marcus", type: "LinkedIn Touch", summary: "Commented on his content-strategy post", loggedBy: "User", occurredAt: iso(12) },
  { id: "act_6", relationshipId: "rel_tom", type: "Email Sent", summary: "Instantly outbound sequence step 3", loggedBy: "Instantly Sync", occurredAt: iso(14) },
  { id: "act_7", relationshipId: "rel_renee", type: "Meeting", summary: "Intro call re: docuseries concept", loggedBy: "User", occurredAt: iso(3) },
  { id: "act_8", relationshipId: "rel_renee", type: "Note", summary: "She's pushing internally for a greenlight meeting next month", loggedBy: "User", occurredAt: iso(3) },
  { id: "act_9", relationshipId: "rel_hyun", type: "Email Received", summary: "Invoice and delivery schedule confirmed", loggedBy: "System", occurredAt: iso(20) },
  { id: "act_10", relationshipId: "rel_sofia", type: "Stage Change", summary: "Moved from Warm to Dormant after two missed follow-ups", loggedBy: "System", occurredAt: iso(60) },
  { id: "act_11", relationshipId: "rel_will", type: "Email Sent", summary: "Sent press-list request for upcoming premiere", loggedBy: "User", occurredAt: iso(1) },
  { id: "act_12", relationshipId: "rel_priya", type: "Call", summary: "Discussed availability for two clients next quarter", loggedBy: "User", occurredAt: iso(9) },
];

// --- Tasks ------------------------------------------------------------
export const tasks: Task[] = [
  { id: "task_1", relationshipId: "rel_dana", title: "Send revised budget to Dana", dueAt: iso(-1), completed: false, createdAt: iso(4) },
  { id: "task_2", relationshipId: "rel_marcus", title: "Follow up on acquisitions committee timing", dueAt: iso(-2), completed: false, createdAt: iso(5) },
  { id: "task_3", relationshipId: "rel_tom", title: "Re-engage after cooling — personal note, not another sequence step", dueAt: iso(-3), completed: false, createdAt: iso(10) },
  { id: "task_4", relationshipId: "rel_sofia", title: "Reconnect before fund's next capital call cycle", dueAt: iso(-8), completed: false, createdAt: iso(30) },
  { id: "task_5", relationshipId: "rel_renee", title: "Prep one-pager for greenlight meeting", dueAt: iso(-1), completed: false, createdAt: iso(3) },
  { id: "task_6", relationshipId: "rel_hyun", title: "Confirm Q3 post schedule", dueAt: iso(5), completed: false, createdAt: iso(15) },
  { id: "task_7", relationshipId: "rel_dana", title: "Log conference follow-up", completed: true, completedAt: iso(30), createdAt: iso(35) },
  { id: "task_8", relationshipId: "rel_will", title: "Send press list", dueAt: iso(0), completed: false, createdAt: iso(1) },
];

// --- Productions (8 named, per spec) --------------------------------------
export const productions: Production[] = [
  { id: "prod_1", name: "Low Tide", type: "Limited Series (Drama)", status: "In Development", loglines: "A coastal town unravels after a decades-old disappearance resurfaces.", targetAudience: "Prestige streaming, 25-54", createdAt: iso(50) },
  { id: "prod_2", name: "Signal Hill", type: "Feature Film (Thriller)", status: "Casting", loglines: "A radio operator intercepts a transmission that shouldn't exist.", targetAudience: "Theatrical + streaming day-and-date", createdAt: iso(70) },
  { id: "prod_3", name: "Overtime", type: "Docuseries (Sports)", status: "In Production", loglines: "A season inside a regional minor-league franchise fighting to survive.", targetAudience: "Sports streaming, regional broadcast", createdAt: iso(40) },
  { id: "prod_4", name: "Paper Trail", type: "Podcast → TV Adaptation", status: "In Development", loglines: "An investigative podcast's biggest case becomes a scripted anthology.", createdAt: iso(30) },
  { id: "prod_5", name: "Constant Static", type: "Music Documentary", status: "Post", loglines: "Three producers, one label, and the album that almost didn't happen.", createdAt: iso(90) },
  { id: "prod_6", name: "Harbor Lights", type: "Limited Series (Family Drama)", status: "Released", loglines: "Three siblings inherit their father's failing marina.", createdAt: iso(400) },
  { id: "prod_7", name: "Fault Lines", type: "Feature Film (Drama)", status: "In Development", loglines: "A structural engineer discovers the bridge she built has a fatal flaw.", createdAt: iso(20) },
  { id: "prod_8", name: "The Understudy", type: "Half-Hour Comedy", status: "Casting", loglines: "A perpetual background actor finally gets a line — and ruins it.", createdAt: iso(15) },
];

export const productionMatches: RelationshipProductionMatch[] = [
  { id: "match_1", relationshipId: "rel_dana", productionId: "prod_1", fitScore: 88, rationale: "Northlight's prestige-drama slate and Low Tide's tone are a near-exact fit; Dana is actively building this category.", createdAt: iso(5) },
  { id: "match_2", relationshipId: "rel_marcus", productionId: "prod_4", fitScore: 71, rationale: "Meridian favors library-friendly formats; Paper Trail's anthology structure fits multi-season potential.", createdAt: iso(6) },
  { id: "match_3", relationshipId: "rel_renee", productionId: "prod_3", fitScore: 94, rationale: "Direct match — Altitude is actively investing in regional-franchise docuseries content.", createdAt: iso(2) },
  { id: "match_4", relationshipId: "rel_lena", productionId: "prod_5", fitScore: 66, rationale: "Wavelength's catalog overlaps with the label story at the center of Constant Static.", createdAt: iso(25) },
];

export const assets: RelationshipAsset[] = [
  { id: "asset_1", relationshipId: "rel_dana", label: "Low Tide — one-page treatment", type: "Deck", createdAt: iso(6) },
  { id: "asset_2", relationshipId: "rel_renee", label: "Overtime — sizzle reel", type: "Reel", createdAt: iso(3) },
  { id: "asset_3", relationshipId: "rel_hyun", label: "Master services agreement", type: "Contract", createdAt: iso(100) },
];

export const scoreSnapshots: ScoreSnapshot[] = [
  { id: "snap_1", relationshipId: "rel_dana", score: 92, factors: [
    { key: "recency", label: "Recency of contact", points: 18, maxPoints: 20, explanation: "Last touch 2 days ago" },
    { key: "engagement", label: "Engagement depth", points: 25, maxPoints: 25, explanation: "Meeting + call + reply in last 10 days" },
    { key: "stage", label: "Stage value", points: 25, maxPoints: 25, explanation: "Active Client" },
    { key: "momentum", label: "Momentum", points: 15, maxPoints: 15, explanation: "Accelerating trend" },
    { key: "context", label: "Human context depth", points: 9, maxPoints: 15, explanation: "3 memories logged" },
  ], takenAt: iso(2) },
];

export const recommendations: Recommendation[] = [
  { id: "rec_1", relationshipId: "rel_tom", ruleId: "cooling-reengage", title: "Send a personal re-engagement note", rationale: "Momentum is cooling after 3 outbound sequence steps with no reply — a manual, personal note outperforms another automated step.", actionLabel: "Draft note", urgency: "High", dismissed: false, createdAt: iso(1) },
  { id: "rec_2", relationshipId: "rel_sofia", ruleId: "dormant-capital-cycle", title: "Reconnect before the next capital-call cycle", rationale: "Relationship is Dormant and At Risk; noted sensitivity is fund timing, not interest — timed outreach matters more than frequency here.", actionLabel: "Schedule follow-up", urgency: "Medium", dismissed: false, createdAt: iso(2) },
  { id: "rec_3", relationshipId: "rel_renee", ruleId: "warm-production-match", title: "Share the Overtime sizzle reel", rationale: "94-fit production match plus Accelerating momentum — strike while she's actively pushing internally for a greenlight meeting.", actionLabel: "Send asset", urgency: "Critical", dismissed: false, createdAt: iso(1) },
  { id: "rec_4", relationshipId: "rel_grace", ruleId: "lost-recovery-check", title: "Quarterly check-in before fully archiving", rationale: "Stage is Lost with no activity in 100 days; one low-effort check-in before this relationship is deprioritized long-term.", actionLabel: "Log a light touch", urgency: "Low", dismissed: false, createdAt: iso(3) },
];

export const integrationEvents: IntegrationEvent[] = [
  { id: "ie_1", provider: "Instantly", eventType: "sent", relationshipId: "rel_tom", externalId: "instantly_evt_00931", payload: { campaign: "Q3 Brand Partners Outbound", step: 3 }, processedAt: iso(14) },
  { id: "ie_2", provider: "Instantly", eventType: "opened", relationshipId: "rel_tom", externalId: "instantly_evt_00932", payload: { campaign: "Q3 Brand Partners Outbound", step: 3 }, processedAt: iso(13) },
];

export const messages: Message[] = [
  { id: "msg_1", relationshipId: "rel_dana", direction: "Inbound", channel: "Email", subject: "Re: Low Tide treatment", preview: "This is close — can we talk budget on Thursday?", sentAt: iso(4), read: true },
  { id: "msg_2", relationshipId: "rel_marcus", direction: "Outbound", channel: "Email", subject: "Great meeting you at the summit", preview: "Following up with the deck we discussed...", sentAt: iso(5), read: true },
  { id: "msg_3", relationshipId: "rel_tom", direction: "Outbound", channel: "Email", subject: "Quick idea for Q3", preview: "Simulated Instantly sequence step 3 of 4...", sentAt: iso(14), read: true },
  { id: "msg_4", relationshipId: "rel_will", direction: "Outbound", channel: "Email", subject: "Press list for premiere", preview: "Sending the full outlet list over today...", sentAt: iso(1), read: false },
];

export const dailyProgress: DailyProgress[] = [
  { date: new Date().toISOString().slice(0, 10), touchesLogged: 3, tasksCompleted: 1, streakDays: 4, goalTouches: 8 },
];

export function seedDatabase() {
  return {
    companies,
    contacts,
    relationships,
    memories,
    intelligence,
    activities,
    tasks,
    productions,
    productionMatches,
    assets,
    scoreSnapshots,
    recommendations,
    integrationEvents,
    messages,
    dailyProgress,
  };
}
