export function getReadableTextColor(bgColor: string) {
    const hex = bgColor.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Relative luminance
    const luminance =
        (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    // WCAG recommended threshold
    return luminance > 0.55 ? '#0B0B0B' : '#FFFFFF';
}
