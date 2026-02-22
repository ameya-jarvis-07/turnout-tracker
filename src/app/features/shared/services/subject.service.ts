import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SubjectDto, CreateSubjectDto, UpdateSubjectDto } from '../models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private readonly API_URL = `${environment.apiUrl}/Subject`;
  
  // Signals for reactive state
  subjects = signal<SubjectDto[]>([]);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getAllSubjects(): Observable<SubjectDto[]> {
    this.loading.set(true);
    return this.http.get<SubjectDto[]>(this.API_URL).pipe(
      tap({
        next: (subjects) => {
          this.subjects.set(subjects);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  getSubjectById(id: number): Observable<SubjectDto> {
    return this.http.get<SubjectDto>(`${this.API_URL}/${id}`);
  }

  getSubjectsByFaculty(facultyId: number): Observable<SubjectDto[]> {
    return this.http.get<SubjectDto[]>(`${this.API_URL}/faculty/${facultyId}`);
  }

  createSubject(subject: CreateSubjectDto): Observable<SubjectDto> {
    return this.http.post<SubjectDto>(this.API_URL, subject).pipe(
      tap(newSubject => {
        const current = this.subjects();
        this.subjects.set([...current, newSubject]);
      })
    );
  }

  updateSubject(id: number, subject: UpdateSubjectDto): Observable<SubjectDto> {
    return this.http.put<SubjectDto>(`${this.API_URL}/${id}`, subject).pipe(
      tap(updatedSubject => {
        const current = this.subjects();
        const updated = current.map(s => s.subjectId === id ? updatedSubject : s);
        this.subjects.set(updated);
      })
    );
  }

  deleteSubject(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        const current = this.subjects();
        const updated = current.filter(s => s.subjectId !== id);
        this.subjects.set(updated);
      })
    );
  }

  refreshSubjects(): void {
    this.getAllSubjects().subscribe();
  }
}
