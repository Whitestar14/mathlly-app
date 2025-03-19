const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const formatDisplayContent = (content) => {
    const safeContent = escapeHtml(content);
    return safeContent
        // Basic operators
        .replace(/&times;/g, "×")
        .replace(/&divide;/g, "÷")
        .replace(/&minus;/g, "−")
        .replace(/&plusmn;/g, "±")
        .replace(/&sum;/g, "∑")
        .replace(/&prod;/g, "∏")
        // Comparison
        .replace(/&lt;=/g, "≤")
        .replace(/&gt;=/g, "≥")
        .replace(/&ne;/g, "≠")
        .replace(/&equiv;/g, "≡")
        // Greek letters (commonly used in math)
        .replace(/&alpha;/g, "α")
        .replace(/&beta;/g, "β")
        .replace(/&delta;/g, "δ")
        .replace(/&Delta;/g, "Δ")
        .replace(/&pi;/g, "π")
        .replace(/&sigma;/g, "σ")
        // Set notation
        .replace(/&isin;/g, "∈")
        .replace(/&notin;/g, "∉")
        .replace(/&cup;/g, "∪")
        .replace(/&cap;/g, "∩")
        // Other math symbols
        .replace(/&radic;/g, "√")
        .replace(/&infin;/g, "∞")
        .replace(/&int;/g, "∫")
        .replace(/&part;/g, "∂");
};
