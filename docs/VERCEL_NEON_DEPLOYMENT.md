# Vercel and Neon Deployment Notes

Project Fable is deployed as a demo/staging app on Vercel with Neon PostgreSQL. This is not an enterprise production deployment.

## Runtime Configuration

- Keep the Vercel Function region close to the Neon database region to reduce runtime latency.
- Use the Neon pooled connection URL for Vercel runtime `DATABASE_URL`.
- The pooled runtime URL usually contains the `-pooler` host.
- Store all environment variables in Vercel project settings, not in committed files.

## Prisma Migration Configuration

- Use a direct Neon connection URL for local Prisma migration work when needed.
- Do not run migrations through the pooled runtime connection unless the database provider explicitly supports that workflow.
- Review migration SQL before applying it to staging or production data.
- Keep `lib/generated/prisma` ignored; Vercel build runs `prisma generate` through the `build` script.

## Latency Notes

- Free or staging deployments can still have cold-start and runtime latency.
- Region alignment and pooled runtime connections reduce the delay but do not remove all platform cold starts.
- Treat slow first requests as a staging/demo limitation unless monitoring shows persistent latency.

## Demo/Staging Scope

- Production admin seed has been run for the deployed database.
- Demo data may need to be added intentionally before portfolio screenshots.
- This deployment is suitable for review and portfolio demo preparation, not enterprise production operations.
