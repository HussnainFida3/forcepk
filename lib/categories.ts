// The 25 manpower categories shown as image tiles on the Jobs page and as the
// profession dropdown on the post-requirement forms. "Other" (26th) lets users
// enter a profession not listed here.
const IMG = (id: string) => `https://plus.unsplash.com/premium_photo-${id}?auto=format&fit=crop&w=500&q=70`;

export interface JobCategory {
  slug: string;
  name: string;      // dropdown text + tile label
  q: string;         // search keyword used when filtering jobs
  image: string;
  countries: string;
  desc: string;
}

export const JOB_CATEGORIES: JobCategory[] = [
  { slug: "civil-engineers", name: "Civil & Site Engineers", q: "engineer", image: IMG("1681989486976-9ec9d2eac57a"), countries: "Saudi Arabia, UAE, Qatar", desc: "Roads, buildings, infrastructure and industrial construction." },
  { slug: "nurses-healthcare", name: "Nurses & Healthcare Professionals", q: "nurse", image: IMG("1682141142889-218debf4f8dc"), countries: "Saudi Arabia, UAE, Qatar, Kuwait", desc: "Hospitals and clinics need nurses, technicians and specialists." },
  { slug: "hvac-technicians", name: "HVAC Technicians", q: "HVAC", image: IMG("1683134512538-7b390d0adc9e"), countries: "All six Gulf markets", desc: "AC installation, maintenance and repairs in buildings and hotels." },
  { slug: "electricians", name: "Electricians", q: "electric", image: IMG("1661911309991-cc81afcce97d"), countries: "Saudi Arabia, UAE, Qatar, Oman", desc: "Building wiring, industrial maintenance and electrical installations." },
  { slug: "software-developers", name: "Software Developers", q: "developer", image: IMG("1678566111481-8e275550b700"), countries: "UAE, Saudi Arabia, Qatar", desc: "Web and mobile apps, enterprise software, APIs and digital transformation." },
  { slug: "plumbers", name: "Plumbers & Pipefitters", q: "plumb", image: IMG("1663045495725-89f23b57cfc5"), countries: "Saudi Arabia, UAE, Qatar, Kuwait", desc: "Residential, commercial and industrial plumbing and pipework." },
  { slug: "warehouse-logistics", name: "Warehouse & Logistics Workers", q: "warehouse", image: IMG("1661302828763-4ec9b91d9ce3"), countries: "UAE, Saudi Arabia", desc: "Warehousing, stock handling, order fulfilment and distribution." },
  { slug: "truck-drivers", name: "Heavy Truck & Delivery Drivers", q: "driver", image: IMG("1664695368767-c42483a0bda1"), countries: "Saudi Arabia, UAE, Qatar, Oman", desc: "Freight, construction transport and deliveries. Local licence required." },
  { slug: "chefs-kitchen", name: "Chefs & Kitchen Staff", q: "chef", image: IMG("1687697861242-03e99059e833"), countries: "UAE, Saudi Arabia, Qatar", desc: "Hotels, restaurants, catering and tourism businesses." },
  { slug: "hotel-housekeeping", name: "Hotel & Housekeeping Staff", q: "housekeeping", image: IMG("1682097409792-354d4d544753"), countries: "UAE, Saudi Arabia, Qatar, Oman", desc: "Housekeeping, room attendants and hotel operations." },
  { slug: "mechanical-engineers", name: "Mechanical Engineers & Technicians", q: "mechanical", image: IMG("1682144748274-add3d8ed04ea"), countries: "Saudi Arabia, UAE, Qatar, Kuwait", desc: "Industrial equipment, manufacturing and plant maintenance." },
  { slug: "cybersecurity", name: "Cybersecurity Specialists", q: "security", image: IMG("1661877737564-3dfd7282efcb"), countries: "UAE, Saudi Arabia, Bahrain", desc: "Security monitoring, cloud security, incident response and risk." },
  { slug: "data-analysts", name: "Data Analysts & Scientists", q: "data", image: IMG("1681487767138-ddf2d67b35c1"), countries: "UAE, Saudi Arabia, Qatar", desc: "Business intelligence, SQL, Power BI, Python and analytics." },
  { slug: "accountants", name: "Accountants & Auditors", q: "account", image: IMG("1679923813998-6603ee2466c5"), countries: "UAE, Saudi Arabia, Bahrain, Qatar", desc: "Financial reporting, audit, VAT, tax and accounting systems." },
  { slug: "project-managers", name: "Project Managers & Coordinators", q: "project", image: IMG("1661347859297-859b8ae1d7c5"), countries: "Saudi Arabia, UAE, Qatar", desc: "Construction, IT, operations and business transformation." },
  { slug: "welders", name: "Welders & Fabricators", q: "weld", image: IMG("1661872804795-03b899f61a53"), countries: "Saudi Arabia, Qatar, UAE, Oman", desc: "Oil & gas, manufacturing, pipelines and industrial projects." },
  { slug: "oil-gas", name: "Oil & Gas Technicians", q: "oil", image: IMG("1682148236159-fcc688022ac7"), countries: "Saudi Arabia, Qatar, Kuwait, Oman", desc: "Plant operations, instrumentation, process equipment and maintenance." },
  { slug: "sales-bizdev", name: "Sales & Business Development", q: "sales", image: IMG("1661371394983-42485fed3a58"), countries: "UAE, Saudi Arabia, Qatar", desc: "B2B sales, real estate, software and customer acquisition." },
  { slug: "digital-marketing", name: "Digital Marketing Specialists", q: "marketing", image: IMG("1661425715124-310ec1b49b8a"), countries: "UAE, Saudi Arabia", desc: "Paid ads, SEO, performance marketing and e-commerce." },
  { slug: "security-guards", name: "Security Guards", q: "guard", image: IMG("1682125948844-e2dc8996b0f0"), countries: "UAE, Saudi Arabia, Qatar", desc: "Commercial buildings, residential communities, retail and events." },
  { slug: "quantity-surveyors", name: "Quantity Surveyors & Estimators", q: "surveyor", image: IMG("1661335257817-4552acab9656"), countries: "Saudi Arabia, UAE, Qatar", desc: "Cost estimation, tendering, contracts and construction budgeting." },
  { slug: "ai-ml-engineers", name: "AI & Machine Learning Engineers", q: "AI", image: IMG("1683121710572-7723bd2e235d"), countries: "UAE, Saudi Arabia", desc: "AI applications, machine learning, automation and enterprise AI." },
  { slug: "automotive", name: "Automotive Technicians & Mechanics", q: "mechanic", image: IMG("1663090140645-32b7d760853e"), countries: "UAE, Saudi Arabia, Kuwait, Oman", desc: "Vehicle servicing, diagnostics and fleet maintenance." },
  { slug: "pharmacists", name: "Pharmacists & Lab Technicians", q: "pharmac", image: IMG("1663047392930-7c1c31d7b785"), countries: "UAE, Saudi Arabia, Qatar, Kuwait", desc: "Pharmacies, hospitals, laboratories and diagnostic services." },
  { slug: "cloud-devops", name: "Cloud & DevOps Engineers", q: "cloud", image: IMG("1740363268539-cd9093c3b5d1"), countries: "UAE, Saudi Arabia, Qatar, Bahrain", desc: "Cloud infrastructure, AWS/Azure, automation and reliability." },
];

/** Names for the profession dropdown, with Other last. */
export const CATEGORY_NAMES = JOB_CATEGORIES.map((c) => c.name);
export const OTHER_OPTION = "Other (specify)";
