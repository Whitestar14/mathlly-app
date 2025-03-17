export const updates = [
  {
    version: '0.11.5',
    date: 'March 15, 2025',
    features: [
      'Updated dependencies and dev-dependencies and install necessary loaders',
      'Added meta properties to index file for better seo and accessibility',
      'Improved app background and text color to reduce color harshness in dark-mode',
      'Removed redundant code in services and utility files',
      'Completed the encapsulation of calculator logic in the MainCalculator.vue entry',
      'Polished UI animation of toast navigation',
      'Migrated BaseDisplay into a component injected in CalculatorDisplay for encapsulation',
      'Updated database to correspond changes with settings.js file',
      'Fixed the default mode not being respected on app load',
      'Simplified naming convention of properties and functions in sidebar and utilities',
      'Adhered to idiomatic vue3 conventions by ensuring consistency and app encapsulation',
      'Made the app smoother and more performant by leveraging flexbox over transforms',
      'Swapped the percentage function key for the modulo button in Programmer Mode',
    ]
  },
  {
    version: '0.11.4',
    date: 'March 12, 2025',
    features: [
      'Enhanced user accessibility and experience by increasing chevron touch targets',
      'Removed redundant code in views and pages'
    ]
  },
  {
    version: '0.11.3',
    date: 'March 11, 2025',
    features: [
      'Adjust font-weight and optimize for ledgibility',
      'Enhanced styling consistency and following conventional techniques',
      'Enhanced sidebar and appheader title heights on mobile',
      'Added seamless transition animation for toast notifications'
    ]
  },
  {
    version: '0.11.2',
    date: 'March 9, 2025',
    features: [
      'Simplified main app entry structure',
      'Enhanced and simplified baseLoader animation during initial suspense',
      'Removed duplicate initialization logic to prevent race conditions',
      'Renamed useSidebar to usePanel for a more generic implementation'
    ]
  },
  {
    version: '0.11.1',
    date: 'March 9, 2025',
    features: [
      'Cleaned up main.js for better initialization flow',
      'Updated CSS body styling for improved visual consistency',
      'Disabled debug mode in keyboard store for production',
      'Refined AppHeader calculator mode options',
      'Simplified router history management',
      'Enhanced history functionality with improved state handling',
      'Added HistoryItem component for better code reusability'
    ]
  },
  {
    version: '0.11.0',
    date: 'February 27, 2025',
    features: [
      '@milestone: Introduced a Tools Section in the sidebar with a Base64Tools page',
      '@feature: Installed `anime.js` to manage appwide animations',
      '@deprecate: Removed the experimental `borderless` mode in SettingsPage',
      'Switched the native percentage function key to a modulo key in Programmer Mode',
      'Refractored route links to corresponding pages',
      'Made the history panel collapsible on desktop and improved the consolidation of the mobile and desktop management',
      'Improved app speed index, memory efficiency and network performance',
      'Added more keybindings to the ShortcutGuide on desktops',
      'Fixed bug in Standard Mode that provided inaccurate fraction representations',
      'Implemented the usePills composable in app-wide scope for design consistency',
      'Polished components and made edits to specific color schemes',
      'Removed redundant code in Programmer logic',
      'Added missing handleToggle function in Standard Mode',
      'Added a "NotFound" 404 Page for handling invalid routes',
      'Introduced pill management system for better encapsulation and extensibility',
      'Added a theme management system for seamless data routing and user accessibility',
      'Fixed bug that was invoked by base switching with invalid expression by improving sanitation algorithm',
    ]
  },
  {
    version: '0.10.0',
    date: 'February 23, 2025',
    features: [
      'Implemented parentheses tracking and highlighting system',
      'Updated styles for better visual consistency and accessibility',
      'Enhanced sidebar functionality with improved navigation and state management',
      'Optimized performance and reduced bundle size with tree shaking',
    ]
  },
  {
    version: '0.9.0',
    date: 'February 17, 2025',
    features: [
      'Polished standard calculator logic mechanism for handling Overflow errors',
      'Centralized state management of available modes using Pinia',
      'Added more formatting option toggles for bases in Programmer Mode',
    ]
  },
  {
    version: 'v0.8.0-beta',
    date: 'February 16, 2025',
    features: [
      '@deprecate: Subsitute the default calculator mode option from Basic to Standard Mode',
      'Refractored and reorganized codebase for better separation of concerns',
      'Improved speed index on performance and user accessibility',
      'Implemented better and more predictable error handling methods across system modules',
      'Reduced boilerplate and redundant code to avoid performance hangs and bottlenecks',
      'Fixed the formatting bugs that prevented seamless data transactions in Programmer Mode',
      'Fixed the Programmer mode BIN not being able to use the shift operators',
      'Updated the shortcut modal with list of all available keybindings',
      'Fixed the Programmer mode HEX function emitting the corresponding values, C had been clearing the input state in former implementation',
      'Minor UI improvements and considerations made to the look of the app',
    ]
  },
  {
    version: 'v0.7.6',
    date: 'February 6, 2025',
    features: [
      'Enhance calculator functionality with programmer calculations and input validation improvements',
      'Massive crackdown on subtle bugs and expected app misbehavior',
      'Improved app speed index and loading times by maintaining consistent modularization practices and design patterns',
      'Centralized sidebar logic and added persistent preference features',
      'Fixed bug where the `usePill` composable incorrectly highlighted the current page route in the sidebar',
      'Phased out raw button declarations with consistent component-based styles in modals'
    ]
  },
  {
    version: 'v0.7.5',
    date: 'February 3, 2025',
    features: [
      'Bugfixes and performance improvements',
      'Enhanced sidebar functionality and refractor device store',
      'Simplified code logic and performance bottlenecks',
      'Restructured file system for better readability'
    ]
  },
  {
    version: 'v0.7.4',
    date: 'February 3, 2025',
    features: [
      'Improved display formtting rule for Programmer Mode',
      'Added more native keybindings and shortcuts to the app\'s key store',
      'Enhanced calculator functionality and input validation',
      'Refractored UI into reusable components for a slight increase on performace benchmarks',
    ]
  },
  {
    version: 'v0.7.3',
    date: 'February 1, 2025',
    features: [
      'Refactored keyboard handling system for simpler key combination logic',
      'Enhanced input validation with improved base number checks',
      'Streamlined keyboard event management across components',
      'Added focused state handling for better accessibility',
      'Optimized key mapping configuration structure',
      'Improved error prevention for invalid number inputs',
      'Enhanced calculator mode transitions with keyboard shortcuts'
    ]
  },
  {
    version: 'v0.7.2',
    date: 'January 31, 2025',
    features: [
      'Enhanced component architecture with updated props defaults',
      'Expanded keyboard shortcuts system for improved navigation',
      'Improved modal accessibility with ARIA attributes and focus management',
      'Refined component interfaces for better type safety',
      'Optimized keyboard event handling across calculator modes',
      'Enhanced modal system with improved state management',
      'Standardized component default values for consistency'
    ]
  },
  {
    version: 'v0.7.0',
    date: 'January 20, 2025',
    features: [
      'Reorganized codebase for easier extensibility',
      'Leveraged Tailwind @component classes for general consistency',
      'Improved UI and general user experience on mobile',
      'Performance improvements and stability with calculator state management',
      'Enhanced accessibility with ARIA roles and labels',
      'Fixed edge cases and improved error handling',
      'Added new settings for customizing calculator behavior',
      'Implemented new keyboard shortcuts for quicker navigation',
      'Updated history panel with additional functionality',
      'Enhanced calculator logic for better precision and accuracy',
      'Added DisplayFormatter class for consistent display formatting',
      'Optimized the codebase for better performance and maintainability'
    ]
  },
  {
    version: 'v0.6.1',
    date: 'January 15, 2025',
    features: [
      'Enhanced loading states with smooth transitions and minimum display time',
      'Refined skeleton loader animations for improved user experience',
      'Adjusted z-index hierarchy for consistent header visibility',
      'Standardized button dimensions across calculator modes',
      'Implemented fade transitions for seamless page navigation',
      'Optimized component loading strategy with static imports',
      'Updated button styles for better visual consistency',
      'Improved UI responsiveness during state transitions'
    ]
  },
  {
    version: 'v0.6.0',
    date: 'January 12, 2025',
    features: [
      'Introduced BaseButton component for consistent button styling and behavior',
      'Enhanced button accessibility with improved focus states and ARIA labels',
      'Streamlined component imports across the application',
      'Refined header styles and layout for better visual hierarchy',
      'Improved toast notification system with configurable duration',
      'Enhanced history management with robust state handling',
      'Updated settings interface with new customization options',
      'Optimized component performance through code cleanup'
    ]
  },
  {
    version: '0.5.2',
    date: 'January 9, 2025',
    features: [
      'Updated icon library (lucide-vue-next) and devDependencies(eslint, babel, eslint-plugin-vue)'
    ],
  },
  {
    version: '0.5.1',
    date: 'January 9, 2025',
    features: [
      'Patch fix to breaking issues in v0.5.0',
      'Removed redundant code to simplify workflow and project cohesion',
      'Fixed UI styling collision issues in the pages',
      'Added a BaseModal component for reusability and operable scalability',
      'Made advancements in the adoption of async operations to achieve faster page loads',
      'Enhanced the UI and refined calculator\'s working logic',
      'Improved accessibility in calculator header and display',
    ]
  },
  {
    version: 'v0.5.0',
    date: 'January 8, 2025',
    features: [
      'Restructured project architecture by moving components and utils to layouts folder',
      'Updated import paths across the application for better organization',
      'Implemented toast notification system for improved user feedback',
      'Enhanced project maintainability with cleaner folder structure',
      'Streamlined component organization for better scalability'
    ]
  },
  {
    version: 'v0.4.0',
    date: 'January 5, 2025',
    features: [
      'Refined and polished several pages, components with aesthetics for a better user experience',
      'Added context menus to the History Panel\'s items visible on right click',
      'Removed redundant and repititive code across the codebase',
      'Implemented a cleaner font "Inter" to ensure a visually consistent look and brand',
      'Resolved exponents being unacknowledged and evaluated with stringent restrictions',
      'Solidifed the store by ensuring a consolidated, centralised space for space management',
      'Introduced primitive memory and some special functions to Standard Calculator mode for quick access and ease of use',
      'Improved accessibility for a better user experience and SEO',
      'Fixed unexpected interface behavior in Basic mode'
    ]
  },
  {
    version: 'v0.3.0-beta',
    date: 'January 3, 2025',
    features: [
      'Fixed longtime issue with unexpected History Panel behavior on mobile',
      'Implemented dynamic version display and enhanced routing with What\'s New page',
      'Performance improvements from light code refractoring',
      'Switched to the pnpm package manager for performant and effective symlinking on low-end devices'
    ]
  },
  {
    version: 'v0.3.0',
    date: 'January 1, 2025',
    features: [
      'Introduced Programmer Calculator with HEX, DEC, OCT, and BIN calculations',
      'Added real-time base conversion display with specialized input validation',
      'Implemented History Panel with local storage and sync capabilities',
      'Enhanced UI with smooth dark mode transitions and mobile responsiveness',
      'Added keyboard shortcuts and welcome modal for improved user experience',
      'Integrated tooltips system (automatically disabled on mobile)',
      'Implemented Vue 3 composition API with improved performance',
      'Added Webpack bundle analyzer for optimization'
    ]
  },
  {
    version: 'v0.2.1',
    date: 'December 26, 2024',
    features: [
      'Added history synchronization across calculator modes',
      'Improved scientific notation support in all modes',
      'Enhanced calculation performance for complex operations',
      'Fixed decimal precision handling and edge cases',
      'Implemented DexieJS for robust local storage'
    ]
  },
  {
    version: 'v0.2.0',
    date: 'November 14, 2024',
    features: [
      'Introduced Standard Calculator mode with advanced operations',
      'Added fraction display support with toggle option',
      'Implemented thousands separator configuration',
      'Enhanced error handling and user feedback',
      'Added basic settings panel for calculator customization'
    ]
  },
  {
    version: 'v0.1.0',
    date: 'October 27, 2024',
    features: [
      'Initial release with Basic Calculator functionality',
      'Core arithmetic operations with precise evaluation',
      'Clean and intuitive user interface',
      'Dark/Light theme support',
      'Basic expression evaluation engine'
    ]
  }
]

export const upcomingFeatures = [
  'IDE integration for seamless development workflow',
  'Advanced graphing capabilities with interactive plots',
  'Custom function definitions and storage',
  'Mobile apps for iOS and Android platforms',
  'Cloud sync for settings and history',
  'Lazy loading resources and assets for improved performance',
  'MathJax integration to display fractions in LaTeX format on the web page'
];
