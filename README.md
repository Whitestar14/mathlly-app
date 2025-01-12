# Mathlly - Whitestar Studios

A powerful, developer-focused calculator built with Vue.js that supports multiple calculation modes and advanced features.

## Features

- **Multiple Calculator Modes**
  - Basic Calculator
  - Programmer Calculator (HEX, DEC, OCT, BIN)
  - Standard Calculator with advanced operations

- **Developer-Centric Features**
  - Real-time base conversion display
  - Programmer mode with bitwise operations
  - Keyboard shortcuts support
  - Scientific notation support

- **User Experience**
  - Dark/Light theme
  - History panel with local storage
  - Customizable settings
  - Real-time calculation preview
  - Mobile-responsive design
  - Tooltips system (auto-disabled on mobile)

- **Technical Highlights**
  - Built with Vue 3 + Composition API
  - State management with Pinia
  - Local storage using DexieJS
  - Efficient bundle size with Webpack analyzer

## Installation

```bash
# Install dependencies
pnpm install

# Serve with hot reload at localhost:8080
pnpm run dev

# Build for production
pnpm run build

# Lint and fix files
pnpm run lint
```
## Project Structure
```
src/
├── assets/         # Static assets (fonts, images, global CSS)
├── components/     # Vue components
├── composables/    # Composable functions
├── layouts/        # Page layouts
├── router/         # Vue Router configuration
├── stores/         # Pinia stores
├── utils/          # Utility functions and classes
└── data/          # Static data and configurations
```

## Key Dependencies
- Vue3 - Core framework
- Radix UI - Headless styling library
- Pinia - State management
- vue-router - Routing
- DexieJS - IndexedDB wrapper
- Decimal.js - Precise decimal calculations
- Mathjs - Mathematical operations

## Browser Support
Chrome, Firefox, Safari, Edge

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License.

## Acknowledgments
- Icons by Lucide
- Fonts: Inter, Geist Mono