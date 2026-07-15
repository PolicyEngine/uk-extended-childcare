/**
 * Accessors for the uk_extended_childcare_results.json payload.
 *
 * Deliberately no fallbacks: if a field is missing the consumer throws visibly
 * rather than rendering placeholders.
 */

export function getBaseline(data) {
  return data.baseline;
}

export function getReform(data) {
  return data.reform;
}

export function getUniversalExtension(data) {
  return data.reform.universal_extension;
}

export function getCostCap(data) {
  return data.reform.cost_cap;
}

export function getTakeup(data) {
  return data.reform.universal_extension.takeup;
}

export function getMethods(data) {
  return data.methods;
}

export function getDistribution(data) {
  return data.reform.distribution;
}

export function getPrograms(data) {
  return data.programs;
}

export function getReported(data) {
  return data.reported;
}

export function getSettings(data) {
  return data.settings;
}
