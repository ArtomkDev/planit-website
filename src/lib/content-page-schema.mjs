export const reservedSlugs = ['uk','en','wiki','auth','privacy','cookies','terms','licenses','delete','api','admin'];

export function validateContentPages(pages) {
  if (!Array.isArray(pages)) throw new Error('src/content/pages.json must be an array.');
  const slugs = new Set();
  for (const page of pages) {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(page.slug) || reservedSlugs.includes(page.slug)) throw new Error(`Invalid or reserved page slug: ${page.slug}.`);
    if (slugs.has(page.slug)) throw new Error(`Duplicate page slug: ${page.slug}.`);
    slugs.add(page.slug);
    if (typeof page.published !== 'boolean') throw new Error(`${page.slug}: published must be true or false.`);
    if (!page.published) continue;
    const date = new Date(page.updatedAt);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(page.updatedAt) || Number.isNaN(date.getTime()) || date.toISOString().slice(0,10) !== page.updatedAt) throw new Error(`${page.slug}: updatedAt must be a real YYYY-MM-DD date.`);
    for (const locale of ['uk','en']) {
      const text = page.locales?.[locale];
      if (!Array.isArray(text?.sections) || text.sections.some(section=>!Array.isArray(section.paragraphs) || !section.paragraphs.length)) throw new Error(`${page.slug}: add ${locale} sections with paragraphs before publishing.`);
      const values = [text?.title,text?.description,text?.heading,text?.intro,...(text?.sections || []).flatMap(section=>[section.heading,...(section.paragraphs || [])])];
      if (!text?.sections?.length || values.some(value=>typeof value !== 'string' || !value.trim() || /\bTODO\b/i.test(value))) throw new Error(`${page.slug}: complete the ${locale} title, description, heading, intro and sections before publishing.`);
    }
  }
  return pages;
}
