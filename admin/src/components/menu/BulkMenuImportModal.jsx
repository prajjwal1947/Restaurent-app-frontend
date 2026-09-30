import { useEffect, useMemo, useState } from "react";
import { FileImage, LoaderCircle, Plus, Trash2, Upload, X } from "lucide-react";
import { searchMenuImages } from "../../services/searchMenuImages";

export default function BulkMenuImportModal({ categories, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [rows, setRows] = useState([]);
  const [rawText, setRawText] = useState("");
  const [recognizing, setRecognizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState("eng");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const categoryOptions = useMemo(() => categories.filter((category) => category?.id && category?.name), [categories]);
  const defaultCategory = categoryOptions[0]?.name || "";
  const validRows = rows.filter((row) =>
    row.name.trim() && row.category && Number.isFinite(Number(row.price)) && Number(row.price) >= 0
  );

  const selectFile = (nextFile) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Choose a menu photo in JPG, PNG, or another image format.");
      return;
    }
    if (nextFile.size > 12 * 1024 * 1024) {
      setError("The image must be smaller than 12 MB.");
      return;
    }
    setError("");
    setFile(nextFile);
    setRows([]);
    setRawText("");
    setProgress(0);
    setPreviewUrl(URL.createObjectURL(nextFile));
  };

  const recognizeMenu = async () => {
    if (!file) return;
    setRecognizing(true);
    setProgress(0);
    setError("");
    let worker;
    try {
      const { createWorker } = await import("tesseract.js");
      let currentAttempt = 0;
      const attempts = [
        { image: null, layout: "11" },
        { image: null, layout: "6" },
        { image: file, layout: "11" },
      ];
      worker = await createWorker(language, 1, {
        logger: (message) => {
          if (message.status === "recognizing text") {
            setProgress(Math.round(((currentAttempt + message.progress) / attempts.length) * 100));
          }
        },
      });
      try {
        attempts[0].image = await prepareMenuImage(file);
        attempts[1].image = attempts[0].image;
      } catch {
        attempts[0].image = file;
        attempts[1].image = file;
      }

      let bestResult = null;
      for (const [index, attempt] of attempts.entries()) {
        currentAttempt = index;
        await worker.setParameters({
          tessedit_pageseg_mode: attempt.layout,
          preserve_interword_spaces: "1",
        });
        const result = await worker.recognize(attempt.image);
        const text = result.data.text || "";
        const parsedRows = parseMenuText(text, categoryOptions);
        const score = parsedRows.length * 100 + (result.data.confidence || 0);
        if (!bestResult || score > bestResult.score) {
          bestResult = { text, rows: parsedRows, score };
        }
      }
      setProgress(100);
      setRawText(bestResult?.text || "");
      setRows(bestResult?.rows || []);
    } catch (recognitionError) {
      setError(recognitionError.message || "Could not read this menu photo. Try a clearer image.");
    } finally {
      await worker?.terminate();
      setRecognizing(false);
    }
  };

  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };

  const findRowImages = async (id) => {
    const row = rows.find((item) => item.id === id);
    if (!row || row.name.trim().length < 2) return;
    updateRow(id, "searchingImages", true);
    updateRow(id, "imageSearchError", "");
    try {
      const suggestions = await searchMenuImages(row.name.trim());
      setRows((current) => current.map((item) => item.id === id
        ? { ...item, imageSuggestions: suggestions, searchingImages: false }
        : item
      ));
    } catch (searchError) {
      setRows((current) => current.map((item) => item.id === id
        ? { ...item, imageSearchError: searchError.message, searchingImages: false }
        : item
      ));
    }
  };

  const addRow = () => {
    setRows((current) => [...current, {
      id: crypto.randomUUID(),
      name: "",
      price: "",
      category: defaultCategory,
      description: "",
      imageUrl: "",
      imageSuggestions: [],
      searchingImages: false,
      imageSearchError: "",
    }]);
  };

  const submitImport = async () => {
    if (!validRows.length || importing) return;
    setImporting(true);
    setError("");
    try {
      await onImport(validRows.map((row) => ({
        ...row,
        name: row.name.trim(),
        price: Number(row.price),
      })));
      onClose();
    } catch (importError) {
      setError(importError.message || "Some menu items could not be imported.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !recognizing && !importing) onClose();
    }}>
      <section className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-orange-100 bg-[#fffaf5] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="bulk-menu-title">
        <header className="flex items-start justify-between gap-4 border-b border-orange-100 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#e86a33]">Menu import</p>
            <h2 id="bulk-menu-title" className="mt-1 text-xl font-bold text-gray-900">Build menu from a photo</h2>
            <p className="mt-1 text-sm text-gray-500">Recognize text locally, review every row, then import items together.</p>
          </div>
          <button type="button" onClick={onClose} disabled={recognizing || importing} aria-label="Close menu import" className="rounded-lg p-2 text-gray-500 hover:bg-orange-50 disabled:opacity-40">
            <X size={19} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          {error && <p role="alert" className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {categoryOptions.length === 0 && <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Create a menu category before importing items.</p>}

          <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.6fr)]">
            <div>
              <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-orange-300 bg-white px-5 text-center hover:bg-orange-50">
                {previewUrl ? (
                  <img src={previewUrl} alt="Uploaded menu preview" className="max-h-64 w-full rounded-lg object-contain" />
                ) : (
                  <>
                    <FileImage size={28} className="text-[#d76b3e]" />
                    <span className="text-sm font-semibold text-gray-700">Choose menu photo</span>
                    <span className="text-xs text-gray-500">JPG, PNG, or another supported image · up to 12 MB</span>
                  </>
                )}
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])} />
              </label>

              {file && <p className="mt-2 truncate text-xs text-gray-500" title={file.name}>{file.name}</p>}

              <label className="mt-3 block text-xs font-semibold text-gray-600">
                OCR language
                <select value={language} onChange={(event) => setLanguage(event.target.value)} disabled={recognizing} className="mt-1 w-full rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-[#e86a33]">
                  <option value="eng">English</option>
                  <option value="eng+hin">English + Hindi</option>
                  <option value="eng+ara">English + Arabic</option>
                  <option value="eng+spa">English + Spanish</option>
                  <option value="eng+fra">English + French</option>
                  <option value="eng+chi_sim">English + Simplified Chinese</option>
                </select>
              </label>

              <button type="button" onClick={recognizeMenu} disabled={!file || recognizing || categoryOptions.length === 0} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#e86a33] px-4 py-3 text-sm font-semibold text-white hover:bg-[#cf592b] disabled:cursor-not-allowed disabled:opacity-50">
                {recognizing ? <LoaderCircle size={17} className="animate-spin" /> : <FileImage size={17} />}
                {recognizing ? `Reading menu ${progress}%` : "Recognize menu text"}
              </button>
              {recognizing && <progress className="mt-2 h-1.5 w-full accent-[#e86a33]" max="100" value={progress} aria-label="OCR progress" />}

              {rawText && (
                <details className="mt-4 rounded-lg border border-orange-100 bg-white p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-gray-600">View recognized text</summary>
                  <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap text-[11px] text-gray-500">{rawText}</pre>
                </details>
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Review detected items</h3>
                  <p className="text-xs text-gray-500">{validRows.length} ready to import · prices are entered in rupees</p>
                </div>
                <button type="button" onClick={addRow} disabled={categoryOptions.length === 0} className="flex items-center gap-1 rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-[#b9572b] hover:bg-orange-50 disabled:opacity-50">
                  <Plus size={14} /> Add row
                </button>
              </div>

              {rows.length === 0 ? (
                <div className="flex min-h-44 items-center justify-center rounded-xl border border-orange-100 bg-white p-6 text-center text-sm text-gray-500">
                  Upload a photo and recognize its text. You can edit every detected item before importing.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-orange-100 bg-white">
                  <table className="w-full min-w-[920px] text-left text-xs">
                    <thead className="border-b border-orange-100 bg-orange-50/60 text-gray-500">
                      <tr><th className="px-3 py-2 font-semibold">Item name</th><th className="w-52 px-3 py-2 font-semibold">Description</th><th className="w-28 px-3 py-2 font-semibold">Price ₹</th><th className="w-40 px-3 py-2 font-semibold">Category</th><th className="w-10 px-2 py-2" /></tr>
                    </thead>
                    <tbody className="divide-y divide-orange-50">
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-2 py-2">
                            <input value={row.name} onChange={(event) => updateRow(row.id, "name", event.target.value)} aria-label="Menu item name" placeholder="Dish name" className="w-full rounded-md border border-transparent px-2 py-2 text-sm outline-none focus:border-orange-300" />
                            <div className="mt-1 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => findRowImages(row.id)}
                                disabled={row.searchingImages || row.name.trim().length < 2}
                                className="text-[10px] font-semibold text-[#b9572b] hover:underline disabled:opacity-40"
                              >
                                {row.searchingImages ? "Searching images..." : row.imageUrl ? "Change image" : "Find images"}
                              </button>
                              {row.imageUrl && (
                                <img src={row.imageUrl} alt="Selected menu item" className="h-7 w-9 rounded object-cover" />
                              )}
                              {row.imageUrl && <button type="button" onClick={() => updateRow(row.id, "imageUrl", "")} className="text-[10px] text-gray-500 hover:text-red-600">Remove</button>}
                            </div>
                            {row.imageSearchError && <p className="mt-1 text-[10px] text-red-600">{row.imageSearchError}</p>}
                            {row.imageSuggestions?.length > 0 && (
                              <div className="mt-2 grid grid-cols-3 gap-2">
                                {row.imageSuggestions.map((suggestion) => (
                                  <div key={suggestion.sourceUrl || suggestion.url}>
                                    <button
                                      type="button"
                                      onClick={() => updateRow(row.id, "imageUrl", suggestion.url)}
                                      aria-label={`Choose ${suggestion.title}`}
                                      title={suggestion.title}
                                      className={`w-full overflow-hidden rounded-md border ${row.imageUrl === suggestion.url ? "border-[#e86a33] ring-2 ring-orange-200" : "border-orange-100"}`}
                                    >
                                      <img src={suggestion.url} alt={suggestion.title} loading="lazy" className="h-14 w-full object-cover" />
                                    </button>
                                    {suggestion.sourceUrl && <a href={suggestion.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-[9px] text-[#b9572b] underline">Source · {suggestion.license || suggestion.artist || suggestion.title}</a>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            <input value={row.description} onChange={(event) => updateRow(row.id, "description", event.target.value)} aria-label={`Description for ${row.name || "menu item"}`} placeholder="Optional description" className="w-full rounded-md border border-transparent px-2 py-2 text-sm outline-none focus:border-orange-300" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" min="0" step="0.01" value={row.price} onChange={(event) => updateRow(row.id, "price", event.target.value)} aria-label={`Price for ${row.name || "menu item"}`} placeholder="0.00" className="w-full rounded-md border border-orange-100 px-2 py-2 text-sm outline-none focus:border-[#e86a33]" />
                          </td>
                          <td className="px-2 py-2">
                            <select value={row.category} onChange={(event) => updateRow(row.id, "category", event.target.value)} aria-label={`Category for ${row.name || "menu item"}`} className="w-full rounded-md border border-orange-100 bg-white px-2 py-2 text-sm outline-none focus:border-[#e86a33]">
                              {categoryOptions.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} aria-label={`Remove ${row.name || "menu item"}`} className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {rows.length > 0 && validRows.length !== rows.length && <p className="mt-2 text-xs text-amber-700">Rows missing a name, valid price, or category will be skipped.</p>}
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 bg-white px-5 py-4 sm:px-7">
          <p className="text-xs text-gray-500">Items are created together. Check names and prices before importing.</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} disabled={recognizing || importing} className="rounded-lg border border-orange-100 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-orange-50">Cancel</button>
            <button type="button" onClick={submitImport} disabled={!validRows.length || importing || recognizing || categoryOptions.length === 0} className="flex items-center gap-2 rounded-lg bg-[#e86a33] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#cf592b] disabled:cursor-not-allowed disabled:opacity-50">
              {importing ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
              {importing ? "Importing..." : `Import ${validRows.length} items`}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function parseMenuText(text, categories) {
  const categoryByName = new Map(categories.map((category) => [normalizeCategory(category.name), category.name]));
  let activeCategory = categories[0]?.name || "";
  const rows = [];
  let pendingLines = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = normalizeNumerals(rawLine).trim().replace(/\s{2,}/g, " ");
    if (!line) continue;
    if (/(?:\bfree delivery\b|\bwebsite\b|\bfollow us\b|\bcontact\b|\b\d{1,3}[\s-]\d{3}[\s-]\d{3,}\b|\+\s?\d[\d\s()-]{6,}|(?:₹|\$|€|£|¥)\s*\d+(?:[.,]\d{1,2})?\s*(?:off|discount)\b)/i.test(line)) continue;
    const matchedCategory = categoryByName.get(normalizeCategory(line));
    if (matchedCategory) {
      appendPendingDescription(rows, pendingLines);
      pendingLines = [];
      activeCategory = matchedCategory;
      continue;
    }

    const priceMatch = line.match(/(?:₹|\$|€|£|¥|rs\.?|inr|usd|eur|gbp|aed|sar)?\s*(\d[\d,.]*)(?:\s*\/-)?\s*(?:₹|\$|€|£|¥|rs\.?|inr|usd|eur|gbp|aed|sar)?\s*$/i);
    const name = priceMatch
      ? line.slice(0, priceMatch.index).replace(/^\s*\d+[.)-]\s*/, "").replace(/[\s.·\-–—:]+$/, "").trim()
      : "";
    if (priceMatch && name.length < 2 && pendingLines.length) {
      const pendingName = pendingLines[0].replace(/^\s*\d+[.)-]\s*/, "").trim();
      const price = parsePrice(priceMatch[1]);
      if (pendingName.length >= 2 && Number.isFinite(price)) {
        rows.push({
          id: crypto.randomUUID(),
          name: pendingName,
          price: String(price),
          category: activeCategory,
          description: pendingLines.slice(1).join(" "),
        });
        pendingLines = [];
      }
      continue;
    }
    if (!priceMatch || name.length < 2) {
      const looksLikeHeading = /^[A-Z0-9\s&/+-]{3,}$/.test(line);
      if (!looksLikeHeading) pendingLines.push(line);
      continue;
    }
    const price = parsePrice(priceMatch[1]);
    if (!Number.isFinite(price)) continue;
    appendPendingDescription(rows, pendingLines);
    pendingLines = [];
    rows.push({
      id: crypto.randomUUID(),
      name,
      price: String(price),
      category: activeCategory,
      description: "",
      imageUrl: "",
      imageSuggestions: [],
      searchingImages: false,
      imageSearchError: "",
    });
  }
  appendPendingDescription(rows, pendingLines);
  return rows;
}

function appendPendingDescription(rows, pendingLines) {
  if (!rows.length || !pendingLines.length) return;
  const lastRow = rows[rows.length - 1];
  lastRow.description = [lastRow.description, ...pendingLines].filter(Boolean).join(" ");
}

function normalizeNumerals(value) {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternArabicIndic = "۰۱۲۳۴۵۶۷۸۹";
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndex = arabicIndic.indexOf(digit);
    if (arabicIndex !== -1) return String(arabicIndex);
    return String(easternArabicIndic.indexOf(digit));
  });
}

function parsePrice(value) {
  let normalized = value.replace(/[^\d,.]/g, "");
  if (/^\d+,\d{1,2}$/.test(normalized)) normalized = normalized.replace(",", ".");
  else normalized = normalized.replaceAll(",", "");
  return Number(normalized);
}

function normalizeCategory(value) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/s\b/g, "");
}

async function prepareMenuImage(file) {
  const image = await createImageBitmap(file);
  const source = document.createElement("canvas");
  source.width = image.width;
  source.height = image.height;
  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  sourceContext.drawImage(image, 0, 0);

  const pixels = sourceContext.getImageData(0, 0, source.width, source.height).data;
  const rowStep = Math.max(1, Math.floor(source.width / 500));
  const colStep = Math.max(1, Math.floor(source.height / 500));
  const rowThreshold = Math.floor(Math.ceil(source.width / rowStep) * 0.12);
  const colThreshold = Math.floor(Math.ceil(source.height / colStep) * 0.12);
  let top = source.height;
  let bottom = 0;
  let left = source.width;
  let right = 0;

  for (let y = 0; y < source.height; y += rowStep) {
    let darkPixels = 0;
    for (let x = 0; x < source.width; x += colStep) {
      const offset = (y * source.width + x) * 4;
      const brightness = (pixels[offset] * 0.299) + (pixels[offset + 1] * 0.587) + (pixels[offset + 2] * 0.114);
      if (brightness < 90) darkPixels += 1;
    }
    if (darkPixels >= rowThreshold) {
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  for (let x = 0; x < source.width; x += colStep) {
    let darkPixels = 0;
    for (let y = 0; y < source.height; y += rowStep) {
      const offset = (y * source.width + x) * 4;
      const brightness = (pixels[offset] * 0.299) + (pixels[offset + 1] * 0.587) + (pixels[offset + 2] * 0.114);
      if (brightness < 90) darkPixels += 1;
    }
    if (darkPixels >= colThreshold) {
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
  }

  const foundPanel = right - left > source.width * 0.35 && bottom - top > source.height * 0.35;
  if (!foundPanel) {
    left = 0;
    top = 0;
    right = source.width - 1;
    bottom = source.height - 1;
  }
  const marginX = Math.round((right - left) * 0.015);
  const marginY = Math.round((bottom - top) * 0.015);
  left = Math.max(0, left - marginX);
  top = Math.max(0, top - marginY);
  const cropWidth = Math.min(source.width - left, right - left + marginX * 2);
  const cropHeight = Math.min(source.height - top, bottom - top + marginY * 2);
  const scale = Math.min(4, Math.max(2, 1800 / Math.max(cropWidth, cropHeight)));
  const enhanced = document.createElement("canvas");
  enhanced.width = Math.round(cropWidth * scale);
  enhanced.height = Math.round(cropHeight * scale);
  const enhancedContext = enhanced.getContext("2d", { willReadFrequently: true });
  enhancedContext.drawImage(source, left, top, cropWidth, cropHeight, 0, 0, enhanced.width, enhanced.height);

  const enhancedPixels = enhancedContext.getImageData(0, 0, enhanced.width, enhanced.height);
  const sample = (x, y) => {
    const offset = (y * enhanced.width + x) * 4;
    return (enhancedPixels.data[offset] * 0.299)
      + (enhancedPixels.data[offset + 1] * 0.587)
      + (enhancedPixels.data[offset + 2] * 0.114);
  };
  const inset = Math.max(1, Math.floor(Math.min(enhanced.width, enhanced.height) * 0.01));
  const backgroundBrightness = (
    sample(inset, inset)
    + sample(enhanced.width - inset - 1, inset)
    + sample(inset, enhanced.height - inset - 1)
    + sample(enhanced.width - inset - 1, enhanced.height - inset - 1)
  ) / 4;
  const invert = backgroundBrightness < 128;
  for (let index = 0; index < enhancedPixels.data.length; index += 4) {
    const grayscale = (enhancedPixels.data[index] * 0.299)
      + (enhancedPixels.data[index + 1] * 0.587)
      + (enhancedPixels.data[index + 2] * 0.114);
    const contrast = Math.max(0, Math.min(255, (grayscale - 128) * 1.6 + 128));
    const adjusted = invert ? 255 - contrast : contrast;
    enhancedPixels.data[index] = adjusted;
    enhancedPixels.data[index + 1] = adjusted;
    enhancedPixels.data[index + 2] = adjusted;
  }
  enhancedContext.putImageData(enhancedPixels, 0, 0);
  image.close();
  return enhanced;
}