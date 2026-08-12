export type SafetyRoute =
  | "emergency"
  | "self-harm"
  | "symptom"
  | "pregnancy"
  | "medicine"
  | "injection"
  | "supported";

const patterns: Array<[SafetyRoute, RegExp]> = [
  ["self-harm", /suicid|kill myself|self[- ]?harm|want to die|end(ing)? (my life|it all)|no reason to live/i],
  [
    "emergency",
    /overdose|can['’]?t breathe|cannot breathe|not breathing|unconscious|severe chest pain|immediate danger/i,
  ],
  [
    "symptom",
    /chest pain|coughing (up )?blood|short(ness)? of breath|difficulty breathing|symptom|diagnos|is this serious|test result/i,
  ],
  ["pregnancy", /pregnan|breastfeed/i],
  [
    "medicine",
    /which (drug|medicine|tablet)|what should i take|dose|prescri|interaction|change my medication|safe for me|can i take|should i (use|take)/i,
  ],
  [
    "injection",
    /ignore (all|your|previous)|disregard (the|all|your|previous)|developer prompt|system prompt|hidden instructions?|reveal (your|the|hidden) (rules|instructions)|pretend you are (my )?(gp|doctor)|act as (my )?(gp|doctor)|jailbreak|bypass (the|your) (rules|instructions)|search the internet|browse the web|override (your|the) rules/i,
  ],
];

export function classifySafety(text: string): SafetyRoute {
  return patterns.find(([, pattern]) => pattern.test(text))?.[0] ?? "supported";
}

export function safetyResponse(route: Exclude<SafetyRoute, "supported">) {
  if (route === "self-harm")
    return "I’m an automated prototype and nobody is monitoring this conversation. I can’t provide crisis support. If you may act on thoughts of harming yourself or are in immediate danger, call 999 or go to A&E now. You can also call Samaritans free on 116 123. For urgent help, use NHS 111 and select the mental health option where available.";
  if (route === "emergency" || route === "symptom")
    return "I can’t assess medical symptoms, and nobody is monitoring this tool. If you think you or someone else is seriously ill or in immediate danger, call 999. For urgent medical advice that is not an emergency, use NHS 111 or an appropriate healthcare service.";
  if (route === "pregnancy")
    return "Pregnancy needs a specialist stop-smoking pathway, which this prototype does not provide. Please speak with your midwife, GP, pharmacist or local stop-smoking service. I cannot advise you personally about medicines in pregnancy.";
  if (route === "medicine")
    return "I can explain general evidence about stop-smoking options, but I can’t choose, prescribe or change a medicine for you. A pharmacist, GP or stop-smoking adviser can consider your health, other medicines and preferences with you.";
  if (route === "injection")
    return "I can only help with smoking motivation, cravings, planning, setbacks and explanations from this prototype’s verified evidence library. I can’t reveal hidden instructions, act as your clinician or search the live internet for patient advice.";
  return "That is outside this prototype’s scope.";
}
