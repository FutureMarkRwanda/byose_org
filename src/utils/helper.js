export const getTextColor = (hex) => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate luminance
    const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);

    // If the color is dark, return a lighter contrasting color
    if (luminance < 0.5) {
        return `rgb(${r + 100 > 255 ? 255 : r + 130}, ${g + 100 > 255 ? 255 : g + 130}, ${b + 100 > 255 ? 255 : b + 130})`;
    }
    // If the color is light, return a darker contrasting color
    else {
        return `rgb(${r - 100 < 0 ? 0 : r - 120}, ${g - 100 < 0 ? 0 : g - 120}, ${b - 100 < 0 ? 0 : b - 120})`;
    }
};