import pg from 'pg';
import { readFileSync } from 'fs';

const sql = readFileSync('/Users/mikalaibury/works/global-church/supabase/004-add-table-grants.sql', 'utf-8');
const key = process.argv[2];
const ref = 'fwpzmccwgcuuocjdlnmo';
const user = `postgres.${ref}`;

const ssl = { rejectUnauthorized: false };

const configs = [
  ...['eu-west-1', 'eu-central-1', 'us-east-1', 'ap-southeast-1', 'ap-northeast-1'].map(r => ({
    name: r,
    config: {
      user, password: key, host: `aws-0-${r}.pooler.supabase.com`, port: 6543, database: 'postgres', ssl,
    },
  })),
  {
    name: 'direct',
    config: {
      user, password: key, host: `db.${ref}.supabase.co`, port: 5432, database: 'postgres', ssl,
    },
  },
];

for (const { name, config } of configs) {
  const client = new pg.Client(config);
  try {
    await client.connect();
    console.log(`Connected via ${name}`);
    await client.query(sql);
    console.log('Migration applied successfully');
    await client.end();
    process.exit(0);
  } catch (e) {
    console.log(`${name}: ${e.message}`);
  }
}

console.error('Could not connect to database');
process.exit(1);
