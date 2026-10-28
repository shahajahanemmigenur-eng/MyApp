import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num as number)) {
        return '0';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return Math.floor(num).toString();
};

export const shortenTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const lower = timestamp.toLowerCase();
    
    if (lower.includes('just now')) return 'now';
    if (lower.includes('yesterday')) return '1d';
    
    const match = lower.match(/(\d+)\s*(\w+)/);
    if (match) {
        const num = match[1];
        const unit = match[2];
        
        if (unit.startsWith('m')) {
            if (unit.startsWith('mo')) return `${num}mo`;
            return `${num}m`;
        }
        if (unit.startsWith('h')) return `${num}h`;
        if (unit.startsWith('d')) return `${num}d`;
        if (unit.startsWith('w')) return `${num}w`;
        if (unit.startsWith('y')) return `${num}y`;
    }
    
    // Final fallback: extract number if available, else return original
    const numMatch = lower.match(/\d+/);
    if (numMatch) return numMatch[0];
    
    return timestamp;
};

export const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
