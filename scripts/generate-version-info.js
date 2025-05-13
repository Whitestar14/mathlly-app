const fs = require('fs');
const path = require('path');

// Import your changelog data
const changelogPath = path.resolve(__dirname, '../src/data/changelog.js');
const changelogContent = fs.readFileSync(changelogPath, 'utf8');

// Extract the latest version info using regex
const versionMatch = changelogContent.match(/version: ['"]([^'"]+)['"]/);
const featuresMatch = changelogContent.match(/features: \[([\s\S]*?)\]/);

if (versionMatch && featuresMatch) {
  const version = versionMatch[1];
  
  // Parse features array
  const featuresString = featuresMatch[1];
  const features = featuresString
    .split(',')
    .map(f => f.trim())
    .filter(f => f.startsWith("'") || f.startsWith('"'))
    .map(f => f.replace(/^['"]|['"]$/g, ''));
  
  // Create version info object
  const versionInfo = {
    version,
    features: features.slice(0, 5) // Limit to first 5 features for brevity
  };
  
  // Write to public directory
  fs.writeFileSync(
    path.resolve(__dirname, '../public/version-info.json'),
    JSON.stringify(versionInfo, null, 2)
  );
  
  console.log(`Generated version-info.json with version ${version}`);
} else {
  console.error('Failed to extract version info from changelog');
  process.exit(1);
}
