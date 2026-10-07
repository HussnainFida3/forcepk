// Central, verified image set (royalty-free Unsplash + randomuser portraits).
const U = (id: string, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;

export const HERO = {
  heroBg: U("1541888946425-d81bb19240f5", 1920),
  heroEmployers: U("1702468049239-49fd1cf99d20", 1920),
  heroJobs: U("1771101961231-2f1daf94473e", 1920),
  heroPartners: U("1587582423116-ec07293f0395", 1920),
  skyline: U("1582719478250-c89cae4dc85b", 1600),
  site: U("1590674899484-d5640e854abe", 1600),
  dubai: U("1518684079-3c830dcef090", 1600),
  building: U("1486406146926-c627a92ad1ab", 1400),
  team: U("1600880292089-90a7e086ee0c", 1200),
  workers: U("1504328345606-18bbc8c9d7d1", 1100),
  engineers: U("1529390079861-591de354faf5", 1100),
};

// Category tiles (10 manpower categories)
export const CATEGORY_IMG: Record<string, string> = {
  Construction: U("1504307651254-35680f356dfd"),
  Electrical: U("1621905251189-08b45d6a269e"),
  HVAC: U("1581094794329-c8112a89af12"),
  Welding: U("1591955506264-3f5a6834570a"),
  "Heavy Equipment": U("1577415124269-fc1140a69e91"),
  Drivers: U("1601584115197-04ecc0da31d7"),
  Engineering: U("1581092160562-40aa08e78837"),
  Industrial: U("1565793298595-6a879b1d9492"),
  Healthcare: U("1559839734-2b71ea197ec2"),
  Facilities: U("1587560699334-cc4ff634909a"),
};

// Job thumbnails by profession keyword
export const JOB_IMG: Record<string, string> = {
  Electrician: U("1621905251189-08b45d6a269e", 400),
  "Mechanical Technician": U("1565793298595-6a879b1d9492", 400),
  "Heavy Vehicle Driver": U("1601584115197-04ecc0da31d7", 400),
  "Civil Site Engineer": U("1581092160562-40aa08e78837", 400),
  "Warehouse Supervisor": U("1558618666-fcd25c85cd64", 400),
  "HVAC Technician": U("1581094794329-c8112a89af12", 400),
  "Structural Welder (6G)": U("1591955506264-3f5a6834570a", 400),
  Plumber: U("1587560699334-cc4ff634909a", 400),
};
export const jobImg = (title: string) =>
  JOB_IMG[title] ?? U("1590674899484-d5640e854abe", 400);

export const avatar = (gender: "men" | "women", n: number) =>
  `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;
