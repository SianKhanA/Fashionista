import { catalogIsSample } from "./catalog";
import { RequestError } from "./http";
export function checkoutMode() {
  const mode = process.env.CHECKOUT_MODE || "disabled";
  if (mode === "sandbox" && process.env.SSLCOMMERZ_SANDBOX !== "false") return "sandbox";
  if (mode === "live" && !catalogIsSample && process.env.INVENTORY_READY === "true") return "live";
  return "disabled";
}
export function requireCheckout() {
  const mode = checkoutMode();
  if (mode === "disabled") throw new RequestError("We are preparing our collection. Online ordering is not open yet.", 503);
  return mode;
}
