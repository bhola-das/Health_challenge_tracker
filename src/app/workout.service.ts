import { Injectable } from '@angular/core';

export interface WorkoutEntry {
  id: string;
  userName: string;
  workoutType: string;
  workoutMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private workoutEntries: WorkoutEntry[] = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const storedData = localStorage.getItem('workoutEntries');
    if (storedData) {
      this.workoutEntries = JSON.parse(storedData);
    } else {
      this.initializeSampleData();
    }
  }

  private initializeSampleData(): void {
    this.workoutEntries = [
      { id: this.generateId(), userName: 'Bhola das', workoutType: 'Running', workoutMinutes: 30 },
      { id: this.generateId(), userName: 'Bhola das', workoutType: 'Cycling', workoutMinutes: 45 },
      { id: this.generateId(), userName: 'Saurabh kumar', workoutType: 'Swimming', workoutMinutes: 60 },
      { id: this.generateId(), userName: 'Saurabh kumar', workoutType: 'Running', workoutMinutes: 20 },
      { id: this.generateId(), userName: 'Tarun meena', workoutType: 'Yoga', workoutMinutes: 50 },
      { id: this.generateId(), userName: 'Tarun meena', workoutType: 'Cycling', workoutMinutes: 40 }
    ];
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('workoutEntries', JSON.stringify(this.workoutEntries));
  }

  getWorkoutEntries(): WorkoutEntry[] {
    return this.workoutEntries;
  }

  addWorkoutEntry(entry: Omit<WorkoutEntry, 'id'>): void {
    const newEntry = { ...entry, id: this.generateId() };
    this.workoutEntries.push(newEntry);
    this.saveToLocalStorage();
  }

  deleteWorkoutEntry(id: string): void {
    this.workoutEntries = this.workoutEntries.filter(entry => entry.id !== id);
    this.saveToLocalStorage();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}