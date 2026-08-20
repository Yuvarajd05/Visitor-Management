export interface CountryDialCode {
  iso: string;
  name: string;
  dialCode: string;
}

/** Common dial codes for visitor phone entry. Default: India. */
export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { iso: "IN", name: "India", dialCode: "91" },
  { iso: "AF", name: "Afghanistan", dialCode: "93" },
  { iso: "AL", name: "Albania", dialCode: "355" },
  { iso: "DZ", name: "Algeria", dialCode: "213" },
  { iso: "AS", name: "American Samoa", dialCode: "1-684" },
  { iso: "AD", name: "Andorra", dialCode: "376" },
  { iso: "AO", name: "Angola", dialCode: "244" },
  { iso: "AI", name: "Anguilla", dialCode: "1-264" },
  { iso: "AG", name: "Antigua and Barbuda", dialCode: "1-268" },
  { iso: "AR", name: "Argentina", dialCode: "54" },
  { iso: "AM", name: "Armenia", dialCode: "374" },
  { iso: "AW", name: "Aruba", dialCode: "297" },
  { iso: "AU", name: "Australia", dialCode: "61" },
  { iso: "AT", name: "Austria", dialCode: "43" },
  { iso: "AZ", name: "Azerbaijan", dialCode: "994" },
  { iso: "BH", name: "Bahrain", dialCode: "973" },
  { iso: "BD", name: "Bangladesh", dialCode: "880" },
  { iso: "BY", name: "Belarus", dialCode: "375" },
  { iso: "BE", name: "Belgium", dialCode: "32" },
  { iso: "BZ", name: "Belize", dialCode: "501" },
  { iso: "BJ", name: "Benin", dialCode: "229" },
  { iso: "BT", name: "Bhutan", dialCode: "975" },
  { iso: "BO", name: "Bolivia", dialCode: "591" },
  { iso: "BA", name: "Bosnia and Herzegovina", dialCode: "387" },
  { iso: "BW", name: "Botswana", dialCode: "267" },
  { iso: "BR", name: "Brazil", dialCode: "55" },
  { iso: "BN", name: "Brunei", dialCode: "673" },
  { iso: "BG", name: "Bulgaria", dialCode: "359" },
  { iso: "KH", name: "Cambodia", dialCode: "855" },
  { iso: "CM", name: "Cameroon", dialCode: "237" },
  { iso: "CA", name: "Canada", dialCode: "1" },
  { iso: "CL", name: "Chile", dialCode: "56" },
  { iso: "CN", name: "China", dialCode: "86" },
  { iso: "CO", name: "Colombia", dialCode: "57" },
  { iso: "CR", name: "Costa Rica", dialCode: "506" },
  { iso: "HR", name: "Croatia", dialCode: "385" },
  { iso: "CU", name: "Cuba", dialCode: "53" },
  { iso: "CY", name: "Cyprus", dialCode: "357" },
  { iso: "CZ", name: "Czech Republic", dialCode: "420" },
  { iso: "DK", name: "Denmark", dialCode: "45" },
  { iso: "EG", name: "Egypt", dialCode: "20" },
  { iso: "EE", name: "Estonia", dialCode: "372" },
  { iso: "ET", name: "Ethiopia", dialCode: "251" },
  { iso: "FJ", name: "Fiji", dialCode: "679" },
  { iso: "FI", name: "Finland", dialCode: "358" },
  { iso: "FR", name: "France", dialCode: "33" },
  { iso: "GE", name: "Georgia", dialCode: "995" },
  { iso: "DE", name: "Germany", dialCode: "49" },
  { iso: "GH", name: "Ghana", dialCode: "233" },
  { iso: "GR", name: "Greece", dialCode: "30" },
  { iso: "HK", name: "Hong Kong", dialCode: "852" },
  { iso: "HU", name: "Hungary", dialCode: "36" },
  { iso: "IS", name: "Iceland", dialCode: "354" },
  { iso: "ID", name: "Indonesia", dialCode: "62" },
  { iso: "IR", name: "Iran", dialCode: "98" },
  { iso: "IQ", name: "Iraq", dialCode: "964" },
  { iso: "IE", name: "Ireland", dialCode: "353" },
  { iso: "IL", name: "Israel", dialCode: "972" },
  { iso: "IT", name: "Italy", dialCode: "39" },
  { iso: "JM", name: "Jamaica", dialCode: "1-876" },
  { iso: "JP", name: "Japan", dialCode: "81" },
  { iso: "JO", name: "Jordan", dialCode: "962" },
  { iso: "KZ", name: "Kazakhstan", dialCode: "7" },
  { iso: "KE", name: "Kenya", dialCode: "254" },
  { iso: "KW", name: "Kuwait", dialCode: "965" },
  { iso: "KG", name: "Kyrgyzstan", dialCode: "996" },
  { iso: "LA", name: "Laos", dialCode: "856" },
  { iso: "LV", name: "Latvia", dialCode: "371" },
  { iso: "LB", name: "Lebanon", dialCode: "961" },
  { iso: "LY", name: "Libya", dialCode: "218" },
  { iso: "LT", name: "Lithuania", dialCode: "370" },
  { iso: "LU", name: "Luxembourg", dialCode: "352" },
  { iso: "MO", name: "Macau", dialCode: "853" },
  { iso: "MY", name: "Malaysia", dialCode: "60" },
  { iso: "MV", name: "Maldives", dialCode: "960" },
  { iso: "MT", name: "Malta", dialCode: "356" },
  { iso: "MX", name: "Mexico", dialCode: "52" },
  { iso: "MD", name: "Moldova", dialCode: "373" },
  { iso: "MN", name: "Mongolia", dialCode: "976" },
  { iso: "MA", name: "Morocco", dialCode: "212" },
  { iso: "MM", name: "Myanmar", dialCode: "95" },
  { iso: "NP", name: "Nepal", dialCode: "977" },
  { iso: "NL", name: "Netherlands", dialCode: "31" },
  { iso: "NZ", name: "New Zealand", dialCode: "64" },
  { iso: "NG", name: "Nigeria", dialCode: "234" },
  { iso: "KP", name: "North Korea", dialCode: "850" },
  { iso: "NO", name: "Norway", dialCode: "47" },
  { iso: "OM", name: "Oman", dialCode: "968" },
  { iso: "PK", name: "Pakistan", dialCode: "92" },
  { iso: "PS", name: "Palestine", dialCode: "970" },
  { iso: "PA", name: "Panama", dialCode: "507" },
  { iso: "PG", name: "Papua New Guinea", dialCode: "675" },
  { iso: "PY", name: "Paraguay", dialCode: "595" },
  { iso: "PE", name: "Peru", dialCode: "51" },
  { iso: "PH", name: "Philippines", dialCode: "63" },
  { iso: "PL", name: "Poland", dialCode: "48" },
  { iso: "PT", name: "Portugal", dialCode: "351" },
  { iso: "QA", name: "Qatar", dialCode: "974" },
  { iso: "RO", name: "Romania", dialCode: "40" },
  { iso: "RU", name: "Russia", dialCode: "7" },
  { iso: "SA", name: "Saudi Arabia", dialCode: "966" },
  { iso: "SN", name: "Senegal", dialCode: "221" },
  { iso: "RS", name: "Serbia", dialCode: "381" },
  { iso: "SG", name: "Singapore", dialCode: "65" },
  { iso: "SK", name: "Slovakia", dialCode: "421" },
  { iso: "SI", name: "Slovenia", dialCode: "386" },
  { iso: "ZA", name: "South Africa", dialCode: "27" },
  { iso: "KR", name: "South Korea", dialCode: "82" },
  { iso: "ES", name: "Spain", dialCode: "34" },
  { iso: "LK", name: "Sri Lanka", dialCode: "94" },
  { iso: "SE", name: "Sweden", dialCode: "46" },
  { iso: "CH", name: "Switzerland", dialCode: "41" },
  { iso: "SY", name: "Syria", dialCode: "963" },
  { iso: "TW", name: "Taiwan", dialCode: "886" },
  { iso: "TJ", name: "Tajikistan", dialCode: "992" },
  { iso: "TZ", name: "Tanzania", dialCode: "255" },
  { iso: "TH", name: "Thailand", dialCode: "66" },
  { iso: "TR", name: "Turkey", dialCode: "90" },
  { iso: "TM", name: "Turkmenistan", dialCode: "993" },
  { iso: "UG", name: "Uganda", dialCode: "256" },
  { iso: "UA", name: "Ukraine", dialCode: "380" },
  { iso: "AE", name: "United Arab Emirates", dialCode: "971" },
  { iso: "GB", name: "United Kingdom", dialCode: "44" },
  { iso: "US", name: "United States", dialCode: "1" },
  { iso: "UY", name: "Uruguay", dialCode: "598" },
  { iso: "UZ", name: "Uzbekistan", dialCode: "998" },
  { iso: "VE", name: "Venezuela", dialCode: "58" },
  { iso: "VN", name: "Vietnam", dialCode: "84" },
  { iso: "YE", name: "Yemen", dialCode: "967" },
  { iso: "ZM", name: "Zambia", dialCode: "260" },
  { iso: "ZW", name: "Zimbabwe", dialCode: "263" },
];

export const DEFAULT_COUNTRY_ISO = "IN";

export function getCountryFlag(iso: string): string {
  return iso
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

export function getCountryByIso(iso: string): CountryDialCode | undefined {
  return COUNTRY_DIAL_CODES.find((country) => country.iso === iso);
}

/** Digits only dial code (e.g. "1684" from "1-684"). */
export function normalizeDialCode(dialCode: string): string {
  return dialCode.replace(/\D/g, "");
}

export function formatDialCodeLabel(dialCode: string): string {
  return `+${dialCode}`;
}

export interface ParsedPhone {
  country: CountryDialCode;
  nationalNumber: string;
  e164: string;
}

function sortedByDialLength(): CountryDialCode[] {
  return [...COUNTRY_DIAL_CODES].sort(
    (a, b) =>
      normalizeDialCode(b.dialCode).length - normalizeDialCode(a.dialCode).length,
  );
}

/**
 * Parse stored phone into country + national number.
 * Legacy bare 10-digit numbers are treated as India (+91).
 */
export function parsePhoneValue(value: string | undefined | null): ParsedPhone {
  const india = getCountryByIso(DEFAULT_COUNTRY_ISO)!;
  const raw = (value ?? "").trim();

  if (!raw) {
    return { country: india, nationalNumber: "", e164: "" };
  }

  const digits = raw.replace(/\D/g, "");

  if (/^\d{10}$/.test(digits) && !raw.startsWith("+")) {
    return {
      country: india,
      nationalNumber: digits,
      e164: `+91${digits}`,
    };
  }

  const withPlus = raw.startsWith("+") ? digits : digits;

  for (const country of sortedByDialLength()) {
    const code = normalizeDialCode(country.dialCode);
    if (withPlus.startsWith(code) && withPlus.length > code.length) {
      const nationalNumber = withPlus.slice(code.length);
      return {
        country,
        nationalNumber,
        e164: `+${code}${nationalNumber}`,
      };
    }
  }

  return {
    country: india,
    nationalNumber: digits,
    e164: digits ? `+91${digits}` : "",
  };
}

export function buildE164(dialCode: string, nationalNumber: string): string {
  const code = normalizeDialCode(dialCode);
  const national = nationalNumber.replace(/\D/g, "");
  if (!national) {
    return "";
  }
  return `+${code}${national}`;
}

export function isValidPhoneValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  // Legacy India mobile
  if (/^\d{10}$/.test(trimmed)) {
    return true;
  }

  const parsed = parsePhoneValue(trimmed);
  if (!parsed.nationalNumber) {
    return false;
  }

  if (parsed.country.iso === "IN") {
    return /^\d{10}$/.test(parsed.nationalNumber);
  }

  const e164Digits = parsed.e164.replace(/\D/g, "");
  return (
    /^\d{6,12}$/.test(parsed.nationalNumber) &&
    e164Digits.length >= 8 &&
    e164Digits.length <= 15
  );
}

export function nationalNumberMaxLength(iso: string): number {
  return iso === "IN" ? 10 : 12;
}

/**
 * Digit-only variants for looking up phones stored with or without country code.
 * Example: "919876543210" → also searches "9876543210" (legacy India rows).
 */
export function phoneLookupDigitVariants(rawDigits: string): string[] {
  const digits = rawDigits.replace(/\D/g, "");
  if (digits.length < 4) {
    return [];
  }

  const variants = new Set<string>([digits]);

  if (digits.startsWith("91") && digits.length > 10) {
    variants.add(digits.slice(2));
  }

  if (digits.length > 10) {
    variants.add(digits.slice(-10));
  }

  return Array.from(variants).filter((value) => value.length >= 4);
}

/** True when two phone values refer to the same number (with/without +91). */
export function phonesMatch(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const a = (left ?? "").replace(/\D/g, "");
  const b = (right ?? "").replace(/\D/g, "");
  if (!a || !b) {
    return false;
  }
  if (a === b) {
    return true;
  }
  if (a.length >= 10 && b.length >= 10) {
    return a.slice(-10) === b.slice(-10);
  }
  return a.endsWith(b) || b.endsWith(a);
}
