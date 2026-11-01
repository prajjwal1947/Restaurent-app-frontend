const MAX_SUGGESTIONS = 16;
const WIKI_PARAMS = { action: "query", format: "json", origin: "*" };

export async function searchMenuImages(query) {
  const name = query.trim();
  const sources = [
    searchMealDb(name),
    searchWikipedia(name),
    ...[`${name} food`, `${name} dish`, name].map(searchCommons),
  ];
  const settled = await Promise.allSettled(sources);
  if (settled.every((result) => result.status === "rejected")) {
    throw new Error("Image search is unavailable right now.");
  }

  const seen = new Set();
  return settled
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter((image) => !seen.has(image.url) && seen.add(image.url))
    .map((image) => ({ ...image, score: relevance(image.title, name) }))
    .filter((image) => image.score > 0 || image.source === "TheMealDB")
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS);
}

async function searchMealDb(name) {
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error("TheMealDB unavailable");
  const result = await response.json();
  return (result.meals || []).map((meal) => ({
    title: meal.strMeal,
    url: `${meal.strMealThumb}/medium`,
    sourceUrl: `https://www.themealdb.com/meal/${meal.idMeal}`,
    artist: "TheMealDB",
    license: "TheMealDB",
    source: "TheMealDB",
  }));
}

async function searchWikipedia(name) {
  const params = new URLSearchParams({
    ...WIKI_PARAMS,
    generator: "search",
    gsrsearch: `${name} dish`,
    gsrlimit: "8",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "360",
  });
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
  if (!response.ok) throw new Error("Wikipedia unavailable");
  const result = await response.json();
  return Object.values(result.query?.pages || {})
    .filter((page) => page.thumbnail?.source)
    .sort((a, b) => a.index - b.index)
    .map((page) => ({
      title: page.title,
      url: page.thumbnail.source,
      sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(" ", "_"))}`,
      artist: "Wikipedia",
      license: "See Wikipedia page",
      source: "Wikipedia",
    }));
}

async function searchCommons(query) {
  const params = new URLSearchParams({
    ...WIKI_PARAMS,
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "360",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!response.ok) throw new Error("Wikimedia Commons unavailable");
  const result = await response.json();
  return Object.values(result.query?.pages || {})
    .sort((a, b) => a.index - b.index)
    .map((page) => {
      const imageInfo = page.imageinfo?.[0];
      if (!imageInfo?.thumburl) return null;
      return {
        title: page.title.replace(/^File:/, ""),
        url: imageInfo.thumburl,
        sourceUrl: imageInfo.descriptionurl,
        artist: cleanMetadata(imageInfo.extmetadata?.Artist?.value),
        license: cleanMetadata(imageInfo.extmetadata?.LicenseShortName?.value),
        source: "Wikimedia Commons",
      };
    })
    .filter(Boolean);
}

function relevance(title, name) {
  const words = name.toLowerCase().split(/\s+/).filter((word) => word.length > 2);
  const haystack = title.toLowerCase();
  return words.filter((word) => haystack.includes(word)).length;
}

function cleanMetadata(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}