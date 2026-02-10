<script lang="ts">
    export let data: { labels?: string[] } | undefined;

    import { onMount } from "svelte";
    import { createGame, tileId } from "$lib/game";
    const labels = data?.labels ?? [];
    let selectedGroupLabel = labels[0] ?? "";

    function handleGroupClick(label: string) {
        selectedGroupLabel = label;
        // Close drawer after selection
        const drawerToggle = document.getElementById(
            "my-drawer",
        ) as HTMLInputElement;
        if (drawerToggle) {
            drawerToggle.checked = false;
        }
    }

    const game = createGame();
    const {
        grades,
        rounds,
        status,
        onTileClick,
        resetPair,
        onTileHover,
        onTileHoverOut,
        debugShowPairs,
    } = game;

    onMount(async () => {
        await game.init();

        // Auto close details when drawer closes
        const drawerToggle = document.getElementById(
            "my-drawer",
        ) as HTMLInputElement;
        const kanjiDetails = document.getElementById(
            "kanji-details",
        ) as HTMLDetailsElement;

        if (drawerToggle && kanjiDetails) {
            // Set initial state: open on desktop
            const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
            kanjiDetails.open = isDesktop;

            // Listen to drawer changes - close details when drawer closes
            drawerToggle.addEventListener("change", () => {
                if (!drawerToggle.checked) {
                    // Close details when drawer closes
                    kanjiDetails.open = false;
                }
            });

            // Listen to screen resize
            const mediaQuery = window.matchMedia("(min-width: 1024px)");
            mediaQuery.addEventListener("change", (e) => {
                if (e.matches) {
                    kanjiDetails.open = true;
                } else if (!drawerToggle.checked) {
                    kanjiDetails.open = false;
                }
            });
        }
    });
</script>

<svelte:head>
    <title>Kanjimatcher - Kanji</title>
</svelte:head>

<div class="drawer lg:drawer-open min-h-screen bg-dark-bg">
    <input
        id="my-drawer"
        type="checkbox"
        class="drawer-toggle transition-none"
    />

    <div class="drawer-content">
        <!-- Navbar -->
        <nav class="navbar w-full bg-dark-card border-b border-dark-border">
            <label
                for="my-drawer"
                aria-label="open sidebar"
                class="btn btn-square btn-ghost lg:hidden"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-6 h-6 stroke-current"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                </svg>
            </label>
            <div class="flex-1 px-4 flex items-center gap-2">
                <a href="/" class="btn btn-ghost btn-sm">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="w-4 h-4"
                    >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                        ></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </a>
                <h1 class="text-2xl font-bold text-white">Kanji</h1>
            </div>
            {#if selectedGroupLabel}
                <div class="px-4">
                    <span class="badge badge-lg bg-level-expert text-white"
                        >{selectedGroupLabel}</span
                    >
                </div>
            {/if}
        </nav>

        <!-- Page content -->
        <div class="p-6">
            <div class="text-center mb-8">
                <p class="text-gray-300">
                    Match the Japanese characters with their English meanings
                </p>
            </div>

            <section class="max-w-6xl mx-auto">
                {#each $rounds.filter((round) => !selectedGroupLabel || round.gradeLabel.startsWith(selectedGroupLabel)) as round, roundIndex}
                    <div class="w-full">
                        <div class="mb-4 text-sm font-semibold text-gray-300">
                            {round.gradeLabel} • Karta {round.tabNumber}
                        </div>
                        <main class="board" id="board-{roundIndex + 1}">
                            <section class="column" aria-label="Kanji">
                                <div class="column-title">JP</div>
                                {#each round.jpTiles as tile}
                                    <button
                                        type="button"
                                        class="tile tile--jp"
                                        class:selected={round.firstSelection
                                            ?.key === tile.key &&
                                            round.firstSelection?.side ===
                                                tile.side}
                                        class:matched={round.matchedKeys.has(
                                            tile.key,
                                        )}
                                        class:error={round.errorTiles.has(
                                            tileId(tile),
                                        )}
                                        class:hint={round.hintTileId ===
                                            tileId(tile)}
                                        on:click={() =>
                                            onTileClick(roundIndex, tile)}
                                        on:contextmenu|preventDefault={() =>
                                            resetPair(roundIndex, tile)}
                                        on:mouseenter={() =>
                                            onTileHover(roundIndex, tile)}
                                        on:mouseleave={() =>
                                            onTileHoverOut(roundIndex, tile)}
                                    >
                                        <span class="kanji">{tile.text}</span>
                                        {#if tile.hiragana}
                                            <span
                                                class="hiragana"
                                                role="button"
                                                tabindex="0"
                                                on:click|stopPropagation
                                                on:contextmenu|preventDefault|stopPropagation={() =>
                                                    resetPair(roundIndex, tile)}
                                                on:keydown={(e) =>
                                                    e.key === "Enter" &&
                                                    e.stopPropagation()}
                                                >{tile.hiragana}</span
                                            >
                                        {/if}
                                    </button>
                                {/each}
                            </section>

                            <section class="column" aria-label="English">
                                <div class="column-title">EN</div>
                                {#each round.enTiles as tile}
                                    <button
                                        type="button"
                                        class="tile tile--en"
                                        class:selected={round.firstSelection
                                            ?.key === tile.key &&
                                            round.firstSelection?.side ===
                                                tile.side}
                                        class:matched={round.matchedKeys.has(
                                            tile.key,
                                        )}
                                        class:error={round.errorTiles.has(
                                            tileId(tile),
                                        )}
                                        class:hint={round.hintTileId ===
                                            tileId(tile)}
                                        on:click={() =>
                                            onTileClick(roundIndex, tile)}
                                        on:contextmenu|preventDefault={() =>
                                            resetPair(roundIndex, tile)}
                                        on:mouseenter={() =>
                                            onTileHover(roundIndex, tile)}
                                        on:mouseleave={() =>
                                            onTileHoverOut(roundIndex, tile)}
                                    >
                                        {tile.text}
                                    </button>
                                {/each}
                            </section>
                        </main>
                    </div>
                {/each}

                <div class="text-center text-gray-300 mt-6">{$status}</div>
            </section>
        </div>
    </div>

    <!-- Drawer sidebar -->
    <div class="drawer-side z-50 transition-none">
        <label
            for="my-drawer"
            aria-label="close sidebar"
            class="drawer-overlay transition-none"
        ></label>
        <div
            class="flex min-h-full flex-col items-start bg-dark-card border-r border-dark-border is-drawer-close:w-20 is-drawer-open:w-80 overflow-hidden lg:is-drawer-close:overflow-visible transition-none"
        >
            <!-- Toggle button (desktop only) -->
            <div
                class="w-full p-4 border-b border-dark-border hidden lg:flex justify-end"
            >
                <label
                    for="my-drawer"
                    class="btn btn-square btn-ghost btn-sm is-drawer-open:rotate-180"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="w-5 h-5"
                    >
                        <path d="M9 18l6-6-6-6"></path>
                    </svg>
                </label>
            </div>

            <!-- Sidebar content -->
            <ul
                class="menu w-full grow p-2 is-drawer-close:hidden lg:is-drawer-close:block transition-none"
            >
                <!-- Home section -->
                <li>
                    <a
                        href="/"
                        class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                        data-tip="Home"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="my-1.5 inline-block size-4"
                        >
                            <path
                                d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                            ></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span class="is-drawer-close:hidden">Home</span>
                    </a>
                </li>

                <div class="divider m-0"></div>

                <!-- Kanji section with expandable list -->
                <li>
                    <details id="kanji-details" class="btn-active">
                        <summary
                            class="is-drawer-close:after:hidden is-drawer-close:pointer-events-none lg:is-drawer-close:pointer-events-auto"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="my-1.5 inline-block size-4"
                            >
                                <path d="M4 7V4h16v3" />
                                <path d="M9 20h6" />
                                <path d="M12 4v16" />
                            </svg>
                            <span class="is-drawer-close:hidden">Kanji</span>
                        </summary>
                        <ul
                            class="is-drawer-close:hidden lg:is-drawer-close:block"
                        >
                            {#each labels as label, index}
                                <li>
                                    <button
                                        type="button"
                                        class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                                        class:btn-active={label ===
                                            selectedGroupLabel}
                                        data-tip={label}
                                        on:click={() => handleGroupClick(label)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            class="my-1.5 inline-block size-4"
                                        >
                                            <rect
                                                x="3"
                                                y="3"
                                                width="18"
                                                height="18"
                                                rx="2"
                                            />
                                            <path d="M9 3v18" />
                                        </svg>
                                        <span class="is-drawer-close:hidden"
                                            >{label}</span
                                        >
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    </details>
                </li>

                <!-- Hiragana section -->
                <li>
                    <button
                        type="button"
                        disabled
                        class="is-drawer-close:tooltip is-drawer-close:tooltip-right opacity-50"
                        data-tip="Hiragana (Coming soon)"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="my-1.5 inline-block size-4"
                        >
                            <path
                                d="M12 3a9 9 0 0 0 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9"
                            />
                            <path d="M8 12h8" />
                        </svg>
                        <span class="is-drawer-close:hidden">Hiragana</span>
                    </button>
                </li>

                <!-- Katakana section -->
                <li>
                    <button
                        type="button"
                        disabled
                        class="is-drawer-close:tooltip is-drawer-close:tooltip-right opacity-50"
                        data-tip="Katakana (Coming soon)"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="my-1.5 inline-block size-4"
                        >
                            <path d="M4 4l16 16" />
                            <path d="M4 20L20 4" />
                            <path d="M12 8v8" />
                        </svg>
                        <span class="is-drawer-close:hidden">Katakana</span>
                    </button>
                </li>
            </ul>
        </div>
    </div>
</div>

<style>
    .board {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        background: var(--dark-card);
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
    }

    .column {
        display: grid;
        grid-template-columns: repeat(3, minmax(90px, 1fr));
        gap: 10px;
        align-content: start;
    }

    .column-title {
        grid-column: 1 / -1;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.12em;
        color: var(--level-expert);
    }

    .tile {
        background: var(--dark-card);
        border: 2px solid var(--dark-border);
        border-radius: 14px;
        padding: 6px;
        text-align: center;
        height: 78px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 1.1;
        font-size: clamp(0.95rem, 1.6vw, 1.2rem);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        user-select: none;
        transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
    }

    .kanji {
        font-size: clamp(1.1rem, 1.8vw, 1.4rem);
        line-height: 1;
        color: #ffffff;
    }

    .hiragana {
        font-size: clamp(0.6rem, 0.9vw, 0.75rem);
        opacity: 0.65;
        margin-top: 2px;
        letter-spacing: 0.02em;
        cursor: text;
        color: #ffffff;
    }

    .tile--en {
        font-size: clamp(0.75rem, 1vw, 0.95rem);
        color: #ffffff;
        user-select: text;
    }

    .tile:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 16px rgba(0, 0, 0, 0.4);
    }

    .tile.selected {
        border-color: var(--level-learning);
        box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.3);
    }

    .tile.matched {
        opacity: 0.3;
        background: var(--dark-bg);
        border-color: var(--dark-border);
        color: var(--button-disabled);
        cursor: not-allowed;
    }

    .tile.matched:hover {
        transform: none;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    }

    .tile.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
    }

    .tile.hint {
        border-color: var(--level-expert);
        box-shadow: 0 0 0 2px rgba(255, 140, 2, 0.3);
    }

    @media (max-width: 720px) {
        .board {
            grid-template-columns: 1fr;
        }

        .column {
            grid-template-columns: repeat(2, minmax(90px, 1fr));
        }
    }

    /* Hide dropdown arrow in closed drawer */
    :global(
            .drawer-toggle:not(:checked)
                ~ .drawer-side
                summary.is-drawer-close\:after\:hidden::after
        ) {
        display: none;
    }

    /* Disable details interaction when drawer is closed on desktop */
    @media (min-width: 1024px) {
        :global(.drawer-toggle:not(:checked) ~ .drawer-side details) {
            pointer-events: none;
        }

        :global(.drawer-toggle:not(:checked) ~ .drawer-side details > ul) {
            display: none !important;
        }
    }
</style>
