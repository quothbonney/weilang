# WeiLang (微朗)

[![Expo CI](https://github.com/quothbonney/weilang/actions/workflows/expo.yml/badge.svg)](https://github.com/quothbonney/weilang/actions/workflows/expo.yml)
[![Release](https://github.com/quothbonney/weilang/actions/workflows/release.yml/badge.svg)](https://github.com/quothbonney/weilang/actions/workflows/release.yml)

WeiLang (微朗). A different path to understanding Chinese.
This project explores a more intuitive way to learn, focusing on the underlying structure of the language and effective recall. Open source, for those interested in language, tech, or both.

## The Idea

Learning Chinese is more than flashcards. WeiLang is about seeing the connections – how characters are built, how they sound, and how they're used. We use linguistic data and thoughtful tech to make the learning process more insightful and engaging. It's about active learning and building a genuine feel for the language, on your terms.

Key aspects:
* Character deconstruction (radicals, stroke order).
* AI-assisted examples and insights.
* Spaced Repetition System (SRS) for retention.
* Interactive practice, including handwriting and translation.
* Clean, customizable interface with light/dark modes.
* Offline access for core study.

## Tech

Built with:
* React Native & Expo
* TypeScript
* NativeWind & Custom Theming
* Zustand
* Expo Router
* SQLite (mobile), Dexie.js (web)
* APIs: Together AI, Lingvanex, Azure TTS

## Getting Started (Developers)

1.  **Prerequisites:** Node.js, npm/Yarn, Expo CLI, Python, PowerShell.
2.  **Clone & Install:**
    ```bash
    git clone [https://github.com/quothbonney/weilang.git](https://github.com/quothbonney/weilang.git)
    cd weilang
    npm install
    ```
3.  **Environment (.env):**
    * `LINGVANEX_API_KEY`
    * `TOGETHER_API_KEY`
    * `AZURE_TTS_KEY`
    * `AZURE_TTS_REGION`
4.  **Data Setup (Important):** Run scripts in `scripts/` to process linguistic data:
    * `download_unihan.ps1`
    * `etl_unihan.py`
    * `fetch_mmah.ps1`
    * `import_words.js`
    * `setup_mobile_database.js`
    * Ensure `assets/databases/unihan.sqlite` is created.
5.  **Run:**
    ```bash
    npm start
    ```
    Use Expo Go or web option.
6.  **Cache:** `npm run clear-cache` if needed.

## Project Structure

Clean Architecture is the guide:
* `app/`: Screens (Expo Router).
* `assets/`: Static files, bundled DB.
* `data/`: Processed linguistic data.
* `scripts/`: Dev utilities.
* `src/`:
    * `domain/`: Core logic, entities.
    * `infra/`: Data storage, API clients, services.
    * `ui/`: Components, hooks, store, theming.
        * `ui/components/themed/`: Preferred base for new UI.
    * `platform/`: Platform-specific adaptations.

See `AGENTS.MD` for a more detailed technical brief.

## Contributing

Contributions are welcome – bug fixes, features, ideas.
(Standard contribution process: issues, PRs, etc.)

## Roadmap

Focus areas:
* Refine and fully adopt the theming system.
* Expand test coverage.
* Enhance PWA capabilities.
* Implement robust cloud sync.
* Explore deeper personalization and gamification.

## License

(Specify license: MIT, Apache 2.0, or TBD)

---

Explore. Learn. Build.
