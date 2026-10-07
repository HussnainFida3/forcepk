export type Locale = "en" | "ar" | "ur";
export const LOCALES: { code: Locale; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "ur", label: "اردو", dir: "rtl" },
];

export function dirFor(l: Locale): "ltr" | "rtl" {
  return l === "en" ? "ltr" : "rtl";
}

type Dict = Record<string, { en: string; ar: string; ur: string }>;

export const dict: Dict = {
  "nav.home": { en: "Home", ar: "الرئيسية", ur: "ہوم" },
  "nav.jobs": { en: "Find Jobs", ar: "الوظائف", ur: "ملازمتیں" },
  "nav.employers": { en: "Hire Manpower", ar: "توظيف العمالة", ur: "افرادی قوت" },
  "nav.partners": { en: "Partners", ar: "الشركاء", ur: "شراکت دار" },
  "nav.about": { en: "About", ar: "من نحن", ur: "تعارف" },
  "nav.login": { en: "Login", ar: "تسجيل الدخول", ur: "لاگ ان" },
  "nav.signup": { en: "Sign Up", ar: "إنشاء حساب", ur: "رجسٹر" },
  "nav.post": { en: "Post Requirement", ar: "نشر طلب", ur: "ضرورت درج کریں" },
  "hero.badge": { en: "🌍 Global Workforce Platform", ar: "🌍 منصة القوى العاملة العالمية", ur: "🌍 عالمی افرادی قوت پلیٹ فارم" },
  "hero.title1": { en: "Hire Verified", ar: "وظّف عمالة", ur: "تصدیق شدہ" },
  "hero.title2": { en: "Global Talent", ar: "عالمية موثوقة", ur: "عالمی ٹیلنٹ" },
  "hero.title3": { en: ", Anywhere", ar: " في أي مكان", ur: " ہر جگہ حاصل کریں" },
  "hero.sub": {
    en: "Skilled, semi-skilled and professional manpower for employers worldwide — sourced, screened and deployed through a trusted recruitment partner network.",
    ar: "عمالة ماهرة وشبه ماهرة ومحترفة لأصحاب العمل في جميع أنحاء العالم — يتم توفيرها وفحصها ونشرها عبر شبكة شركاء توظيف موثوقة.",
    ur: "دنیا بھر کے آجروں کے لیے ہنر مند، نیم ہنر مند اور پیشہ ور افرادی قوت — ایک قابل اعتماد نیٹ ورک کے ذریعے منتخب، جانچ اور تعینات کی جاتی ہے۔",
  },
  "hero.cta1": { en: "Post Manpower Requirement", ar: "نشر طلب العمالة", ur: "افرادی قوت کی درخواست" },
  "hero.cta2": { en: "Explore Available Talent", ar: "استكشف المواهب المتاحة", ur: "دستیاب ٹیلنٹ دیکھیں" },
};

export function t(key: string, locale: Locale): string {
  const e = dict[key];
  return e ? e[locale] : key;
}
