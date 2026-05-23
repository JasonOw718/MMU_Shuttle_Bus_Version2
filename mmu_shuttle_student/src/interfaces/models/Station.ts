import type { Location } from "./Location";

export interface Station {
    id: number;  
    name: string;
    sequence: number;
    schedule: string[];
    location: Location;
}