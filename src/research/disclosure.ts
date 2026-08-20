import { environment } from "@/src/config/environment";

export function displayCount(value: number, minimum = environment().DISCLOSURE_MIN_CELL) {
  return value > 0 && value < minimum ? `<${minimum}` : String(value);
}

export function suppressed(value: number, minimum = environment().DISCLOSURE_MIN_CELL) {
  return value > 0 && value < minimum;
}
