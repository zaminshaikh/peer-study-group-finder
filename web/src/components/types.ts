export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  class: string;
  size: number;
  modality: 'In-Person' | 'Online' | 'Hybrid';
  location?: string;
  meetingTime?: string;
  createdAt: Date;
  owner?: number | null;
  link?: string | undefined;
  groupId?: number | null;
  students?: number[] | null;
}