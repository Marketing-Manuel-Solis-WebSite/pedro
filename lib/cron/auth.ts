/**
 * Validate the Authorization header for cron endpoints.
 * Vercel sends `Authorization: Bearer <CRON_SECRET>` on cron invocations.
 */
export function validateCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "");
  if (!token || !process.env.CRON_SECRET) return false;

  return token === process.env.CRON_SECRET;
}
