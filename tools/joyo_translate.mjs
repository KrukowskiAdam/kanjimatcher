import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const joyoPath = path.join(projectRoot, "static", "Jōyō_Kanji", "Jōyō_Kanji.txt");
const outputPath = path.join(projectRoot, "static", "joyo_kanji_en.json");
const kanjiApiPath = path.join(projectRoot, "static", "kanjiapi_full.json");
const overridesPath = path.join(__dirname, "kanji_overrides.json");

const parseJoyoText = (text) => {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const groups = [];
  let current = null;

  for (const line of lines) {
    if (!line) {
      continue;
    }
    if (line.includes("Kanji") && /\d+-\d+/.test(line)) {
      current = { label: line, kanji: [] };
      groups.push(current);
      continue;
    }
    if (!current) {
      continue;
    }
    const chars = Array.from(line).filter((char) => char.trim() !== "");
    chars.forEach((char) => current.kanji.push(char));
  }

  return groups;
};

const katakanaToHiragana = (kata) => {
  return kata.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
};

const cleanReading = (reading) => {
  // Usuń prefiksy jak -と, -り, kropki i nawiasy
  return reading.replace(/^-/, "").replace(/-$/, "").replace(/\./g, "").replace(/[()]/g, "");
};

const buildKanjiData = (data) => {
  const map = {};
  const kanjis = data?.kanjis && typeof data.kanjis === "object" ? data.kanjis : {};

  Object.entries(kanjis).forEach(([char, info]) => {
    if (!info || typeof info !== "object") {
      return;
    }

    // Pobierz czytanie - wybierz najdłuższe czytanie kun, jeśli brak to on
    const kunReadings = Array.isArray(info.kun_readings) ? info.kun_readings : [];
    const onReadings = Array.isArray(info.on_readings) ? info.on_readings : [];
    
    let hiragana = "";
    if (kunReadings.length > 0) {
      // Wyczyść wszystkie i wybierz najdłuższe
      const cleanedKun = kunReadings.map(cleanReading).filter(r => r.length > 0);
      hiragana = cleanedKun.sort((a, b) => b.length - a.length)[0] || "";
    } else if (onReadings.length > 0) {
      const cleanedOn = onReadings.map(r => katakanaToHiragana(cleanReading(r))).filter(r => r.length > 0);
      hiragana = cleanedOn.sort((a, b) => b.length - a.length)[0] || "";
    }

    // Pobierz znaczenie angielskie
    const meanings = Array.isArray(info.meanings) ? info.meanings : [];
    const englishMeaning = meanings[0] || info.heisig_en || "";

    map[char] = {
      hiragana,
      meaning: englishMeaning
    };
  });

  return map;
};

const main = async () => {
  const text = await fs.readFile(joyoPath, "utf8");
  const groups = parseJoyoText(text);
  const kanjiData = JSON.parse(await fs.readFile(kanjiApiPath, "utf8"));
  
  // Wczytaj override'y
  let overrides = {};
  try {
    overrides = JSON.parse(await fs.readFile(overridesPath, "utf8"));
  } catch (error) {
    console.log("No overrides file found, using dictionary only");
  }
  
  const kanjiMap = buildKanjiData(kanjiData);
  
  // Zastosuj override'y
  Object.keys(overrides).forEach((char) => {
    if (overrides[char]) {
      kanjiMap[char] = overrides[char];
    }
  });
  
  const kanjiList = Array.from(new Set(groups.flatMap((group) => group.kanji)));
  
  const missing = kanjiList.filter((char) => !kanjiMap[char] || !kanjiMap[char].meaning);
  console.log(`Total: ${kanjiList.length}, missing: ${missing.length}, overrides: ${Object.keys(overrides).length}`);
  if (missing.length > 0) {
    console.log(`Missing kanji: ${missing.slice(0, 20).join(", ")}${missing.length > 20 ? "..." : ""}`);
  }

  const output = {
    groups: groups.map((group) => {
      const items = group.kanji.map((char) => {
        const data = kanjiMap[char] || { hiragana: "", meaning: "" };
        return {
          kanji: char,
          hiragana: data.hiragana,
          meaning: data.meaning
        };
      });
      return {
        label: group.label,
        items
      };
    })
  };

  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), "utf8");
  console.log(`Saved: ${outputPath}`);
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
