import React from 'react';

/**
 * Escapes special regex characters in a string
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Highlights ingredients and measurements in instruction text
 * @param {string} text - The instruction text
 * @param {Array} ingredients - Array of ingredient objects or strings
 * @returns {JSX.Element} - Text with <strong> tags around matches
 */
export const highlightInstructions = (text, ingredients = []) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Extract ingredient names from various formats
  const ingredientNames = ingredients
    .map(ing => {
      if (typeof ing === 'string') return ing;
      return ing?.name || ing?.ingredient || null;
    })
    .filter(Boolean)
    .map(name => name.toLowerCase().trim())
    // Also add singular/plural variations
    .flatMap(name => {
      const variations = [name];
      // Add singular if plural
      if (name.endsWith('es')) {
        variations.push(name.slice(0, -2));
      } else if (name.endsWith('s') && !name.endsWith('ss')) {
        variations.push(name.slice(0, -1));
      }
      // Add plural if singular
      if (!name.endsWith('s')) {
        variations.push(name + 's');
      }
      return variations;
    })
    // Remove duplicates and sort by length (longer first to match "olive oil" before "oil")
    .filter((name, index, arr) => arr.indexOf(name) === index)
    .sort((a, b) => b.length - a.length);

  // Build combined pattern for all highlights
  const patterns = [];

  // Measurement patterns
  const measurementPatterns = [
    // Numbers with units: "2 cups", "350°F", "1/2 teaspoon", "1 1/2 cups"
    '\\d+(?:\\s*\\/\\s*\\d+)?(?:\\s+\\d+\\/\\d+)?\\s*(?:cups?|tbsps?|tablespoons?|tsps?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|quarts?|pints?|gallons?|inches?|inch|cm|centimeters?)',
    // Temperature: "350°F", "180°C", "350 degrees"
    '\\d+\\s*(?:°|degrees?\\s*)[FC]?',
    // Descriptive amounts
    'a\\s+(?:pinch|drizzle|squeeze|dash|splash|handful|sprinkle|bit|touch|hint)\\s+of',
    'some',
    // Time expressions with ranges: "3-4 minutes", "10 to 15 minutes"
    '\\d+(?:\\s*[-–—]\\s*\\d+|\\s+to\\s+\\d+)?\\s*(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)',
  ];

  patterns.push(...measurementPatterns);

  // Add ingredient patterns (escaped for regex safety)
  if (ingredientNames.length > 0) {
    // Group ingredients into a single alternation pattern for efficiency
    const ingredientPattern = ingredientNames
      .map(name => escapeRegex(name))
      .join('|');
    patterns.push(ingredientPattern);
  }

  // Combine all patterns with word boundaries
  const combinedPattern = new RegExp(
    `\\b(${patterns.join('|')})\\b`,
    'gi'
  );

  // Split text by matches and rebuild with highlighting
  const parts = [];
  let lastIndex = 0;
  let match;

  // Reset regex lastIndex
  combinedPattern.lastIndex = 0;

  while ((match = combinedPattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        highlight: false
      });
    }

    // Add matched text
    parts.push({
      text: match[0],
      highlight: true
    });

    lastIndex = match.index + match[0].length;

    // Prevent infinite loop on zero-length matches
    if (match[0].length === 0) {
      combinedPattern.lastIndex++;
    }
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      highlight: false
    });
  }

  // If no matches found, return original text
  if (parts.length === 0) {
    return text;
  }

  // Return JSX with highlighted parts
  return (
    <>
      {parts.map((part, index) =>
        part.highlight ? (
          <strong key={index}>{part.text}</strong>
        ) : (
          <React.Fragment key={index}>{part.text}</React.Fragment>
        )
      )}
    </>
  );
};

export default highlightInstructions;
