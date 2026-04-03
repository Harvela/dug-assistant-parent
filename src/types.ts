export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  status: 'active' | 'at-risk' | 'inactive';
  avatar: string;
  academicStanding: number;
  attendance: number;
  behaviorScore: number;
  classRank: string;
  lastAssessmentDate: string;
  teacher: {
    name: string;
    avatar: string;
    feedback: string;
  };
}

export interface Incident {
  id: string;
  date: string;
  title: string;
  description: string;
  severity: 'minor' | 'major' | 'resolved';
}
