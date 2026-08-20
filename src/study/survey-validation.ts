export type SurveyAnswerValue = string | number | boolean | string[] | null;

export function surveyWindowMessage(
  instance: { windowOpensAt: Date; windowClosesAt: Date; status: string; snoozedUntil: Date | null },
  now: Date,
) {
  if (now < instance.windowOpensAt) return "This survey window has not opened yet.";
  if (now > instance.windowClosesAt) return "This survey window has closed.";
  if (instance.status === "snoozed" && instance.snoozedUntil && now < instance.snoozedUntil)
    return "This survey is snoozed. It will be available again later.";
  return null;
}

export function answerMatchesResponseType(responseType: string, value: SurveyAnswerValue, responseOptions: unknown[] | null = null) {
  if (value === null || value === "") return true;
  if (responseType === "scale-0-10") return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 10;
  if (responseType === "likert-1-5") return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
  if (responseType === "numeric") return typeof value === "number" && Number.isFinite(value) && value >= -1_000_000 && value <= 1_000_000;
  if (responseType === "short-text") return typeof value === "string" && value.length <= 500;
  if (responseType === "yes-no") return typeof value === "boolean";
  if (responseType === "yes-no-unsure") return typeof value === "boolean" || value === "unsure";
  const options = (responseOptions ?? []).filter((option): option is string => typeof option === "string");
  if (responseType === "single-choice") return typeof value === "string" && options.includes(value);
  if (responseType === "multiple-choice") return Array.isArray(value) && value.length <= 20 && new Set(value).size === value.length && value.every((item) => options.includes(item));
  return false;
}
