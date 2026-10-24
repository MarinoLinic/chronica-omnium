// Explicit network research. Nothing here assigns dates or editorial approval.
import { mkdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { at, loadCatalog, writeJson } from "./lib/catalog.mjs";
import { withCatalogLock } from "./lib/lock.mjs";
import { api, WIKI, COMMONS, wikipediaTitle, plain } from "./lib/wikimedia.mjs";

export function infobox(text) {
  const start = text.search(/\{\{\s*Infobox\b/i);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length - 1; i++) {
    if (text.slice(i, i + 2) === "{{") {
      depth++;
      i++;
    } else if (text.slice(i, i + 2) === "}}") {
      depth--;
      i++;
      if (!depth) return text.slice(start, i + 1);
    }
  }
  return null;
}
export function introSummary(text) {
  let summary = "";
  for (const { segment } of new Intl.Segmenter("en", {
    granularity: "sentence",
  }).segment(text)) {
    summary += segment;
    const value = summary.trim();
    if (
      value.length >= 70 &&
      !/\b(?:c|ca|Dr|Mr|Mrs|St)\.$/.test(value) &&
      (value.match(/\(/g) || []).length === (value.match(/\)/g) || []).length
    )
      break;
  }
  return summary.trim();
}
export async function research(title) {
  const page = await api(WIKI, {
    titles: title,
    redirects: "1",
    prop: "extracts|revisions|pageimages|pageprops",
    exintro: "1",
    explaintext: "1",
    rvprop: "ids|timestamp|content",
    rvslots: "main",
    piprop: "thumbnail|original|name",
    pithumbsize: "960",
  });
  if (page.pageprops?.disambiguation !== undefined)
    throw new Error(`Disambiguation page: ${title}; choose a specific article`);
  const revision = page.revisions?.[0];
  if (!revision?.revid || !page.extract?.trim())
    throw new Error(`No attributed introductory extract for ${title}`);
  const source = `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(" ", "_"))}`;
  const card = {
    schemaVersion: 1,
    title: page.title,
    source,
    revisionId: revision.revid,
    revisionTimestamp: revision.timestamp,
    fetchedAt: new Date().toISOString(),
    text: page.extract,
    proposedSummary: introSummary(page.extract),
    infobox: infobox(revision.slots?.main?.content || ""),
    wikidataId: page.pageprops?.wikibase_item || null,
    image: null,
  };
  if (page.original?.source) {
    const small = await api(WIKI, {
      titles: page.title,
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: "320",
    });
    let credit = null;
    if (page.pageimage) {
      try {
        const file = await api(COMMONS, {
          titles: `File:${page.pageimage}`,
          prop: "imageinfo",
          iiprop: "extmetadata|url",
        });
        const info = file.imageinfo?.[0],
          m = info?.extmetadata || {};
        if (info)
          credit = {
            source: info.descriptionurl,
            artist: plain(m.Artist?.value),
            credit: plain(m.Credit?.value),
            license: plain(m.LicenseShortName?.value) || "See source license",
            licenseUrl: plain(m.LicenseUrl?.value),
            attribution: plain(m.Attribution?.value),
          };
      } catch (error) {
        card.imageMetadataError = error.message;
      }
    }
    card.image = {
      original: page.original.source,
      display: page.thumbnail?.source || page.original.source,
      small:
        small.thumbnail?.source ||
        page.thumbnail?.source ||
        page.original.source,
      credit,
    };
  }
  return card;
}
async function backup(file, root) {
  try {
    await mkdir(root, { recursive: true });
    await copyFile(file, `${root}/${file.split(/[\\/]/).at(-1)}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
async function main() {
  const args = process.argv.slice(2),
    value = (flag) => args[args.indexOf(flag) + 1],
    cache = args.includes("--cache");
  if (!args.some((a) => ["--id", "--title", "--all"].includes(a)))
    throw new Error(
      'Use --id N, --title "Wikipedia title", or --all; optional --cache writes attributed snapshots. Infoboxes are proposals, never approved dates.',
    );
  if(args.includes('--all')&&(args.includes('--title')||args.includes('--id')))throw new Error('Use --all alone, or choose one record/title. A single article cannot be assigned to the whole catalog.');
  if(cache&&!args.includes('--id')&&!args.includes('--all'))throw new Error('--cache requires --id or --all. Use --title alone to stage research without changing published snapshots.');
  const entries = await loadCatalog();
  const selected = args.includes("--all")
    ? entries.filter((e) => e.record.source?.includes("en.wikipedia.org"))
    : args.includes("--id")
      ? entries.filter(
          (e) =>
            e.record.id === value("--id") ||
            String(e.record.id_num) === value("--id"),
        )
      : [{ record: { id: null, source: null } }];
  if (!selected.length) throw new Error("Record not found");
  const run = String(Date.now()),
    results = [];
  for (const { record: r } of selected) {
    try {
      const title = args.includes("--title")
        ? value("--title")
        : wikipediaTitle(r.source);
      if (!title)
        throw new Error(
          "Choose a Wikipedia article with --title; authored evidence URL is preserved",
        );
      const card = await research(title);
      await writeJson(
        at(".local/research", run, `${r.id || "article"}.json`),
        card,
      );
      if (cache) {
        if (!r.id) throw new Error("--cache requires a record ID");
        if (r.source?.includes("oldid="))
          throw new Error("Pinned revision is preserved; review it separately");
        const file = at("data/content", `${r.id}.json`);
        await backup(file, at(".local/history", `research-${run}`));
        await writeJson(file, {
          schemaVersion: 1,
          eventId: r.id,
          source: card.source,
          title: card.title,
          revisionId: card.revisionId,
          revisionTimestamp: card.revisionTimestamp,
          fetchedAt: card.fetchedAt,
          method: "mediawiki-intro-extract",
          status: "review",
          license: "CC BY-SA 4.0; see source history and contributors",
          text: card.text,
        });
        await backup(
          at("data/enrichment", `${r.id}.json`),
          at(".local/history", `research-${run}`, "images"),
        );
        await writeJson(at("data/enrichment", `${r.id}.json`), {
          schemaVersion: 1,
          eventId: r.id,
          source: card.source,
          revisionId: card.revisionId,
          fetchedAt: card.fetchedAt,
          image: card.image,
        });
      }
      results.push({ id: r.id, title: card.title, ok: true });
      console.log(`${r.id || "article"}: ${card.title}`);
    } catch (error) {
      results.push({ id: r.id, ok: false, error: error.message });
      console.error(`${r.id}: ${error.message}`);
    }
  }
  await writeJson(at(".local/research", run, "report.json"), results);
  if (results.some((r) => !r.ok)) process.exitCode = 1;
}
if (process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1])
  await withCatalogLock("explicit research", main);
