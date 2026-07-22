// ---------------------------------------------------------------------------
// Relationship Leaderboard — domain model
// All 17 core entities used across the app. Kept in one file so the shape of
// the whole system is readable in a single pass.
// ---------------------------------------------------------------------------

export type ID = string;
export type ISODate = string; // yyyy-MM-dd or full ISO timestamp

export const RELATIONSHIP_SOURCES = [
  "Instantly Outbound",
  "Warm Intro",
  "Inbound",
  "Event / Conference",
  "Referral",
  "Existing Client",
  "Manual Add",
] as const;
export type RelationshipSource = (typeof RELATIONSHIP_SOURCES)[number];

export const RELATIONSHIP_STAGES = [
  "Cold",
  "Contacted",
  "Engaged",
  "Warm",
  "Active Client",
  "Dormant",
  "Lost",
] as const;
export type RelationshipStage = (typeof RELATIONSHIP_STAGES)[number];

export const MOMENTUM_STATUSES = ["Accelerating", "Steady", "Cooling", "Stalled", "At Risk"] as const;
export type MomentumStatus = (typeof MOMENTUM_STATUSES)[number];

export const ACTIVITY_TYPES = [
  "Email Sent",
  "Email Received",
  "Call",
  "Meeting",
  "Note",
  "LinkedIn Touch",
  "Event Interaction",
  "Task Completed",
  "Stage Change",
  "Production Match",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface Company {
  id: ID;
  name: string;
  domain: string;
  industry: string;
  hqCity?: string;
  size?: "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";
  website?: string;
  notes?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Contact {
  id: ID;
  companyId: ID;
  firstName: string;
  lastName: string;
  title?: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  photoUrl?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Relationship {
  id: ID;
  contactId: ID;
  companyId: ID;
  source: RelationshipSource;
  stage: RelationshipStage;
  momentum: MomentumStatus;
  score: number; // 0-100, capped
  priorityScore: number; // daily priority ranking value
  ownerName: string;
  tags: string[];
  lastContactedAt?: ISODate;
  nextFollowUpAt?: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface RelationshipMemory {
  id: ID;
  relationshipId: ID;
  category:
    | "Personal"
    | "Professional Context"
    | "Preferences"
    | "Sensitivities"
    | "History"
    | "Goals";
  note: string;
  source: "AI Interview" | "Manual" | "Inferred";
  createdAt: ISODate;
}

export interface CompanyIntelligence {
  id: ID;
  companyId: ID;
  summary: string;
  recentNews: string[];
  competitiveContext?: string;
  budgetSignals?: string;
  generatedBy: "Simulated AI" | "Manual";
  generatedAt: ISODate;
}

export interface Activity {
  id: ID;
  relationshipId: ID;
  type: ActivityType;
  summary: string;
  detail?: string;
  loggedBy: "User" | "System" | "Instantly Sync";
  occurredAt: ISODate;
}

export interface Task {
  id: ID;
  relationshipId?: ID;
  title: string;
  description?: string;
  dueAt?: ISODate;
  completed: boolean;
  completedAt?: ISODate;
  createdAt: ISODate;
}

export interface Production {
  id: ID;
  name: string;
  type: string;
  status: "In Development" | "Casting" | "In Production" | "Post" | "Released";
  loglines?: string;
  targetAudience?: string;
  createdAt: ISODate;
}

export interface RelationshipProductionMatch {
  id: ID;
  relationshipId: ID;
  productionId: ID;
  fitScore: number; // 0-100
  rationale: string;
  createdAt: ISODate;
}

export interface RelationshipAsset {
  id: ID;
  relationshipId: ID;
  label: string;
  url?: string;
  type: "Deck" | "Contract" | "Screenshot" | "Reel" | "Other";
  createdAt: ISODate;
}

export interface ScoreFactor {
  key: string;
  label: string;
  points: number;
  maxPoints: number;
  explanation: string;
}

export interface ScoreSnapshot {
  id: ID;
  relationshipId: ID;
  score: number;
  factors: ScoreFactor[];
  takenAt: ISODate;
}

export interface Recommendation {
  id: ID;
  relationshipId: ID;
  ruleId: string;
  title: string;
  rationale: string;
  actionLabel: string;
  urgency: "Low" | "Medium" | "High" | "Critical";
  dismissed: boolean;
  createdAt: ISODate;
}

export interface IntegrationEvent {
  id: ID;
  provider: "Instantly";
  eventType: "sent" | "opened" | "clicked" | "replied" | "bounced" | "unsubscribed";
  relationshipId?: ID;
  externalId: string; // used for idempotency
  payload: Record<string, unknown>;
  processedAt: ISODate;
}

export interface Message {
  id: ID;
  relationshipId: ID;
  direction: "Outbound" | "Inbound";
  channel: "Email" | "LinkedIn";
  subject?: string;
  preview: string;
  fullBody?: string;
  sentAt: ISODate;
  read: boolean;
}

export interface DailyProgress {
  date: ISODate; // yyyy-MM-dd
  touchesLogged: number;
  tasksCompleted: number;
  streakDays: number;
  goalTouches: number;
}

export interface UserSettings {
  displayName: string;
  email: string;
  theme: "light" | "dark" | "system";
  dailyTouchGoal: number;
  aiProvider: "mock" | "openai";
  instantlyProvider: "mock" | "instantly";
  notificationsEnabled: boolean;
  gamificationEnabled: boolean;
}

// Convenience composite used across list/detail views
export interface RelationshipView {
  relationship: Relationship;
  contact: Contact;
  company: Company;
}
