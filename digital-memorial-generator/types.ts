
export interface TimelineEvent {
  id: number;
  year: string;
  title: string;
  description: string;
}

export interface Condolence {
  id: number;
  name: string;
  relation: string;
  text: string;
  attachmentUrl?: string | null;
  timestamp: string;
}

export interface Memorial {
  name: string;
  dates: string;
  epitaph: string;
  tags: string[];
  photoUrl: string | null;
  timeline: TimelineEvent[];
  condolences: Condolence[];
}
