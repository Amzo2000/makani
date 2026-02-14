import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const constantsPath = path.join(root, "constants.ts");
const outputPath = path.join(root, "supabase", "seeds", "projects_seed.sql");

const source = fs.readFileSync(constantsPath, "utf8");
const match = source.match(/export const PROJECTS:\s*Project\[\]\s*=\s*(\[[\s\S]*?\n\]);/);

if (!match) {
  throw new Error("Unable to extract PROJECTS array from constants.ts");
}

const projects = Function(`"use strict"; return (${match[1]});`)();

const sqlString = (value) => `'${String(value).replace(/'/g, "''")}'`;
const sqlNullable = (value) => {
  if (value === null || value === undefined || value === "") return "NULL";
  return sqlString(value);
};
const sqlJsonb = (value) => `${sqlString(JSON.stringify(value))}::jsonb`;
const sqlTextArray = (value) => `ARRAY[${value.map((item) => sqlString(item)).join(", ")}]::text[]`;
const slugify = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const seenSlugs = new Map();
const makeUniqueSlug = (project) => {
  const base = slugify(project.title?.en || project.category || "project");
  const count = seenSlugs.get(base) ?? 0;
  seenSlugs.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
};

const rows = projects
  .map(
    (project) => `(
  ${sqlString(makeUniqueSlug(project))},
  ${sqlString(project.category)},
  ${sqlNullable(project.year)},
  ${sqlNullable(project.area)},
  ${sqlString(project.coverImage)},
  ${sqlTextArray(project.images)},
  true,
  ${sqlJsonb(project.title)},
  ${sqlJsonb(project.categoryLabel)},
  ${sqlJsonb(project.location)},
  ${sqlJsonb(project.status)},
  ${sqlJsonb(project.description)},
  ${sqlJsonb(project.concept)}
)`
  )
  .join(",\n");

const sql = `-- Seed SQL generated from constants.ts (frontend PROJECTS)
-- Paste into Supabase SQL Editor and run.
-- Optional cleanup first:
-- delete from public.projects;

insert into public.projects (
  slug,
  category,
  year,
  area,
  cover_image,
  images,
  published,
  title,
  category_label,
  location,
  status,
  description,
  concept
)
values
${rows}
;

-- Optional: assign admin role to an existing auth user by email.
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'you@example.com';
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sql, "utf8");
console.log(`Seed written to ${outputPath}`);
