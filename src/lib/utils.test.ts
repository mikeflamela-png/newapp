import { describe, expect, it } from "vitest";
import { findDuplicateContact, domainFromEmail } from "@/lib/utils";
import type { Company, Contact } from "@/types";

const company: Company = {
  id: "co_1",
  name: "Test Co",
  domain: "testco.com",
  industry: "Test",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const contact: Contact = {
  id: "ct_1",
  companyId: "co_1",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@testco.com",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("domainFromEmail", () => {
  it("extracts and lowercases the domain", () => {
    expect(domainFromEmail("Person@Example.COM")).toBe("example.com");
  });
});

describe("findDuplicateContact", () => {
  it("detects an exact email match", () => {
    const result = findDuplicateContact(
      { email: "jane.doe@testco.com", firstName: "Someone", lastName: "Else", companyDomain: "testco.com" },
      [contact],
      [company],
    );
    expect(result?.reason).toBe("Exact email match");
  });

  it("detects same name + domain even with a different email", () => {
    const result = findDuplicateContact(
      { email: "j.doe@testco.com", firstName: "Jane", lastName: "Doe", companyDomain: "testco.com" },
      [contact],
      [company],
    );
    expect(result?.reason).toBe("Same name and company domain");
  });

  it("returns null when nothing matches", () => {
    const result = findDuplicateContact(
      { email: "new.person@other.com", firstName: "New", lastName: "Person", companyDomain: "other.com" },
      [contact],
      [company],
    );
    expect(result).toBeNull();
  });
});
