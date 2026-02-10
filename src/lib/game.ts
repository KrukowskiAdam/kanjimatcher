import { get, writable } from "svelte/store";
import type { Grade, JoyoData, Pair, Round, Tile } from "$lib/types";

const maxPairs = 9;
const fallbackVocabulary: Pair[] = [
    { jp: "一", en: "One" },
    { jp: "二", en: "Two" },
    { jp: "三", en: "Three" },
    { jp: "四", en: "Four" },
    { jp: "五", en: "Five" },
    { jp: "六", en: "Six" },
    { jp: "七", en: "Seven" },
    { jp: "八", en: "Eight" },
    { jp: "九", en: "Nine" },
    { jp: "十", en: "Ten" },
    { jp: "百", en: "Hundred" },
    { jp: "千", en: "Thousand" },
    { jp: "万", en: "Ten Thousand" },
    { jp: "日", en: "Day" },
    { jp: "月", en: "Month" },
    { jp: "火", en: "Fire" },
    { jp: "水", en: "Water" },
    { jp: "木", en: "Tree" },
    { jp: "金", en: "Gold" },
    { jp: "土", en: "Earth" },
    { jp: "本", en: "Book" },
    { jp: "人", en: "Person" },
    { jp: "男", en: "Man" },
    { jp: "女", en: "Woman" },
    { jp: "子", en: "Child" },
    { jp: "学", en: "Study" },
    { jp: "生", en: "Life" },
    { jp: "先", en: "Previous" },
    { jp: "今", en: "Now" },
    { jp: "何", en: "What" },
    { jp: "時", en: "Time" },
    { jp: "分", en: "Minute" },
    { jp: "半", en: "Half" },
    { jp: "上", en: "Up" },
    { jp: "下", en: "Down" },
    { jp: "中", en: "Middle" },
    { jp: "外", en: "Outside" },
    { jp: "右", en: "Right" },
    { jp: "左", en: "Left" },
    { jp: "前", en: "Front" },
    { jp: "後", en: "Back" },
    { jp: "東", en: "East" },
    { jp: "西", en: "West" },
    { jp: "南", en: "South" },
    { jp: "北", en: "North" },
    { jp: "山", en: "Mountain" },
    { jp: "川", en: "River" },
    { jp: "田", en: "Rice Field" },
    { jp: "天", en: "Sky" },
    { jp: "空", en: "Sky" },
    { jp: "雨", en: "Rain" },
    { jp: "気", en: "Spirit" },
    { jp: "電", en: "Electric" },
    { jp: "車", en: "Car" },
    { jp: "駅", en: "Station" },
    { jp: "道", en: "Road" },
    { jp: "会", en: "Meet" },
    { jp: "社", en: "Company" },
    { jp: "名", en: "Name" },
    { jp: "国", en: "Country" },
    { jp: "店", en: "Shop" },
    { jp: "校", en: "School" },
    { jp: "友", en: "Friend" },
    { jp: "父", en: "Father" },
    { jp: "母", en: "Mother" },
    { jp: "兄", en: "Older Brother" },
    { jp: "姉", en: "Older Sister" },
    { jp: "弟", en: "Younger Brother" },
    { jp: "妹", en: "Younger Sister" },
    { jp: "家", en: "House" },
    { jp: "毎", en: "Every" },
    { jp: "週", en: "Week" },
    { jp: "年", en: "Year" },
    { jp: "円", en: "Yen" },
    { jp: "語", en: "Language" },
    { jp: "行", en: "Go" },
    { jp: "来", en: "Come" },
    { jp: "見", en: "See" },
    { jp: "食", en: "Eat" },
    { jp: "飲", en: "Drink" },
    { jp: "書", en: "Write" },
    { jp: "読", en: "Read" },
    { jp: "聞", en: "Hear" },
    { jp: "話", en: "Speak" },
    { jp: "買", en: "Buy" },
    { jp: "入", en: "Enter" },
    { jp: "出", en: "Exit" },
    { jp: "大", en: "Big" },
    { jp: "小", en: "Small" },
    { jp: "少", en: "Few" },
    { jp: "多", en: "Many" },
    { jp: "長", en: "Long" },
    { jp: "高", en: "Tall" },
    { jp: "安", en: "Cheap" },
    { jp: "新", en: "New" },
    { jp: "古", en: "Old" },
    { jp: "白", en: "White" },
    { jp: "黒", en: "Black" },
    { jp: "赤", en: "Red" },
    { jp: "青", en: "Blue" }
];

const shuffle = <T,>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

const joyoMapPath = "/joyo_kanji_en_custom.json";

const audioCache = new Map<string, string>();

export const tileId = (tile: Tile): string => `${tile.key}::${tile.side}`;

export const createGame = () => {
    const grades = writable<Grade[]>([]);
    const rounds = writable<Round[]>([]);
    const status = writable("Laduje kanji z pliku...");

    const buildRounds = () => {
        const currentGrades = get(grades);
        const nextRounds: Round[] = [];

        const nextGrades = currentGrades.map((grade, gradeIndex) => {
            const roundIndexes: number[] = [];
            const shuffledPairs = grade.pairs;

            for (let i = 0; i < shuffledPairs.length; i += maxPairs) {
                const pairs = shuffledPairs.slice(i, i + maxPairs);

                const jpTiles = pairs.map((item) => ({
                    key: item.jp,
                    text: item.jp,
                    side: "jp" as const,
                    hiragana: item.hiragana
                }));

                const enTiles = [...pairs]
                    .sort((a, b) => a.en.localeCompare(b.en, "en", { sensitivity: "base" }))
                    .map((item) => ({
                        key: item.jp,
                        text: item.en,
                        side: "en" as const
                    }));

                const round: Round = {
                    pairs,
                    gradeIndex,
                    gradeLabel: grade.label,
                    tabNumber: roundIndexes.length + 1,
                    jpTiles,
                    enTiles,
                    matchedKeys: new Set(),
                    firstSelection: null,
                    errorTiles: new Set(),
                    hintTileId: null,
                    lockBoard: false
                };
                nextRounds.push(round);
                roundIndexes.push(nextRounds.length - 1);
            }

            return { ...grade, roundIndexes };
        });

        rounds.set(nextRounds);
        grades.set(nextGrades);
    };

    const clearSelection = (roundIndex: number) => {
        rounds.update(rs => {
            const updated = [...rs];
            if (updated[roundIndex]) {
                updated[roundIndex] = {
                    ...updated[roundIndex],
                    firstSelection: null,
                    hintTileId: null
                };
            }
            return updated;
        });
    };

    const setSelection = (roundIndex: number, tile: Tile) => {
        rounds.update(rs => {
            const updated = [...rs];
            if (updated[roundIndex]) {
                updated[roundIndex] = {
                    ...updated[roundIndex],
                    firstSelection: tile,
                    hintTileId: null
                };
            }
            return updated;
        });
    };

    const handleMatch = (roundIndex: number, tile: Tile) => {
        rounds.update(rs => {
            const updated = [...rs];
            const round = updated[roundIndex];
            if (!round) return updated;

            const nextMatched = new Set(round.matchedKeys);
            nextMatched.add(tile.key);

            updated[roundIndex] = {
                ...round,
                matchedKeys: nextMatched,
                lockBoard: true
            };

            setTimeout(() => {
                rounds.update(rs2 => {
                    const updated2 = [...rs2];
                    if (updated2[roundIndex]) {
                        updated2[roundIndex] = {
                            ...updated2[roundIndex],
                            firstSelection: null,
                            hintTileId: null,
                            lockBoard: false
                        };
                    }
                    return updated2;
                });

                if (nextMatched.size === round.pairs.length) {
                    status.set("Brawo! Wszystkie pary dopasowane w tej rundzie.");
                } else {
                    status.set("Dobrze! Szukaj kolejnej pary.");
                }
            }, 400);

            return updated;
        });
    };

    const handleMismatch = (roundIndex: number, tile: Tile, selection: Tile) => {
        rounds.update(rs => {
            const updated = [...rs];
            const round = updated[roundIndex];
            if (!round) return updated;

            const nextErrors = new Set(round.errorTiles);
            nextErrors.add(tileId(tile));
            nextErrors.add(tileId(selection));

            updated[roundIndex] = {
                ...round,
                errorTiles: nextErrors,
                lockBoard: true
            };

            setTimeout(() => {
                rounds.update(rs2 => {
                    const updated2 = [...rs2];
                    if (updated2[roundIndex]) {
                        updated2[roundIndex] = {
                            ...updated2[roundIndex],
                            errorTiles: new Set(),
                            lockBoard: false
                        };
                    }
                    return updated2;
                });
            }, 500);

            return updated;
        });
        status.set("To nie jest para. Sprobuj ponownie.");
    };

    const resetPair = (roundIndex: number, tile: Tile) => {
        rounds.update(rs => {
            const updated = [...rs];
            const round = updated[roundIndex];
            if (!round) return updated;

            // Reset matched pair
            const nextMatched = new Set(round.matchedKeys);
            if (round.matchedKeys.has(tile.key)) {
                nextMatched.delete(tile.key);
            }

            // Reset errors
            const nextErrors = new Set(round.errorTiles);
            nextErrors.delete(`${tile.key}::jp`);
            nextErrors.delete(`${tile.key}::en`);

            // Clear selection if this tile or its key is selected
            const shouldClearSelection =
                round.firstSelection &&
                (round.firstSelection.key === tile.key || tileId(round.firstSelection) === tileId(tile));

            const nextHint =
                round.hintTileId &&
                    round.hintTileId.startsWith(`${tile.key}::`)
                    ? null
                    : round.hintTileId;

            updated[roundIndex] = {
                ...round,
                matchedKeys: nextMatched,
                errorTiles: nextErrors,
                firstSelection: shouldClearSelection ? null : round.firstSelection,
                hintTileId: nextHint,
                lockBoard: false
            };

            return updated;
        });
    };

    const onTileClick = (roundIndex: number, tile: Tile) => {
        const currentRounds = get(rounds);
        const round = currentRounds[roundIndex];
        if (!round || round.lockBoard || round.matchedKeys.has(tile.key)) {
            return;
        }

        if (tile.side === "jp") {
            void playAudio(tile);
        }

        const selection = round.firstSelection;
        if (!selection) {
            setSelection(roundIndex, tile);
            return;
        }

        if (tile.key === selection.key && tile.side === selection.side) {
            return;
        }

        // If clicking another tile from the same side, change selection
        if (tile.side === selection.side) {
            setSelection(roundIndex, tile);
            return;
        }

        if (tile.key === selection.key && tile.side !== selection.side) {
            handleMatch(roundIndex, tile);
        } else {
            handleMismatch(roundIndex, tile, selection);
        }
    };

    const onTileHover = (roundIndex: number, tile: Tile) => {
        const currentRounds = get(rounds);
        const round = currentRounds[roundIndex];
        if (!round || !round.firstSelection || round.lockBoard || round.matchedKeys.has(tile.key)) {
            return;
        }
        const selection = round.firstSelection;
        if (selection && tile.key === selection.key && tile.side !== selection.side) {
            rounds.update(rs => {
                const updated = [...rs];
                if (updated[roundIndex]) {
                    updated[roundIndex] = {
                        ...updated[roundIndex],
                        hintTileId: tileId(tile)
                    };
                }
                return updated;
            });
        }
    };

    const onTileHoverOut = (roundIndex: number, tile: Tile) => {
        const currentRounds = get(rounds);
        const round = currentRounds[roundIndex];
        if (round && round.hintTileId === tileId(tile)) {
            rounds.update(rs => {
                const updated = [...rs];
                if (updated[roundIndex]) {
                    updated[roundIndex] = {
                        ...updated[roundIndex],
                        hintTileId: null
                    };
                }
                return updated;
            });
        }
    };

    const playAudio = async (tile: Tile) => {
        const text = tile.hiragana || tile.text;
        if (!text) {
            return;
        }
        if (audioCache.has(text)) {
            const cached = audioCache.get(text);
            if (cached) {
                const audio = new Audio(cached);
                void audio.play();
            }
            return;
        }

        const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);

        if (!response.ok) {
            return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audioCache.set(text, url);
        const audio = new Audio(url);
        void audio.play();
    };

    const loadFromJoyoText = async () => {
        const joyoResponse = await fetch(joyoMapPath);
        if (!joyoResponse.ok) {
            throw new Error("Nie udalo sie pobrac Joyo kanji.");
        }
        const data = (await joyoResponse.json()) as JoyoData;
        const groups = Array.isArray(data.groups) ? data.groups : [];

        grades.set(
            groups.map((group) => {
                const items = Array.isArray(group.items) ? group.items : [];
                const pairs = items.map((item) => ({
                    jp: item.kanji || "",
                    en: item.meaning || item.kanji || "",
                    hiragana: item.hiragana || ""
                }));
                return {
                    label: `${group.label} (${pairs.length} kanji)`,
                    pairs,
                    roundIndexes: []
                };
            })
        );
    };

    const loadFallback = () => {
        grades.set([
            {
                label: `Fallback (${fallbackVocabulary.length} kanji)`,
                pairs: fallbackVocabulary,
                roundIndexes: []
            }
        ]);
    };

    const init = async () => {
        status.set("Laduje kanji z pliku...");
        try {
            await loadFromJoyoText();
            grades.set(get(grades).filter((grade) => grade.pairs.length > 0));
            if (!get(grades).length) {
                loadFallback();
            }
        } catch (error) {
            loadFallback();
        }

        buildRounds();
        status.set("Gotowe! Dopasuj pary kanji.");
    };

    const debugShowPairs = (roundIndex: number) => {
        const currentRounds = get(rounds);
        const round = currentRounds[roundIndex];
        if (!round) return;
        console.log(`=== Runda ${roundIndex + 1} - wszystkie pary ===`);
        console.log(`${round.gradeLabel} • Karta ${round.tabNumber}`);
        round.pairs.forEach((pair, i) => {
            console.log(`${i + 1}. ${pair.jp} (${pair.hiragana}) = ${pair.en}`);
        });
        console.log(`Łącznie: ${round.pairs.length} par`);
    };

    return {
        grades,
        rounds,
        status,
        init,
        onTileClick,
        resetPair,
        onTileHover,
        onTileHoverOut,
        debugShowPairs
    };
};
