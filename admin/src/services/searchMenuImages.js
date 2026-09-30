export async function searchMenuImages(query) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "360",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!response.ok) throw new Error("Image search is unavailable right now.");
  const result = await response.json();
  return Object.values(result.query?.pages || {})
    .map((page) => {
      const imageInfo = page.imageinfo?.[0];
      if (!imageInfo?.thumburl) return null;
      return {
        title: page.title.replace(/^File:/, ""),
        url: imageInfo.thumburl,
        sourceUrl: imageInfo.descriptionurl,
        artist: cleanMetadata(imageInfo.extmetadata?.Artist?.value),
        license: cleanMetadata(imageInfo.extmetadata?.LicenseShortName?.value),
      };
    })
    .filter(Boolean);
}

function cleanMetadata(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}