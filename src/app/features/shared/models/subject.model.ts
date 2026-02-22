export interface SubjectDto {
  subjectId: number;
  subjectName: string;
  subjectCode?: string;
  facultyId: number;
  facultyName: string;
  createdAt: Date;
}

export interface CreateSubjectDto {
  subjectName: string;
  subjectCode?: string;
  facultyId: number;
}

export interface UpdateSubjectDto {
  subjectName?: string;
  subjectCode?: string;
  facultyId?: number;
}
