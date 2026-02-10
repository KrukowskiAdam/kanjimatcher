<script lang="ts">
</script>

<svelte:head>
    <title>Kanjimatcher - Home</title>
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
            <div class="flex-1 px-4">
                <h1 class="text-2xl font-bold text-white">Kanjimatcher</h1>
            </div>
        </nav>

        <!-- Page content -->
        <div class="hero min-h-[calc(100vh-64px)] bg-dark-bg">
            <div class="hero-content text-center">
                <div class="max-w-2xl">
                    <h1 class="text-5xl font-bold text-white mb-8">
                        Welcome to Kanjimatcher
                    </h1>
                    <p class="text-xl text-gray-300 mb-12">
                        Choose your learning mode to start matching!
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Kanji Card -->
                        <a
                            href="/kanji"
                            class="card bg-dark-card hover:bg-dark-border transition-colors border-2 border-dark-border hover:border-level-expert"
                        >
                            <div class="card-body items-center text-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="w-16 h-16 mb-4 text-level-expert"
                                >
                                    <path d="M4 7V4h16v3" />
                                    <path d="M9 20h6" />
                                    <path d="M12 4v16" />
                                </svg>
                                <h2 class="card-title text-white text-2xl">
                                    Kanji
                                </h2>
                                <p class="text-gray-300">
                                    Match Japanese kanji with English meanings
                                </p>
                            </div>
                        </a>

                        <!-- Hiragana Card -->
                        <div
                            class="card bg-dark-card border-2 border-dark-border opacity-50 cursor-not-allowed"
                        >
                            <div class="card-body items-center text-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="w-16 h-16 mb-4 text-level-learning"
                                >
                                    <path
                                        d="M12 3a9 9 0 0 0 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9"
                                    />
                                    <path d="M8 12h8" />
                                </svg>
                                <h2 class="card-title text-white text-2xl">
                                    Hiragana
                                </h2>
                                <p class="text-gray-300">Coming soon</p>
                            </div>
                        </div>

                        <!-- Katakana Card -->
                        <div
                            class="card bg-dark-card border-2 border-dark-border opacity-50 cursor-not-allowed"
                        >
                            <div class="card-body items-center text-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="w-16 h-16 mb-4 text-level-mastered"
                                >
                                    <path d="M4 4l16 16" />
                                    <path d="M4 20L20 4" />
                                    <path d="M12 8v8" />
                                </svg>
                                <h2 class="card-title text-white text-2xl">
                                    Katakana
                                </h2>
                                <p class="text-gray-300">Coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                <!-- Home section (active) -->
                <li>
                    <a
                        href="/"
                        class="is-drawer-close:tooltip is-drawer-close:tooltip-right btn-active"
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

                <!-- Kanji section -->
                <li>
                    <a
                        href="/kanji"
                        class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                        data-tip="Kanji"
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
                    </a>
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
