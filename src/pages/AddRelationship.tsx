import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useDb, updateDb, uid, nowIso } from "@/lib/storage";
import { domainFromEmail, findDuplicateContact, findExistingCompanyByDomain } from "@/lib/utils";
import { Card, Input, Button } from "@/components/ui/primitives";
import { RELATIONSHIP_SOURCES } from "@/types";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  title: z.string().optional(),
  phone: z.string().optional(),
  companyName: z.string().min(1, "Required"),
  industry: z.string().optional(),
  source: z.enum(RELATIONSHIP_SOURCES),
});

type FormValues = z.infer<typeof schema>;

export default function AddRelationship() {
  const db = useDb();
  const navigate = useNavigate();
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [forceCreate, setForceCreate] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { source: "Manual Add" },
  });

  const emailValue = watch("email");
  const firstNameValue = watch("firstName");
  const lastNameValue = watch("lastName");

  function checkDuplicate(values: FormValues) {
    const domain = domainFromEmail(values.email);
    const dup = findDuplicateContact(
      { email: values.email, firstName: values.firstName, lastName: values.lastName, companyDomain: domain },
      db.contacts,
      db.companies,
    );
    return dup;
  }

  function onSubmit(values: FormValues) {
    const dup = checkDuplicate(values);
    if (dup && !forceCreate) {
      setDuplicateWarning(`${dup.reason}: an existing contact "${dup.match.firstName} ${dup.match.lastName}" looks like a possible match. Review before creating a duplicate.`);
      return;
    }

    const domain = domainFromEmail(values.email);
    const company = findExistingCompanyByDomain(domain, db.companies);
    const companyId = company?.id ?? uid("co");
    const contactId = uid("ct");
    const relationshipId = uid("rel");

    updateDb((d) => ({
      ...d,
      companies: company
        ? d.companies
        : [
            ...d.companies,
            {
              id: companyId,
              name: values.companyName,
              domain,
              industry: values.industry || "Unspecified",
              createdAt: nowIso(),
              updatedAt: nowIso(),
            },
          ],
      contacts: [
        ...d.contacts,
        {
          id: contactId,
          companyId,
          firstName: values.firstName,
          lastName: values.lastName,
          title: values.title,
          email: values.email,
          phone: values.phone,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
      relationships: [
        ...d.relationships,
        {
          id: relationshipId,
          contactId,
          companyId,
          source: values.source,
          stage: "Cold",
          momentum: "Stalled",
          score: 0,
          priorityScore: 0,
          ownerName: d.settings.displayName,
          tags: [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
    }));

    navigate(`/relationships/${relationshipId}`);
  }

  return (
    <div className="mx-auto max-w-xl px-8 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Add Relationship</h1>
      <p className="mb-6 text-sm text-ink/50">
        We check email, company domain, and name against existing records to avoid duplicates before creating anything new.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink/50">First name</label>
              <Input {...register("firstName")} />
              {errors.firstName && <p className="mt-1 text-xs text-danger">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-xs text-ink/50">Last name</label>
              <Input {...register("lastName")} />
              {errors.lastName && <p className="mt-1 text-xs text-danger">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-xs text-ink/50">Email</label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink/50">Title</label>
              <Input {...register("title")} />
            </div>
            <div>
              <label className="text-xs text-ink/50">Phone</label>
              <Input {...register("phone")} />
            </div>
          </div>
          <div>
            <label className="text-xs text-ink/50">Company name</label>
            <Input {...register("companyName")} />
            {errors.companyName && <p className="mt-1 text-xs text-danger">{errors.companyName.message}</p>}
            {emailValue && domainFromEmail(emailValue) && (
              <p className="mt-1 text-xs text-ink/40">Domain detected: {domainFromEmail(emailValue)}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-ink/50">Industry</label>
            <Input {...register("industry")} />
          </div>
          <div>
            <label className="text-xs text-ink/50">Source</label>
            <select {...register("source")} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm">
              {RELATIONSHIP_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {duplicateWarning && (
            <div className="rounded-lg border border-warm/40 bg-warm/5 p-3 text-sm text-warm">
              {duplicateWarning}
              <label className="mt-2 flex items-center gap-2 text-xs text-ink/60">
                <input type="checkbox" checked={forceCreate} onChange={(e) => setForceCreate(e.target.checked)} />
                Create anyway — this is a different person
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit">
              {firstNameValue && lastNameValue ? `Add ${firstNameValue} ${lastNameValue}` : "Add relationship"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
