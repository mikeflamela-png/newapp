import type { Company, Contact } from "@/types";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function fullName(c: Pick<Contact, "firstName" | "lastName">): string {
  return `${c.firstName} ${c.lastName}`;
}

export function domainFromEmail(email: string): string {
  const at = email.split("@")[1];
  return (at ?? "").toLowerCase().trim();
}

/**
 * Duplicate-detection used by the Add Relationship flow.
 * A candidate contact is considered a likely duplicate of an existing one if
 * any of the following match (in priority order): exact email, same normalized
 * full name AND same company domain, or same company domain AND same last
 * name (weaker signal, surfaced as a warning rather than a hard block).
 */
export function findDuplicateContact(
  candidate: { email: string; firstName: string; lastName: string; companyDomain: string },
  existingContacts: Contact[],
  existingCompanies: Company[],
): { match: Contact; reason: string } | null {
  const candidateEmail = candidate.email.trim().toLowerCase();
  const candidateDomain = candidate.companyDomain.trim().toLowerCase();
  const companyById = new Map(existingCompanies.map((c) => [c.id, c] as const));

  for (const existing of existingContacts) {
    if (existing.email.trim().toLowerCase() === candidateEmail) {
      return { match: existing, reason: "Exact email match" };
    }
  }

  for (const existing of existingContacts) {
    const company = companyById.get(existing.companyId);
    const sameDomain = company?.domain.toLowerCase() === candidateDomain;
    const sameName =
      existing.firstName.trim().toLowerCase() === candidate.firstName.trim().toLowerCase() &&
      existing.lastName.trim().toLowerCase() === candidate.lastName.trim().toLowerCase();
    if (sameDomain && sameName) {
      return { match: existing, reason: "Same name and company domain" };
    }
  }

  for (const existing of existingContacts) {
    const company = companyById.get(existing.companyId);
    const sameDomain = company?.domain.toLowerCase() === candidateDomain;
    const sameLastName = existing.lastName.trim().toLowerCase() === candidate.lastName.trim().toLowerCase();
    if (sameDomain && sameLastName) {
      return { match: existing, reason: "Same company domain and last name (possible match)" };
    }
  }

  return null;
}

export function findExistingCompanyByDomain(domain: string, companies: Company[]): Company | undefined {
  const normalized = domain.trim().toLowerCase();
  return companies.find((c) => c.domain.toLowerCase() === normalized);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

export function formatRelativeDays(iso: string | undefined): string {
  if (!iso) return "Never";
  const days = daysBetween(iso, new Date().toISOString());
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
