export type Mood = {
    id: string;
    title: string;
    description: string;
    gradient: [string, string];
    accent: string;
    iconName: string;
};

export type Session = {
    id: string;
    title: string;
    duration: string;
    moodId: string;
    category: string;
};
