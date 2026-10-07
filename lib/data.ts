export const categories = [
  { name: "Construction", desc: "Masons • Steel fixers • Carpenters", icon: "hard-hat" },
  { name: "Electrical", desc: "Electricians • Technicians", icon: "bolt" },
  { name: "HVAC", desc: "AC • Chiller • Refrigeration", icon: "snow" },
  { name: "Welding", desc: "ARC • MIG • TIG • 6G", icon: "flame" },
  { name: "Heavy Equipment", desc: "Crane • Excavator • Loader", icon: "truck" },
  { name: "Drivers", desc: "Heavy • Trailer • Bus", icon: "wheel" },
  { name: "Engineering", desc: "Civil • Mechanical • Electrical", icon: "gear" },
  { name: "Industrial", desc: "Operators • Technicians", icon: "factory" },
  { name: "Healthcare", desc: "Nurses • Technicians • Caregivers", icon: "cross" },
  { name: "Facilities", desc: "Maintenance • BMS • MEP", icon: "building" },
] as const;

export const jobs = [
  { id: "FP-4587", title: "Industrial Electrician", city: "Dubai, UAE", exp: "3–5 years", positions: 25, salary: "$1,100 – 1,600 /mo" },
  { id: "FP-4562", title: "Mechanical Technician", city: "Doha, Qatar", exp: "2–4 years", positions: 15, salary: "$950 – 1,450 /mo" },
  { id: "FP-4578", title: "Heavy Vehicle Driver", city: "Riyadh, KSA", exp: "2–5 years", positions: 20, salary: "$800 – 1,200 /mo" },
  { id: "FP-4601", title: "Civil Site Engineer", city: "Singapore", exp: "3–6 years", positions: 10, salary: "$2,400 – 3,200 /mo" },
  { id: "FP-4590", title: "Warehouse Supervisor", city: "Toronto, Canada", exp: "2–4 years", positions: 12, salary: "$2,600 – 3,400 /mo" },
  { id: "FP-4555", title: "HVAC Technician", city: "London, UK", exp: "2–4 years", positions: 30, salary: "£2,100 – 2,900 /mo" },
  { id: "FP-4533", title: "Structural Welder (6G)", city: "Perth, Australia", exp: "4–8 years", positions: 18, salary: "$3,200 – 4,200 /mo" },
  { id: "FP-4612", title: "Plumber", city: "Berlin, Germany", exp: "2–5 years", positions: 22, salary: "€2,300 – 3,100 /mo" },
] as const;

export const featuredTalent = [
  { name: "Muhammad Khan", role: "Electrician", exp: "5 yrs", city: "Lahore, PK", match: 94, skills: ["Industrial", "Wiring"], photo: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Usman Ali", role: "HVAC Technician", exp: "6 yrs", city: "Karachi, PK", match: 91, skills: ["Chiller", "AC"], photo: "https://randomuser.me/api/portraits/men/75.jpg" },
  { name: "Ahmed Raza", role: "Welder (6G)", exp: "7 yrs", city: "Faisalabad, PK", match: 88, skills: ["TIG", "MIG"], photo: "https://randomuser.me/api/portraits/men/51.jpg" },
  { name: "Sajid Hussain", role: "Heavy Equipment", exp: "8 yrs", city: "Multan, PK", match: 86, skills: ["Crane", "Loader"], photo: "https://randomuser.me/api/portraits/men/85.jpg" },
  { name: "Bilal Ahmed", role: "Heavy Driver", exp: "6 yrs", city: "Rawalpindi, PK", match: 85, skills: ["Trailer", "Bus"], photo: "https://randomuser.me/api/portraits/men/44.jpg" },
] as const;

export const brands = ["Atlas Group", "Vertex Industries", "Summit Facilities", "Orion Logistics", "Delta Construction", "Zenith Corp", "Pioneer MEP", "Global Works"] as const;

export const steps = [
  { n: 1, t: "Post Requirement", d: "An employer submits its manpower requirement." },
  { n: 2, t: "Requirement Verified", d: "ForcePK reviews and verifies the requirement." },
  { n: 3, t: "Candidate Sourcing", d: "Candidates sourced from our global pool & partner network." },
  { n: 4, t: "AI + Human Screening", d: "Profiles matched, ranked and verified." },
  { n: 5, t: "Shortlist Sent", d: "Best-fit candidates shortlisted for the employer." },
  { n: 6, t: "Interviews / Tests", d: "Online or in-person interviews and trade tests." },
  { n: 7, t: "Selection", d: "Employer selects the right candidates." },
  { n: 8, t: "Documentation", d: "Visa, medical and official processing support." },
  { n: 9, t: "Deployment", d: "Mobilization and travel to the destination country." },
] as const;

export const stats = [
  { value: "10,000+", label: "Registered Candidates" },
  { value: "500+", label: "Skilled Professionals" },
  { value: "50+", label: "Recruitment Partners" },
  { value: "40+", label: "Countries Served" },
] as const;

export const testimonials = [
  {
    quote:
      "ForcePK helped us source qualified technical manpower across borders efficiently. The process was smooth, professional and reliable.",
    name: "Ahmad Al-Fahad",
    role: "HR Manager — Dubai, UAE",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    quote:
      "Excellent platform with high-quality candidates and great support throughout the process. Highly recommended.",
    name: "Sarah Thompson",
    role: "Operations Manager — Toronto, Canada",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    quote:
      "Working with ForcePK opened new global opportunities for our candidates. The platform is easy to use and professional.",
    name: "Muhammad Bilal",
    role: "Recruitment Partner — Lahore, Pakistan",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
] as const;

export const faqs = [
  {
    q: "How can a company request manpower?",
    a: "Create an employer account and post a manpower requirement specifying job title, quantity, skills, salary, location and joining date. ForcePK verifies it and begins sourcing matched candidates from our global talent pool.",
  },
  {
    q: "How does ForcePK verify candidates?",
    a: "Every candidate goes through CV and document verification, experience checks, and trade testing where required — flagged for human review before shortlisting.",
  },
  {
    q: "Can companies request bulk or project-based manpower?",
    a: "Yes. ForcePK supports recruitment for 10, 50, 100+ workers and full project-level workforce mobilization anywhere in the world.",
  },
  {
    q: "Can recruitment agencies join the partner network?",
    a: "Yes. Licensed recruitment partners worldwide can register, access approved requirements in the Job Marketplace, submit candidates and earn commission on successful deployments.",
  },
  {
    q: "How are documents handled?",
    a: "Each candidate has a secure digital document wallet. Sensitive documents such as passport and national ID are never exposed publicly and are shared only with authorized parties.",
  },
  {
    q: "Does ForcePK provide a replacement policy?",
    a: "Replacement terms are agreed individually with each employer before recruitment begins — covering the period, conditions and number of replacements — rather than a blanket guarantee.",
  },
] as const;
