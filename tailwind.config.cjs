/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: "#0B0F2E",
                surface: "#1A1F3E",
                card: "#2A2F4E",
                muted: "#8B93B8",
                accent: {
                    focus: "#F78A2C",
                    calm: "#8F7CFF",
                    sleep: "#6DA7FF",
                    recharge: "#4DE2C3",
                }
            }
        },
    },
    plugins: [],
};
