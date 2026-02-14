# Language Learning Companion

A comprehensive web application designed to help users expand their vocabulary and improve language skills through daily word discovery, translation tools, interactive quizzes, and personalized favorites tracking.

**Live Demo:** [https://language-learning-companion-snowy.vercel.app](https://language-learning-companion-snowy.vercel.app)

## 📋 Project Overview

This single-page application (SPA) was built as the final project for WDD330 - Web Frontend Development II. It demonstrates modern web development practices including:

- Single-page application architecture with client-side routing
- RESTful API integration with multiple third-party services
- Progressive Web App (PWA) capabilities
- Responsive design for mobile and desktop
- Local storage for offline data persistence
- WCAG 2.1 AA/AAA accessibility compliance

## ✨ Features

### 🗓️ Daily Word
- Displays a new vocabulary word each day
- Comprehensive word information including:
  - Multiple definitions
  - Phonetic pronunciation with audio playback
  - Example sentences and usage notes
  - Etymology and first known use date
  - Part of speech and word variants
- Thesaurus integration showing synonyms and antonyms
- Save words to favorites for later review
- Real-time progress tracking

### 🔍 Search
- Look up any English word instantly
- Full dictionary and thesaurus data for searched terms
- Same comprehensive layout as daily word view
- Dedicated search results view separate from daily word

### 🌐 Translate
- Real-time translation between 26+ languages
- Powered by DeepL AI translation API
- Automatic language detection
- Source and target language selection
- Clean, accessible interface

### ⭐ Favorites
- Save unlimited words to your personal collection
- View all saved words with definitions and phonetics
- Quick access to detailed word information
- Remove individual favorites or clear all
- Persistent storage using localStorage

### 📝 Quiz
- Interactive vocabulary quiz with 5 questions
- Multiple-choice format testing word definitions
- Randomized answer options
- Immediate feedback on answers
- Score tracking and results summary
- Confetti celebration on perfect scores

### 📊 Progress
- Track weekly learning statistics
- View total saved words
- Monitor quiz completion and average scores
- Recent favorites quick access
- Visual progress indicators

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, animations
- **JavaScript (ES6+)** - Modules, async/await, Fetch API
- **Vite** - Build tool and development server

### APIs & Services
- **Merriam-Webster Collegiate Dictionary API** - Word definitions, pronunciations, examples
- **Merriam-Webster Collegiate Thesaurus API** - Synonyms and antonyms
- **DeepL API** - Neural machine translation
- **Vercel Serverless Functions** - Backend API proxies

### Development Tools
- **ESLint** - Code quality and consistency
- **Git/GitHub** - Version control
- **Vercel** - Deployment and hosting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- pnpm (or npm/yarn)
- API keys from:
  - [Merriam-Webster Dictionary API](https://dictionaryapi.com/)
  - [DeepL API](https://www.deepl.com/pro-api) (Free tier available)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd language-learning-companion
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure API keys:**
   
   Create `modules/config.mjs` from the example:
   ```bash
   cp modules/config.example.mjs modules/config.mjs
   ```
   
   Edit `modules/config.mjs` and add your API keys:
   ```javascript
   export const MW_DICT_KEY = "your-merriam-webster-dictionary-key";
   export const MW_THES_KEY = "your-merriam-webster-thesaurus-key";
   ```

4. **Set up environment variables for deployment:**
   
   For Vercel deployment, add these environment variables in your Vercel project settings:
   - `MW_DICT_KEY` - Merriam-Webster Dictionary API key
   - `MW_THES_KEY` - Merriam-Webster Thesaurus API key
   - `DEEPL_API_KEY` - DeepL API key

### Development

**Start the development server:**
```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

**Run linting:**
```bash
pnpm lint
```

### Production Build

**Build for production:**
```bash
pnpm build
```

**Preview production build:**
```bash
pnpm preview
```

## 📁 Project Structure

```
language-learning-companion/
├── api/                      # Vercel serverless functions
│   ├── dictionary.js         # Dictionary API proxy
│   ├── thesaurus.js          # Thesaurus API proxy
│   └── translate.js          # DeepL translation proxy
├── images/                   # Static images and icons
├── modules/                  # JavaScript modules
│   ├── views/                # View components
│   │   ├── daily.mjs         # Daily word view
│   │   ├── search.mjs        # Search results view
│   │   ├── translate.mjs     # Translation view
│   │   ├── favorites.mjs     # Favorites view
│   │   ├── quiz.mjs          # Quiz view
│   │   └── progress.mjs      # Progress tracking view
│   ├── confetti.mjs          # Confetti animation utility
│   ├── config.mjs            # API keys configuration
│   ├── deepl.mjs             # DeepL API integration
│   ├── dictionary.mjs        # Dictionary API integration
│   ├── favorites.mjs         # Favorites management
│   ├── quiz.mjs              # Quiz logic and scoring
│   ├── router.mjs            # Client-side routing
│   ├── state.mjs             # Application state management
│   └── thesaurus.mjs         # Thesaurus API integration
├── scripts/                  # Main application scripts
│   ├── main.js               # App initialization
│   └── sidebar.js            # Sidebar navigation logic
├── styles/                   # CSS stylesheets
│   └── main.css              # Global styles
├── index.html                # Main HTML file
├── package.json              # Project dependencies
├── vercel.json               # Vercel deployment config
└── README.md                 # This file
```

## 🎯 How to Use

### Daily Word Learning
1. Visit the **Daily Word** tab to see today's featured vocabulary word
2. Read through definitions, examples, and etymology
3. Click the **▶️** button to hear pronunciation
4. Click **Save to Favorites** to add to your collection

### Search for Words
1. Use the search box in the header
2. Type any English word and press Enter
3. View comprehensive word data in the Search Result view
4. Save interesting words to favorites

### Translation
1. Navigate to the **Translate** tab
2. Select source and target languages
3. Type or paste text to translate
4. View instant translation results
5. Use the swap button to reverse language direction

### Build Your Collection
1. Go to **Favorites** to see all saved words
2. Click **View Details** on any word to see full information
3. Remove words with the **✕** button
4. Track your progress over time

### Test Your Knowledge
1. Visit the **Quiz** tab
2. Answer 5 multiple-choice questions about word definitions
3. Get immediate feedback on each answer
4. View your final score and statistics
5. Try again to improve your score

### Track Progress
1. Check the **Progress** tab for your learning statistics
2. View total words saved
3. See quiz completion rate and average scores
4. Review recent favorites

## 🎨 Design Features

- **Responsive Layout** - Optimized for mobile, tablet, and desktop screens
- **WCAG Compliance** - AA/AAA contrast ratios for accessibility
- **Smooth Animations** - CSS transitions and confetti effects
- **Color Scheme** - Professional blue/gold palette
- **Modern UI** - Clean cards, buttons, and form elements
- **Loading States** - Visual feedback during API calls

## 🔒 Privacy & Data

- All data stored locally in browser localStorage
- No user accounts or personal information collected
- API requests proxied through Vercel serverless functions for key security
- No tracking or analytics implemented

## 🚧 Future Enhancements

Potential features for future development:

- **Language Selector Improvements** - Search/filter in dropdown, remember last selections
- **Quiz Difficulty Levels** - Beginner, intermediate, advanced options
- **User Preferences Panel** - Customize theme, font size, and behavior
- **Spaced Repetition** - Smart review reminders for saved words
- **Export/Import** - Backup and restore favorites
- **Word of the Week** - Additional featured vocabulary
- **Pronunciation Practice** - Speech recognition for practice

## 📝 Credits

### APIs
- [Merriam-Webster Dictionary API](https://dictionaryapi.com/) - Dictionary and thesaurus data
- [DeepL API](https://www.deepl.com/docs-api) - Translation services

### Development
- **Course:** WDD330 - Web Frontend Development II
- **Institution:** Brigham Young University - Idaho
- **Developer:** Francesco Foresta
- **Semester:** Winter 2026

### Assets
- Icons: SVG graphics from Lucide Icons concept
- Fonts: System font stack for optimal performance

## 📄 License

This project is for educational purposes as part of WDD330 coursework.

---

**WDD330 Final Project** | Brigham Young University - Idaho | Winter 2026
