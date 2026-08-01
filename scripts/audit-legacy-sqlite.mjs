import { existsSync, writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';

const databasePath = resolve(process.argv[2] ?? 'prisma/dev.db');
if (!existsSync(databasePath)) throw new Error(`SQLite não encontrado: ${databasePath}`);
const database = new DatabaseSync(databasePath, { readOnly: true });

const tables = database
  .prepare(
    "select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name"
  )
  .all()
  .map((row) => row.name);
const counts = Object.fromEntries(
  tables.map((table) => [
    table,
    Number(database.prepare(`select count(*) as count from "${table}"`).get().count)
  ])
);
const signatures = {
  numberedResidents: tables.includes('Resident')
    ? Number(
        database.prepare("select count(*) as count from Resident where name glob '*[0-9]*'").get()
          .count
      )
    : 0,
  deterministicPackageCodes: tables.includes('Package')
    ? Number(
        database
          .prepare("select count(*) as count from Package where packageCode like 'CLP-%'")
          .get().count
      )
    : 0,
  distinctResidentPhones: tables.includes('Resident')
    ? Number(database.prepare('select count(distinct phone) as count from Resident').get().count)
    : 0
};
const syntheticOnly =
  signatures.numberedResidents === counts.Resident &&
  signatures.deterministicPackageCodes === counts.Package &&
  signatures.distinctResidentPhones <= 1;
const report = {
  databasePath,
  readOnly: true,
  tables,
  counts,
  signatures,
  syntheticOnly,
  importRecommendation: syntheticOnly ? 'skip-synthetic-seed' : 'manual-review-required'
};

const exportIndex = process.argv.indexOf('--export');
if (exportIndex >= 0) {
  const target = process.argv[exportIndex + 1];
  if (!target) throw new Error('Informe o arquivo após --export.');
  if (syntheticOnly && !process.argv.includes('--allow-synthetic'))
    throw new Error(
      'Exportação bloqueada: a base contém somente seed sintético. Use --allow-synthetic apenas para teste explícito.'
    );
  const data = Object.fromEntries(
    tables.map((table) => [table, database.prepare(`select * from "${table}"`).all()])
  );
  writeFileSync(resolve(target), JSON.stringify({ report, data }, null, 2), {
    encoding: 'utf8',
    flag: 'wx'
  });
}

console.info(JSON.stringify(report, null, 2));
database.close();
