export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseFormat = "online" | "offline" | "hybrid";
export type CourseSpecialty = "surgery" | "therapy" | "nursing" | "cardiology" | "pediatrics" | "psychiatry";

export interface Instructor {
  id: string;
  name: string;
  title: string;
  experience: string;
  image: string;
  bio?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  image: string;
  level: CourseLevel;
  format: CourseFormat;
  specialty: CourseSpecialty;
  duration: string;
  students: number;
  rating: number;
  reviews: number;
  instructors: Instructor[];
  syllabus: SyllabusModule[];
  whatYouWillLearn: string[];
  forWhom: string[];
  certificate?: boolean;
  featured?: boolean;
}

export interface SyllabusModule {
  id: string;
  title: string;
  lessons: string[];
  duration: string;
}

export interface Review {
  id: string;
  name: string;
  title: string;
  text: string;
  rating: number;
  image?: string;
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
