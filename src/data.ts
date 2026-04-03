import { Student, Incident } from './types';

export const STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Sofia',
    grade: 'Grade 11',
    section: 'Section A',
    status: 'at-risk',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
    academicStanding: 72,
    attendance: 94,
    behaviorScore: 8.5,
    classRank: '24/32',
    lastAssessmentDate: 'Oct 12',
    teacher: {
      name: 'Dr. Aris Thorne',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
      feedback: "Sofia has been missing key conceptual foundations in calculus. Her participation drops significantly after 2 PM."
    }
  },
  {
    id: '2',
    name: 'Leo',
    grade: 'Grade 1',
    section: 'Early Years Foundation',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
    academicStanding: 88,
    attendance: 98,
    behaviorScore: 9.4,
    classRank: '5/28',
    lastAssessmentDate: 'Oct 15',
    teacher: {
      name: 'Ms. Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
      feedback: "Leo is showing exceptional curiosity in nature studies. He's a natural leader during group activities."
    }
  },
  {
    id: '3',
    name: 'Julian Thorne',
    grade: 'Grade 9',
    section: 'Section B',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200',
    academicStanding: 85,
    attendance: 92,
    behaviorScore: 8.5,
    classRank: '12/30',
    lastAssessmentDate: 'Oct 10',
    teacher: {
      name: 'Mr. Robert Vance',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
      feedback: "Julian is highly analytical but sometimes struggles with group dynamics. His written work is outstanding."
    }
  }
];

export const INCIDENTS: Incident[] = [
  {
    id: '1',
    date: 'OCT 24, 2024',
    title: 'Class Disruption',
    description: 'Excessive talking during independent study period in Mathematics.',
    severity: 'minor'
  },
  {
    id: '2',
    date: 'SEP 12, 2024',
    title: 'Late Arrival',
    description: 'First period tardiness (8 minutes). Noted as transportation delay.',
    severity: 'resolved'
  }
];
