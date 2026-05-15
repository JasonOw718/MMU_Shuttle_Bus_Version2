export interface Announcement {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    isPinned: boolean;
    fileName?: string;
    busPlate: string;
}