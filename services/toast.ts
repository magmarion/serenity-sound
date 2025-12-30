let showToastRef: ((message: string) => void) | null = null;

export function registerToast(fn: (message: string) => void) {
    showToastRef = fn;
}

export function toast(message: string) {
    if (!showToastRef) {
        console.warn("Toast not ready yet:", message);
        return;
    }
    showToastRef(message);
}

