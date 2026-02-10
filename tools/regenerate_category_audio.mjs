#!/usr/bin/env node

/*
  Regenerate Azure TTS audio for a category in file NN and selected languages.

  Usage:
    node tools/regenerate_category_audio.mjs --file 01 --category "Yes & No Responses" --langs fr,de,es,it,ru,ko

  Options:
    --file <NN>        File number (01-09), required
    --category <name>  Category name (exact match), required
    --langs <list>     Comma-separated language codes (e.g., fr,de,es), required
    --dry-run          Preview without uploading or writing files
*/

import fs from 'fs';
import path from 'path';
import sdk from 'microsoft-cognitiveservices-speech-sdk';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SPEECH_KEY = process.env.SPEECH_KEY;
const SPEECH_REGION = process.env.SPEECH_REGION;

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../firebase-service-account.json');
const STORAGE_BUCKET = "costam-3f612.firebasestorage.app";
const LANGUAGES_DIR = path.resolve(__dirname, '../public/languages');

// Voice Mapping
const VOICES = {
    'es': 'es-ES-ElviraNeural',
    'de': 'de-DE-KatjaNeural',
    'fr': 'fr-FR-DeniseNeural',
    'ru': 'ru-RU-SvetlanaNeural',
    'zh': 'zh-CN-XiaoxiaoNeural',
    'ja': 'ja-JP-NanamiNeural',
    'ko': 'ko-KR-SunHiNeural',
    'it': 'it-IT-ElsaNeural'
};

// Locale Mapping
const LOCALES = {
    'es': 'es-ES',
    'de': 'de-DE',
    'fr': 'fr-FR',
    'ru': 'ru-RU',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'it': 'it-IT'
};

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        file: null,
        category: null,
        langs: null,
        dryRun: false,
        pauseMs: null,
        pauseShortOnly: false,
        rate: '-5%'
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        switch (arg) {
            case '--file':
                options.file = next;
                i++;
                break;
            case '--category':
                options.category = next;
                i++;
                break;
            case '--langs':
                options.langs = next ? next.split(',').map(v => v.trim()).filter(Boolean) : null;
                i++;
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--pause-ms':
                options.pauseMs = next ? Number(next) : null;
                i++;
                break;
            case '--pause-short-only':
                options.pauseShortOnly = true;
                break;
            case '--rate':
                options.rate = next;
                i++;
                break;
        }
    }

    return options;
}

function getLetterCount(text) {
    if (!text) return 0;
    const normalized = text.normalize('NFD').replace(/\p{M}/gu, '');
    const lettersOnly = normalized.replace(/[^\p{L}]/gu, '');
    return lettersOnly.length;
}

// Initialize Firebase
let bucket = null;
function initFirebase() {
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        console.error(`❌ Firebase service account not found: ${SERVICE_ACCOUNT_PATH}`);
        process.exit(1);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: STORAGE_BUCKET
        });
    }

    bucket = admin.storage().bucket();
}

// Synthesize text to audio
async function synthesizeToBuffer(text, langCode, rate) {
    if (!SPEECH_KEY || !SPEECH_REGION) {
        throw new Error("Missing SPEECH_KEY or SPEECH_REGION in environment.");
    }
    const voiceName = VOICES[langCode];
    const locale = LOCALES[langCode];

    if (!voiceName || !locale) {
        throw new Error(`Unsupported language: ${langCode}`);
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
    speechConfig.speechSynthesisVoiceName = voiceName;
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;

    const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">
            <voice name="${voiceName}">
                <prosody rate="${rate}">
                    ${text}
                </prosody>
            </voice>
        </speak>
    `;

    return new Promise((resolve, reject) => {
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

        synthesizer.speakSsmlAsync(
            ssml,
            result => {
                synthesizer.close();
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    const buffer = Buffer.from(result.audioData);
                    if (buffer.length === 0) {
                        reject(new Error("Empty audio buffer"));
                        return;
                    }
                    resolve(buffer);
                } else {
                    reject(new Error(result.errorDetails || "Synthesis failed"));
                }
            },
            error => {
                synthesizer.close();
                reject(error);
            }
        );
    });
}

// Upload buffer to Firebase
async function uploadToFirebase(buffer, storagePath) {
    const file = bucket.file(storagePath);
    await file.save(buffer, {
        public: true,
        metadata: {
            contentType: 'audio/mpeg',
            cacheControl: 'public, max-age=31536000'
        }
    });

    const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/');
    return `https://storage.googleapis.com/${STORAGE_BUCKET}/${encodedPath}`;
}

function findCategory(content, categoryName) {
    return content.categories.find(cat => cat.name === categoryName) || null;
}

function buildGlobalIndexMap(content) {
    const map = new Map();
    let globalIndex = 0;

    for (const category of content.categories) {
        for (const word of category.words) {
            globalIndex++;
            map.set(word, globalIndex);
        }
    }

    return map;
}

async function main() {
    const options = parseArgs();

    if (!options.file || !options.category || !options.langs || options.langs.length === 0) {
        console.error('❌ Missing required options. Use --file, --category, and --langs.');
        process.exit(1);
    }

    const fileNum = options.file.padStart(2, '0');
    const langs = options.langs;

    if (!options.dryRun) {
        console.log('🔥 Initializing Firebase...');
        initFirebase();
    }

    for (const lang of langs) {
        const filePath = path.join(LANGUAGES_DIR, lang, `${lang}_en_${fileNum}.json`);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Skipping ${lang} - file not found`);
            continue;
        }

        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const category = findCategory(content, options.category);

        if (!category) {
            console.log(`⚠️  Skipping ${lang} - category not found: ${options.category}`);
            continue;
        }

        const indexMap = buildGlobalIndexMap(content);
        let modified = false;

        console.log(`\n🔊 ${lang.toUpperCase()} - ${options.category}`);

        for (const word of category.words) {
            const textForAudio = word[lang];
            const globalIndex = indexMap.get(word);

            if (!textForAudio || !globalIndex) {
                console.log(`   ⚠️  Skipping word with missing data`);
                continue;
            }

            const indexPadded = String(globalIndex).padStart(4, '0');
            const storagePath = `audio/${lang}/${fileNum}/${lang}_${indexPadded}.mp3`;

            const letterCount = getLetterCount(textForAudio);
            const shouldAddPause = Number.isFinite(options.pauseMs)
                && options.pauseMs > 0
                && (!options.pauseShortOnly || (letterCount >= 2 && letterCount <= 4));

            const ssmlText = shouldAddPause
                ? `${textForAudio}<break time="${options.pauseMs}ms"/>`
                : textForAudio;

            console.log(`   → ${indexPadded}: "${textForAudio}"${shouldAddPause ? ' + pause' : ''}`);

            if (!options.dryRun) {
                try {
                    const audioBuffer = await synthesizeToBuffer(ssmlText, lang, options.rate);
                    const audioUrl = await uploadToFirebase(audioBuffer, storagePath);
                    word.audio = audioUrl;
                    modified = true;
                } catch (err) {
                    console.error(`   ❌ ${lang}: Audio failed - ${err.message}`);
                }
            }
        }

        if (modified && !options.dryRun) {
            fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
            console.log(`   💾 ${lang}: Saved`);
        }
    }

    console.log('\n✨ Done!');
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});