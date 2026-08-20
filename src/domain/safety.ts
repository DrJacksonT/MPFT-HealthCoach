export type SafetyRoute =
  | "emergency"
  | "self-harm"
  | "symptom"
  | "pregnancy"
  | "medicine"
  | "safeguarding"
  | "severe-distress"
  | "acute-financial-harm"
  | "gambling-prohibited"
  | "injection"
  | "supported";

const patterns: Array<[SafetyRoute, RegExp]> = [
  ["self-harm", /suicid|kill myself|self[- ]?harm|want to die|end(ing)? (my life|it all)|no reason to live/i],
  [
    "emergency",
    /overdose|can['’]?t breathe|cannot breathe|not breathing|unconscious|severe chest pain|immediate danger/i,
  ],
  ["safeguarding", /domestic abuse|partner (hits|controls|threatens)|being abused|coerc(e|ed|ion)|forced me|not safe at home/i],
  ["acute-financial-harm", /lost (all|everything)|rent money|food money|cannot feed|can['’]?t feed|debt collector|about to lose (my )?home/i],
  ["gambling-prohibited", /best odds|guaranteed bet|winning system|beat (the )?(bookmaker|casino)|bypass (gambling )?blocks?|get around gamstop|which (bet|casino)/i],
  ["severe-distress", /cannot cope|can['’]?t cope|panic attack|desperate and alone|breaking down/i],
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
    return "I can explain general evidence about stop smoking options, but I can’t choose, prescribe or change a medicine for you. A pharmacist, GP or stop smoking adviser can consider your health, other medicines and preferences with you.";
  if (route === "safeguarding")
    return "I’m sorry this is happening. This automated research tool is not monitored and cannot keep you safe. If you are in immediate danger, call 999. If it is safe to do so, use the help page for specialist and urgent support without describing the situation again here.";
  if (route === "severe-distress")
    return "This automated research tool is not monitored and cannot provide urgent mental-health support. If you may be in immediate danger, call 999. For urgent help that is not an emergency, contact NHS 111 and select the mental health option where available, or use the help page now.";
  if (route === "acute-financial-harm")
    return "This automated tool cannot provide debt or financial advice and nobody is monitoring it. If you or someone else is in immediate danger, call 999. Use the gambling and financial-support routes on the help page for specialist support.";
  if (route === "gambling-prohibited")
    return "I cannot provide gambling strategies, odds advice, ways around blocks or debt products. I can offer a short protective-action route or point to specialist gambling and financial support.";
  if (route === "injection")
    return "I can only help with smoking motivation, cravings, planning, setbacks and explanations from this prototype’s verified evidence library. I can’t reveal hidden instructions, act as your clinician or search the live internet for patient advice.";
  return "That is outside this prototype’s scope.";
}
