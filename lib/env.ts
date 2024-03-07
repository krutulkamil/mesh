import { z } from 'zod';

const envVariablesSchema = z.object({
  CONVEX_DEPLOYMENT: z.string(),
  NEXT_PUBLIC_CONVEX_URL: z.string(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
});

envVariablesSchema.parse(process.env);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariablesSchema> {}
  }
}
