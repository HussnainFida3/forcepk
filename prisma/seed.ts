import { PrismaClient, Role, AccountStatus, RequirementStatus, Stage, DocType, DocStatus, Provisioning, CommissionStatus, LeadStage, InterviewStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const PASSWORD = "Password123";

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  // ── Core platform users (one per role) ──
  const roles: [Role, string, string][] = [
    [Role.SUPER_ADMIN, "owner@forcepk.com", "ForcePK Owner"],
    [Role.OPS_MANAGER, "ops@forcepk.com", "Operations Manager"],
    [Role.FINANCE, "finance@forcepk.com", "Finance Manager"],
    [Role.DOCUMENT_OFFICER, "docs@forcepk.com", "Document Officer"],
    [Role.INTERVIEW_MANAGER, "interviews@forcepk.com", "Interview Manager"],
  ];
  for (const [role, email, name] of roles) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, role, passwordHash: hash, status: AccountStatus.VERIFIED, twoFactor: true },
    });
  }

  // ── Saudi Employer ──
  const company = await prisma.company.upsert({
    where: { crNumber: "CR-1010293" },
    update: {},
    create: {
      name: "ABC Trading Co.", crNumber: "CR-1010293", city: "Riyadh", industry: "Construction",
      website: "https://abctrading.sa", status: AccountStatus.VERIFIED, contactName: "Khalid Al-Fahad",
      email: "hr@abctrading.sa", phone: "+966500000000",
    },
  });
  const employer = await prisma.user.upsert({
    where: { email: "employer@abctrading.sa" },
    update: {},
    create: { email: "employer@abctrading.sa", name: "ABC Trading HR", role: Role.EMPLOYER_ADMIN, passwordHash: hash, status: AccountStatus.VERIFIED, companyId: company.id },
  });

  // ── OEP Partner ──
  const oep = await prisma.oep.upsert({
    where: { licenseNo: "OEP-1024" },
    update: {},
    create: {
      name: "ABC Recruitment Agency", licenseNo: "OEP-1024", city: "Lahore",
      licenseExpiry: new Date("2027-06-30"), specializations: ["Construction", "Electrical", "HVAC"],
      status: AccountStatus.VERIFIED, rating: 4.8, tier: "Gold", email: "info@abcrecruit.pk", phone: "+923000000000",
    },
  });
  await prisma.user.upsert({
    where: { email: "partner@abcrecruit.pk" },
    update: {},
    create: { email: "partner@abcrecruit.pk", name: "ABC Recruitment", role: Role.OEP_ADMIN, passwordHash: hash, status: AccountStatus.VERIFIED, oepId: oep.id },
  });

  // ── Candidate ──
  const candUser = await prisma.user.upsert({
    where: { email: "candidate@forcepk.com" },
    update: {},
    create: { email: "candidate@forcepk.com", name: "Muhammad Ahsan", role: Role.CANDIDATE, passwordHash: hash, status: AccountStatus.VERIFIED, phone: "+923001234567" },
  });
  const candidate = await prisma.candidateProfile.upsert({
    where: { userId: candUser.id },
    update: {},
    create: {
      userId: candUser.id, cnic: "35202-1234567-8", passportNo: "AB1234567", city: "Faisalabad",
      profession: "Electrician", skills: ["Electrical maintenance", "Wiring", "Industrial panels"],
      experienceYrs: 5, saudiExpYrs: 2, education: "Diploma — Electrical", salaryExpect: "SAR 2,200",
      languages: ["Urdu", "English", "Arabic (basic)"], drivingLicense: "LTV", profileStrength: 82,
      summary: "Experienced industrial electrician with 5 years in construction and facilities, incl. 2 years GCC.",
    },
  });

  // Documents for candidate
  const docs: [DocType, DocStatus][] = [
    [DocType.CV, DocStatus.VERIFIED], [DocType.PASSPORT, DocStatus.VERIFIED],
    [DocType.CNIC, DocStatus.VERIFIED], [DocType.EXPERIENCE_CERT, DocStatus.PENDING],
    [DocType.MEDICAL, DocStatus.MISSING], [DocType.EDUCATION_CERT, DocStatus.VERIFIED],
  ];
  for (const [type, status] of docs) {
    await prisma.document.create({ data: { candidateId: candidate.id, type, status } });
  }

  // ── Requirement + Application ──
  const req = await prisma.requirement.upsert({
    where: { refCode: "FP-4587" },
    update: {},
    create: {
      refCode: "FP-4587", companyId: company.id, title: "30 Electricians", profession: "Electrician",
      quantity: 30, gender: "Male", ageMin: 22, ageMax: 40, experience: "2-5 years", education: "High School / Diploma",
      skills: ["Electrical work", "Wiring", "Maintenance"], salary: "SAR 1,800 - 2,500",
      accommodation: Provisioning.PROVIDED, food: Provisioning.PROVIDED, transport: Provisioning.PROVIDED,
      workingHours: "8 hrs/day", contractDuration: "2 years", location: "Riyadh", interviewMethod: "Online / In-person",
      status: RequirementStatus.OPEN, joiningDeadline: new Date("2025-05-15"),
    },
  });
  await prisma.application.upsert({
    where: { requirementId_candidateId: { requirementId: req.id, candidateId: candidate.id } },
    update: {},
    create: { requirementId: req.id, candidateId: candidate.id, oepId: oep.id, stage: Stage.SHORTLISTED, aiMatch: 94, skillsMatch: 98, expMatch: 95 },
  });

  // ── Bulk data (for realistic dashboards) ──
  if ((await prisma.company.count()) < 10) {
    const cities = ["Dubai, UAE", "Doha, Qatar", "Riyadh, KSA", "Singapore", "Toronto, CA", "London, UK", "Berlin, DE", "Sydney, AU", "Hamburg, DE", "Muscat, OM"];
    const industries = ["Construction", "Industrial", "Oil & Gas", "Facilities", "Logistics", "Hospitality", "Healthcare", "IT"];
    const professions = ["Electrician", "Welder", "Plumber", "HVAC Technician", "Driver", "Civil Engineer", "Mechanic", "Mason", "Steel Fixer", "Carpenter"];
    const pick = <T,>(a: T[], i: number) => a[i % a.length];

    // Companies (120)
    await prisma.company.createMany({
      data: Array.from({ length: 119 }, (_, i) => ({
        name: `${pick(["Atlas", "Global", "Pioneer", "Summit", "Vertex", "Orion", "Delta", "Zenith"], i)} ${pick(["Construction", "Industries", "Group", "Facilities", "Logistics"], i >> 1)} ${i + 1}`,
        crNumber: `CR-${200000 + i}`, city: pick(cities, i), industry: pick(industries, i),
        status: i % 9 === 0 ? AccountStatus.PENDING : AccountStatus.VERIFIED,
      })),
      skipDuplicates: true,
    });

    // OEPs (46)
    await prisma.oep.createMany({
      data: Array.from({ length: 46 }, (_, i) => ({
        name: `${pick(["Global Talent", "HR Connect", "Future Workforce", "Bright", "Prime", "Elite", "Unity"], i)} Recruitment ${i + 1}`,
        licenseNo: `OEP-${2000 + i}`, city: pick(["Lahore", "Karachi", "Manila", "Kathmandu", "Dhaka", "Cairo"], i),
        status: AccountStatus.VERIFIED, rating: 3.5 + (i % 15) / 10, tier: pick(["Bronze", "Silver", "Gold", "Platinum"], i),
      })),
      skipDuplicates: true,
    });

    // Candidate users (500) + profiles
    await prisma.user.createMany({
      data: Array.from({ length: 500 }, (_, i) => ({
        email: `cand${i}@talent.forcepk.com`, name: `Candidate ${i + 1}`,
        role: Role.CANDIDATE, passwordHash: hash, status: AccountStatus.VERIFIED,
      })),
      skipDuplicates: true,
    });
    const candUsers = await prisma.user.findMany({ where: { email: { startsWith: "cand" } }, select: { id: true } });
    await prisma.candidateProfile.createMany({
      data: candUsers.map((u, i) => ({
        userId: u.id, profession: pick(professions, i), city: pick(["Lahore", "Karachi", "Faisalabad", "Multan", "Manila", "Dhaka"], i),
        skills: [pick(professions, i), "Maintenance"], experienceYrs: 1 + (i % 10), saudiExpYrs: i % 4,
        profileStrength: 50 + (i % 50), salaryExpect: `$${900 + (i % 10) * 120} /mo`,
      })),
      skipDuplicates: true,
    });

    // Requirements (37 more) across companies
    const companies = await prisma.company.findMany({ select: { id: true } });
    await prisma.requirement.createMany({
      data: Array.from({ length: 37 }, (_, i) => ({
        refCode: `FP-5${String(i).padStart(3, "0")}`, companyId: pick(companies, i).id,
        title: `${5 + (i % 40)} ${pick(professions, i)}s`, profession: pick(professions, i),
        quantity: 5 + (i % 40), location: pick(cities, i), salary: `$${900 + (i % 8) * 150} /mo`,
        experience: `${1 + (i % 5)}+ years`, status: RequirementStatus.OPEN, priority: i % 7 === 0 ? "URGENT" : "NORMAL",
      })),
      skipDuplicates: true,
    });

    // Applications across stages
    const reqs = await prisma.requirement.findMany({ select: { id: true } });
    const stages = [Stage.SUBMITTED, Stage.SHORTLISTED, Stage.INTERVIEW, Stage.SELECTED, Stage.DEPLOYED, Stage.PROCESSING];
    const apps = candUsers.slice(0, 300).map((_, i) => ({
      requirementId: pick(reqs, i).id,
      candidateId: "", // filled below
      stage: pick(stages, i), aiMatch: 70 + (i % 30),
    }));
    const profiles = await prisma.candidateProfile.findMany({ select: { id: true }, take: 300 });
    let made = 0;
    for (let i = 0; i < profiles.length; i++) {
      try {
        await prisma.application.create({ data: { requirementId: pick(reqs, i).id, candidateId: profiles[i].id, stage: pick(stages, i), aiMatch: 70 + (i % 30) } });
        made++;
      } catch { /* unique clash, skip */ }
    }
    console.log(`   Bulk: 120 companies, 47 OEPs, ${candUsers.length} candidates, ${reqs.length} requirements, ${made} applications`);
  }

  // ── Finance: Invoices + Commissions ──
  if ((await prisma.invoice.count()) < 5) {
    const comps = await prisma.company.findMany({ select: { id: true }, take: 24 });
    const invStatuses = ["PAID", "PAID", "PENDING", "OVERDUE", "PENDING"];
    await prisma.invoice.createMany({
      data: comps.map((c, i) => ({
        companyId: c.id, amount: (3000 + (i % 12) * 850).toFixed(2), currency: "USD",
        status: invStatuses[i % invStatuses.length],
        issuedAt: new Date(Date.now() - (i * 3 + 2) * 864e5),
        dueAt: new Date(Date.now() + (20 - i) * 864e5),
      })),
      skipDuplicates: true,
    });

    // Commissions on deployed/selected applications (assign an OEP where missing)
    const deployed = await prisma.application.findMany({
      where: { stage: { in: [Stage.DEPLOYED, Stage.SELECTED] } },
      select: { id: true, oepId: true }, take: 40,
    });
    const allOeps = await prisma.oep.findMany({ select: { id: true } });
    const comStatuses = [CommissionStatus.PAID, CommissionStatus.PAYABLE, CommissionStatus.APPROVED, CommissionStatus.PENDING];
    let madeCom = 0;
    for (let i = 0; i < deployed.length; i++) {
      const gross = 1500 + (i % 10) * 300;
      const oepId = deployed[i].oepId ?? allOeps[i % allOeps.length].id;
      try {
        await prisma.commission.create({
          data: {
            oepId, applicationId: deployed[i].id,
            grossFee: gross.toFixed(2), oepShare: (gross * 0.6).toFixed(2), currency: "USD",
            status: comStatuses[i % comStatuses.length],
          },
        });
        madeCom++;
      } catch { /* unique applicationId clash */ }
    }
    console.log(`   Finance: ${comps.length} invoices, ${madeCom} commissions`);
  }

  // ── CRM: Sales leads ──
  if ((await prisma.lead.count()) < 5) {
    const leadStages = [LeadStage.NEW, LeadStage.CONTACTED, LeadStage.MEETING, LeadStage.PROPOSAL, LeadStage.AGREEMENT, LeadStage.WON, LeadStage.LOST];
    const sources = ["Website", "Referral", "LinkedIn", "Trade Show", "Cold Outreach", "Inbound Call"];
    const leadCos = ["Nakheel Contracting", "Gulf Marine Services", "Emaar Facilities", "Qatar Steel", "TAV Construction", "Jacobs Engineering", "Saipem Offshore", "Hassan Allam", "Al Futtaim Carillion", "Petrofac", "Larsen & Toubro", "China State Construction"];
    const owners = await prisma.user.findMany({ where: { role: { in: [Role.OPS_MANAGER, Role.SUPER_ADMIN] } }, select: { id: true } });
    await prisma.lead.createMany({
      data: leadCos.map((name, i) => ({
        name: `${["Ahmed", "Sarah", "Omar", "Maria", "John", "Fatima"][i % 6]} ${["Khan", "Ali", "Smith", "Haddad", "Chen", "Reyes"][i % 6]}`,
        company: name, email: `contact@${name.toLowerCase().replace(/[^a-z]+/g, "")}.com`,
        phone: `+9715${String(10000000 + i * 137).slice(0, 8)}`,
        source: sources[i % sources.length], stage: leadStages[i % leadStages.length],
        notes: `Potential requirement: ${20 + i * 5} workers. Follow up on rates and mobilization timeline.`,
        ownerId: owners.length ? owners[i % owners.length].id : null,
      })),
      skipDuplicates: true,
    });
    console.log(`   CRM: ${leadCos.length} sales leads`);
  }

  // ── Interviews on INTERVIEW-stage applications ──
  if ((await prisma.interview.count()) < 5) {
    const ivApps = await prisma.application.findMany({ where: { stage: Stage.INTERVIEW }, select: { id: true }, take: 30 });
    const methods = ["Online", "In-person", "Phone"];
    const ivStatus = [InterviewStatus.SCHEDULED, InterviewStatus.COMPLETED, InterviewStatus.COMPLETED, InterviewStatus.NO_SHOW];
    let madeIv = 0;
    for (let i = 0; i < ivApps.length; i++) {
      const st = ivStatus[i % ivStatus.length];
      try {
        await prisma.interview.create({
          data: {
            applicationId: ivApps[i].id, method: methods[i % methods.length],
            scheduledAt: new Date(Date.now() + ((i % 10) - 3) * 864e5),
            status: st, link: "https://meet.forcepk.com/iv-" + (1000 + i),
            score: st === InterviewStatus.COMPLETED ? 60 + (i % 40) : null,
            feedback: st === InterviewStatus.COMPLETED ? "Strong technical skills, good communication." : null,
          },
        });
        madeIv++;
      } catch { /* skip */ }
    }
    console.log(`   Interviews: ${madeIv} scheduled/completed`);
  }

  console.log(`✅ Seed complete. Login password for all accounts: ${PASSWORD}`);
  console.log("   owner@forcepk.com (admin) · employer@abctrading.sa · partner@abcrecruit.pk · candidate@forcepk.com");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
