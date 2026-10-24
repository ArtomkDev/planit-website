import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateContentPages } from '../src/lib/content-page-schema.mjs';

const slug = process.argv[2];
const file = fileURLToPath(new URL('../src/content/pages.json',import.meta.url));
const temporary = `${file}.${process.pid}.tmp`;
try {
  if(process.argv.length !== 3) throw new Error('Usage: npm run page:new -- page-slug');
  const original = await readFile(file,'utf8');
  const pages = JSON.parse(original);
  const empty = () => ({title:'',description:'',heading:'',intro:'',sections:[{heading:'',paragraphs:['']}]});
  pages.push({slug,published:false,updatedAt:new Date().toISOString().slice(0,10),locales:{uk:empty(),en:empty()}});
  validateContentPages(pages);
  try { await readFile(new URL(`../src/app/[locale]/${slug}/page.tsx`,import.meta.url)); throw new Error(`A custom route already uses ${slug}.`); } catch(error) { if(error.code !== 'ENOENT') throw error; }
  await writeFile(temporary,JSON.stringify(pages,null,2)+'\n',{flag:'wx'});
  if(await readFile(file,'utf8') !== original) throw new Error('pages.json changed during creation; run the command again.');
  await rename(temporary,file);
  console.log(`Created draft ${slug} in src/content/pages.json. Fill uk/en content, set published to true, then run npm run site:update.`);
} catch(error) { await unlink(temporary).catch(()=>undefined); console.error(error.message); process.exitCode=1; }
