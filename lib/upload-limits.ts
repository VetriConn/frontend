/**
 * Client-side byte ceilings, mirroring backend/src/config/constants.ts:10-12.
 *
 * One ceiling per asset, written once, so no call site invents its own the
 * way MAX_ASSET_BYTES did. Each name says which server constant it copies,
 * because these are only useful while they still agree with the server: a
 * client limit below the real one turns a legal upload into a refusal, and
 * one above it turns a refusal into a wasted upload the user waits through.
 *
 * They are a courtesy, never enforcement. multer applies the real ones.
 */

/** backend MAX_FILE_SIZE_PROFILE_PIC */
export const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
/** backend MAX_FILE_SIZE_COMPANY_LOGO */
export const MAX_COMPANY_LOGO_BYTES = 3 * 1024 * 1024;
/** backend MAX_FILE_SIZE_COMPANY_BANNER */
export const MAX_COMPANY_BANNER_BYTES = 8 * 1024 * 1024;
