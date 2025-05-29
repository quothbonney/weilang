# WeiLang (微朗) - Enhanced Chinese Language Learning App

<div align="center">

![WeiLang Logo](./assets/icon.png)

**A comprehensive Chinese language learning app with AI-powered word profiles and linguistic analysis**

[![React Native](https://img.shields.io/badge/React%20Native-0.79-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~53.0-green.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-orange.svg)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-0BSD-lightgrey.svg)](LICENSE)

</div>

## 🌟 Features

### 📚 Core Learning System
- **Spaced Repetition Algorithm (SRS)** - Intelligent review scheduling with configurable parameters
- **Comprehensive Flashcard System** - Multi-modal cards with text, pinyin, and audio
- **Progress Tracking** - Detailed statistics on learning progress and retention rates
- **Adaptive Difficulty** - Dynamic ease adjustments based on performance

### 🧠 Enhanced Word Profiles
- **Unicode Character Analysis** - Deep linguistic analysis using Unihan database (13,000+ characters)
- **Radical Breakdown** - Complete radical analysis with meanings and stroke information
- **Stroke Order Visualization** - SVG-based stroke order animations from Make Me A Hanzi
- **AI-Generated Examples** - Contextual sentence generation using large language models
- **Multi-Source Definitions** - Dictionary integration with Lingvanex API
- **Cultural Context** - Etymology and cultural usage notes

### 🎯 Smart Features
- **Intelligent Example Generation** - Multiple generation modes (strict, flexible, relaxed, independent)
- **Character Component Analysis** - Breakdown of complex characters into semantic components
- **Related Word Discovery** - Find words sharing common characters or radicals
- **Memory Aids** - AI-generated mnemonics and learning tips
- **Offline Capability** - Full functionality without internet connection

### 🔊 Audio & Speech
- **Text-to-Speech Integration** - Azure TTS support with native Chinese voices
- **Auto-play Options** - Configurable audio playback during reviews
- **Pronunciation Practice** - Audio feedback for character pronunciation

## 🏗️ Architecture

WeiLang follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── domain/                 # Business logic and entities
│   ├── entities.ts        # Core data structures
│   ├── repositories/      # Repository interfaces
│   ├── usecases/         # Business use cases
│   └── srs.ts            # Spaced repetition system
├── infra/                # External integrations
│   ├── storage/          # Database repositories
│   ├── api/              # External API clients
│   ├── llm/              # Language model adapters
│   └── services/         # Orchestration services
├── ui/                   # User interface
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   └── hooks/            # React hooks and state
└── platform/            # Platform-specific code
    └── storageProvider.ts # Storage abstraction
```

## 🛠️ Tech Stack

### Frontend
- **React Native 0.79** - Cross-platform mobile development
- **Expo ~53.0** - Development platform and tooling
- **TypeScript 5.8** - Type-safe JavaScript
- **Zustand 5.0** - Lightweight state management
- **React Navigation** - Navigation library
- **NativeWind** - Tailwind CSS for React Native
- **Gluestack UI** - Modern component library

### Backend & Data
- **SQLite** - Local database with Expo SQLite
- **Dexie** - IndexedDB wrapper for web platform
- **AsyncStorage** - Persistent key-value storage

### External Integrations
- **Unihan Database** - Unicode character data (official)
- **Make Me A Hanzi** - Stroke order SVG graphics
- **Together AI** - LLM services (DeepSeek, Llama, Qwen models)
- **Lingvanex API** - Dictionary and translation services
- **Azure Text-to-Speech** - High-quality Chinese voice synthesis

## 📊 Data Sources

### Unihan Unicode Database
- **13,000+ Chinese characters** with complete linguistic metadata
- **Radical information** - 214 traditional radicals with meanings
- **Stroke counts** - Accurate stroke data for all characters
- **Pronunciations** - Mandarin pinyin readings
- **Definitions** - English definitions and semantic information

### Make Me A Hanzi
- **Stroke order animations** - SVG-based stroke sequences
- **Character composition** - Breakdown of character structures
- **Writing guides** - Proper stroke order for learning

### AI Language Models
- **DeepSeek V3** - Advanced reasoning and Chinese language understanding
- **Llama 3.1 405B** - Large-scale language model for context generation
- **Qwen 2.5 72B** - Chinese-optimized language model

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- Expo CLI (`npm install -g @expo/cli`)
- Python 3.8+ (for data processing scripts)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weilang.git
   cd weilang
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the environment**
   ```bash
   # Copy the environment template
   cp .env.example .env
   
   # Edit .env with your API keys (see Configuration section)
   ```

4. **Process the language data**
   ```bash
   # Run the data setup scripts (Windows)
   powershell -ExecutionPolicy Bypass -File scripts/setup_data.ps1
   
   # Or run individually:
   # powershell scripts/download_unihan.ps1
   # powershell scripts/fetch_mmah.ps1
   # python scripts/etl_unihan.py
   ```

5. **Start the development server**
   ```bash
   npx expo start
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Together AI API Key (Required for enhanced features)
# Get yours at: https://api.together.xyz
TOGETHER_API_KEY=your_together_api_key_here

# Lingvanex API Key (Optional - for enhanced dictionary)
# Get yours at: https://platform.lingvanex.com
LINGVANEX_API_KEY=your_lingvanex_api_key_here

# OpenAI API Key (Optional - alternative LLM provider)
# Get yours at: https://platform.openai.com
OPENAI_API_KEY=your_openai_api_key_here

# Azure Text-to-Speech (Optional - for high-quality audio)
# Get yours at: https://azure.microsoft.com/services/cognitive-services/text-to-speech/
AZURE_TTS_KEY=your_azure_tts_key_here
AZURE_TTS_REGION=eastus
# Cloudflare R2 credentials for optional cloud sync
CLOUDFLARE_R2_ENDPOINT=https://45c66fbe749ca506d51c9e5abb532ea5.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET=weilang-sync
S3_CLIENT_ACCESS_KEY=your_access_key
S3_CLIENT_SECRET_ACCESS_KEY=your_secret_key
```

### API Keys Setup

#### 1. Together AI (Recommended)
- Sign up at [api.together.xyz](https://api.together.xyz)
- Create an API key
- Supports multiple Chinese-optimized models
- Cost-effective for example generation

#### 2. Lingvanex (Optional)
- Sign up at [platform.lingvanex.com](https://platform.lingvanex.com)
- Provides enhanced dictionary definitions
- Synonyms and antonyms support

#### 3. Azure Text-to-Speech (Optional)
- Create an Azure account
- Enable Cognitive Services
- Provides natural Chinese voice synthesis

#### 4. Cloudflare R2 (Optional)
- Create a Cloudflare account and enable R2
- Create a bucket (e.g., `weilang-sync`)

- Generate an Access Key and Secret Key
- Used for backing up your data to the cloud

## 🎯 Usage

### Basic Learning Flow

1. **Import Words** - Start with the built-in vocabulary of 300 HSK words
2. **Study Mode** - Review flashcards with spaced repetition
3. **Enhanced Profiles** - Tap any word to see comprehensive analysis
4. **Track Progress** - Monitor learning statistics and retention rates

### Flashcard Modes

- **Standard Mode** - Show Chinese, answer with meaning
- **Reverse Mode** - Show English, answer with Chinese
- **Mixed Mode** - Combination of both directions
- **Typing Mode** - Type answers for active recall

### Word Profile Features

Each word profile includes:
- **Character Breakdown** - Analysis of individual characters
- **Radical Information** - Etymology and meaning of radicals
- **Stroke Order** - Interactive stroke animations
- **Example Sentences** - AI-generated contextual examples
- **Cultural Notes** - Usage patterns and cultural context
- **Memory Aids** - Mnemonics and learning tips

### Settings & Customization

- **SRS Parameters** - Adjust review intervals and ease factors
- **Audio Settings** - Configure TTS preferences
- **Generation Modes** - Control AI example complexity
- **Model Selection** - Choose between different LLM models


## 🧪 Development

### Project Structure

```
weilang/
├── app/                    # Expo Router screens
├── assets/                 # Static assets and database files
├── data/                   # Processed language data
│   ├── cache/             # Profile cache storage
│   ├── databases/         # SQLite databases
│   ├── strokes/           # SVG stroke order files
│   └── unihan/            # Raw Unihan text files
├── scripts/               # Data processing scripts
│   ├── download_unihan.ps1
│   ├── fetch_mmah.ps1
│   ├── etl_unihan.py
│   └── setup_data.ps1
├── src/                   # Application source code
└── temp/                  # Temporary processing files
```

### Adding New Features

1. **Domain First** - Define entities and use cases
2. **Infrastructure** - Implement repositories and external integrations
3. **UI Layer** - Create screens and components
4. **Testing** - Add unit tests for business logic

### Data Processing

The app uses a sophisticated ETL pipeline:

1. **Download** - Fetch latest Unicode and stroke data
2. **Process** - Parse and normalize linguistic data
3. **Index** - Create optimized SQLite database
4. **Bundle** - Package as app assets

### Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the architectural patterns
4. Add tests for new functionality
5. Submit a pull request

## 🔧 Troubleshooting

### Common Issues

#### SQLite WASM Error on Web
```
Unable to resolve "./wa-sqlite/wa-sqlite.wasm"
```
**Solution**: Ensure Metro config includes WASM support:
```js
// metro.config.js
config.resolver.assetExts.push('wasm');
```

#### Database Not Found
**Solution**: Run the data setup scripts:
```bash
powershell scripts/setup_data.ps1
```

#### API Rate Limiting
**Solution**: 
- Check API key validity
- Monitor usage limits
- Implement request queuing

#### Memory Issues with Large Database
**Solution**:
- Use pagination for large queries
- Implement proper database indexing
- Clear profile cache regularly

### Development Tips

- Use `npx expo start --clear` to clear Metro cache
- Check console logs for database initialization messages
- Use React DevTools for debugging state management
- Monitor network requests for API integration issues

## 📈 Roadmap

### Planned Features
- **HSK Level Integration** - Structured curriculum progression
- **Handwriting Recognition** - Practice character writing
- **Voice Recognition** - Pronunciation assessment
- **Social Features** - Study groups and progress sharing
- **Offline Sync** - Cloud backup and multi-device sync
- **Advanced Analytics** - Detailed learning insights

### Technical Improvements
- **Performance Optimization** - Lazy loading and caching
- **Test Coverage** - Comprehensive unit and integration tests
- **Accessibility** - Screen reader and keyboard navigation support
- **Internationalization** - Multiple UI languages

## 📄 License

This project is licensed under the 0BSD License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Unicode Consortium** - Unihan Database
- **Skishore** - Make Me A Hanzi project
- **Together AI** - Language model services
- **Expo Team** - React Native platform
- **Chinese Language Community** - Linguistic expertise

## 📞 Support

- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Comprehensive guides and API docs
- **Community** - Discord server for discussions

---

<div align="center">

**Built with ❤️ for Chinese language learners worldwide**

[⭐ Star this repo](https://github.com/yourusername/weilang) | [🐛 Report Bug](https://github.com/yourusername/weilang/issues) | [💡 Request Feature](https://github.com/yourusername/weilang/issues)

</div>
