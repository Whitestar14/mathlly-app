export const updates = [
  {
    version: '0.5.2',
    date: 'January 9, 2025',
    features: [
      'Updated icon library (lucide-vue-next) and devDependencies(eslint, babel, eslint-plugin-vue)'
    ],
  }
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
  ];
  
  export const upcomingFeatures = [
    'IDE integration for seamless development workflow',
    'Advanced graphing capabilities with interactive plots',
    'Custom function definitions and storage',
    'Mobile apps for iOS and Android platforms',
    'Cloud sync for settings and history',
    'Lazy loading resources and assets for improved performance',
    'MathJax integration to display fractions in LaTeX format on the web page'
  ];
  