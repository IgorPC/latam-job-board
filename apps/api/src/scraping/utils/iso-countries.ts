// ISO 3166-1 alpha-2 -> English name, for countries that commonly appear in
// JobPosting JSON-LD `applicantLocationRequirements` blocks. Not exhaustive;
// unknown codes are passed through as-is by `isoToCountryName`.
const ISO_COUNTRY_NAMES: Record<string, string> = {
  AR: 'Argentina', BO: 'Bolivia', BR: 'Brazil', CL: 'Chile', CO: 'Colombia',
  CR: 'Costa Rica', CU: 'Cuba', DO: 'Dominican Republic', EC: 'Ecuador',
  SV: 'El Salvador', GT: 'Guatemala', HN: 'Honduras', MX: 'Mexico',
  NI: 'Nicaragua', PA: 'Panama', PY: 'Paraguay', PE: 'Peru', UY: 'Uruguay',
  VE: 'Venezuela',
  US: 'United States', CA: 'Canada', GB: 'United Kingdom', UK: 'United Kingdom',
  IE: 'Ireland', DE: 'Germany', FR: 'France', ES: 'Spain', PT: 'Portugal',
  IT: 'Italy', NL: 'Netherlands', PL: 'Poland', RO: 'Romania',
  IN: 'India', PH: 'Philippines', PK: 'Pakistan', NG: 'Nigeria', KE: 'Kenya',
  ZA: 'South Africa', EG: 'Egypt', AU: 'Australia', NZ: 'New Zealand',
  SG: 'Singapore', AE: 'United Arab Emirates',
};

export function isoToCountryName(code: string): string {
  return ISO_COUNTRY_NAMES[code.toUpperCase()] ?? code;
}
