// Regenera src/lib/supabase/database.types.ts a partir do schema "givance".
// Requer: `npx supabase login` uma vez e SUPABASE_PROJECT_REF no .env.local.
// O schema precisa estar exposto em Project Settings > Data API > Exposed schemas.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

let ref = process.env.SUPABASE_PROJECT_REF;
if (!ref) {
  try {
    ref = readFileSync(".env.local", "utf8").match(/^SUPABASE_PROJECT_REF=(.+)$/m)?.[1]?.trim();
  } catch {}
}
if (!ref) {
  console.error("Defina SUPABASE_PROJECT_REF no .env.local");
  process.exit(1);
}

const types = execSync(`npx --yes supabase gen types typescript --project-id ${ref} --schema givance`, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});

const helpers = `
type GivanceSchema = Database["givance"]
export type Tables<T extends keyof GivanceSchema["Tables"]> = GivanceSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof GivanceSchema["Tables"]> = GivanceSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof GivanceSchema["Tables"]> = GivanceSchema["Tables"][T]["Update"]
`;
// O gerador já exporta Tables/TablesInsert genéricos; trocamos pelos do schema givance.
const cleaned = types.split("\nexport type Tables<")[0];
writeFileSync("src/lib/supabase/database.types.ts", cleaned + helpers);
console.log("Tipos atualizados.");
