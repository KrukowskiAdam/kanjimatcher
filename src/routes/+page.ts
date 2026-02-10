import type { PageLoad } from "./$types";

type JoyoGroup = {
    label?: string;
};

type JoyoResponse = {
    groups?: JoyoGroup[];
};

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch("/joyo_kanji_en_custom.json");

    if (!response.ok) {
        return { labels: [] };
    }

    const data = (await response.json()) as JoyoResponse;
    const labels = Array.isArray(data.groups)
        ? data.groups.map((group) => group.label).filter(Boolean)
        : [];

    return {
        labels,
    };
};
