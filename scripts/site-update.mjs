import { spawn } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readSiteConfig, verifyVerificationFiles, assertRouteContinuity } from './lib/site-seo.mjs';

const root = fileURLToPath(new URL('../',import.meta.url));

export async function runSteps(steps, execute) {
  for(const step of steps) await execute(step);
}

export function parseOptions(args) {
  const options = {};
  const flags = {'--check':'check','--skip-build':'skipBuild','--no-sync-legal':'noSyncLegal'};
  const values = {'--channel':'channel','--expires':'expires','--account':'account','--project':'project','--target':'target','--legal-source':'legalSource'};
  for(let index=0;index<args.length;index++) {
    const argument=args[index];
    if(flags[argument]) options[flags[argument]]=true;
    else if(values[argument] && args[index+1] && !args[index+1].startsWith('--')) options[values[argument]]=args[++index];
    else throw new Error(`Unknown or incomplete option ${argument}. Use --check for local validation without publishing.`);
  }
  if(options.skipBuild && options.legalSource) throw new Error('Legal synchronization requires a new build. Remove --skip-build.');
  if(options.channel && !/^[a-z0-9][a-z0-9-]{0,39}$/.test(options.channel)) throw new Error('Use a lowercase Firebase preview channel name.');
  return options;
}

export function previewUrl(result, siteId) {
  const matches=[];
  function visit(value) {
    if(!value || typeof value !== 'object') return;
    for(const [key,child] of Object.entries(value)) {
      if(key==='url' && typeof child==='string') {
        const url=new URL(child);
        if(url.protocol==='https:' && url.hostname.startsWith(siteId+'--') && url.hostname.endsWith('.web.app')) matches.push(url.origin);
      } else if(typeof child==='object') visit(child);
    }
  }
  visit(result);
  const unique=[...new Set(matches)];
  if(unique.length!==1) throw new Error('Preview deployed, but its URL could not be identified. Verify the Firebase output before using it.');
  return unique[0];
}

async function runNode(args, capture=false) {
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd:root,stdio:['ignore',capture?'pipe':'inherit','inherit'],env:process.env});
    let output='';
    if(capture) child.stdout.on('data',chunk=>{output+=chunk;});
    child.once('error',reject);
    child.once('exit',code=>code===0?resolve(output):reject(new Error(`${args[0]} failed (exit ${code}). Release stopped.`)));
  });
}

async function npm(script) {
  // npm supplies its own CLI path to every npm run script, including on Windows.
  if(!process.env.npm_execpath) throw new Error('Start this workflow with npm run site:update or npm run site:check.');
  console.log(`\n[site] ${script}`);
  await runNode([process.env.npm_execpath,'run',script]);
}

async function previousRoutes(origin) {
  const response=await fetch(origin+'/seo-manifest.json',{cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(response.ok) {
    const manifest=await response.json();
    if(manifest.version!==1 || !Array.isArray(manifest.pages)) throw new Error('Published SEO inventory is invalid; inspect the live release before deploying.');
    return manifest.pages.map(page=>page.path);
  }
  if(response.status!==404) throw new Error(`Cannot read published SEO inventory: HTTP ${response.status}.`);
  const sitemap=await fetch(origin+'/sitemap.xml',{cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(!sitemap.ok) throw new Error(`Cannot read published sitemap: HTTP ${sitemap.status}.`);
  const paths=[...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(([,value])=>{
    const url=new URL(value);
    if(url.origin!==origin) throw new Error('Published sitemap points at another origin. Inspect it before publishing.');
    return url.pathname.replace(/\/$/,'')||'/';
  });
  if(!paths.length) throw new Error('Published sitemap has no pages. Inspect the live site before publishing.');
  return paths;
}

export async function updateSite(options) {
  const config=await readSiteConfig(root);
  for(const key of ['project','target']) if(options[key] && options[key]!==config.hosting[key]) throw new Error(`The ${key} must match site.config.json. This workflow only publishes the website target.`);
  const account=options.account || config.hosting.account;
  const firebase=JSON.parse(await readFile(path.join(root,'.firebaserc'),'utf8'));
  const sites=firebase.targets?.[config.hosting.project]?.hosting?.[config.hosting.target];
  if(!Array.isArray(sites) || sites.length!==1) throw new Error('The website Hosting target must resolve to exactly one site in .firebaserc.');
  await verifyVerificationFiles(path.join(root,'public'),config);
  const source=options.legalSource || config.legalSource;
  if(!options.skipBuild && !options.noSyncLegal && source) {
    console.log('[site] Synchronizing legal documents into this website (source is read-only).');
    await runNode([path.join(root,'scripts/sync-legal-documents.mjs'),'--source',path.resolve(root,source)]);
  }
  await runSteps(['lint','test',...(options.skipBuild?['typecheck']:['build']),'check:seo','check:export','test:export'],npm);
  if(options.check) { console.log('\n[site] All checks passed. Complete export ready in out/. No upload performed.'); return; }
  const manifest=JSON.parse(await readFile(path.join(root,'out/seo-manifest.json'),'utf8'));
  assertRouteContinuity(await previousRoutes(config.origin),manifest.pages.map(page=>page.path),manifest.redirects);
  const firebaseCli=path.join(root,'node_modules/firebase-tools/lib/bin/firebase.js');
  const auth=['--project',config.hosting.project,'--account',account,'--non-interactive'];
  let publishedOrigin=config.origin;
  console.log(`\n[site] Publishing only hosting:${config.hosting.target}.`);
  if(options.channel) {
    const output=await runNode([firebaseCli,'hosting:channel:deploy',options.channel,'--expires',options.expires || '30d','--only',config.hosting.target,...auth,'--json'],true);
    publishedOrigin=previewUrl(JSON.parse(output),sites[0]);
  } else await runNode([firebaseCli,'deploy','--only',`hosting:${config.hosting.target}`,...auth]);
  try { await runNode([path.join(root,'scripts/verify-live.mjs'),publishedOrigin]); }
  catch(error) { throw new Error(`Upload completed, but live verification failed. ${error.message} Do not report the release as verified.`); }
  const release=JSON.parse(await readFile(path.join(root,'out/release.json'),'utf8'));
  await mkdir(path.join(root,'.firebase'),{recursive:true});
  await writeFile(path.join(root,'.firebase/last-website-release.json'),JSON.stringify({origin:publishedOrigin,buildId:release.buildId,verifiedAt:new Date().toISOString()},null,2)+'\n');
  console.log(`\n[site] Published and verified: ${publishedOrigin} (${release.buildId.slice(0,12)}). Existing Google ownership proof preserved; the sitemap URL stays unchanged.`);
}

if(process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url) {
  try { await updateSite(parseOptions(process.argv.slice(2))); }
  catch(error) { console.error(`\n[site] ${error.message}`); process.exitCode=1; }
}
