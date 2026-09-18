import {
  adminSuspendCompany,
  adminReinstateCompany,
  type Company,
} from "@/lib/api/companies";
import type { StepUpCreds } from "./StepUpDialog";

/**
 * Suspend or reinstate a company from one set of step-up credentials.
 *
 * The two endpoints do not take the same body. Suspend carries a reason,
 * reinstate has no use for one, and neither accepts a StepUpCreds as it
 * stands, so the fields have to be picked out by hand. The queue's row
 * action and the drawer's own button raise the same StepUpDialog, and each
 * was doing that picking separately in fifteen identical lines.
 *
 * Compare the admin-member endpoints, which take the creds object whole and
 * so left AdminTeam with nothing to duplicate. The duplication here was the
 * shape of the API surface showing through, not two screens disagreeing.
 */
export const applyCompanyStanding = (
  companyId: string,
  action: "suspend" | "reinstate",
  creds: StepUpCreds,
): Promise<Company> =>
  action === "suspend"
    ? adminSuspendCompany(companyId, {
        reason: creds.reason,
        password: creds.password,
        totp_code: creds.totp_code,
      })
    : adminReinstateCompany(companyId, {
        password: creds.password,
        totp_code: creds.totp_code,
      });
