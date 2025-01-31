import { Component, OnInit, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface WorkoutEntry {
  userName: string;
  workoutType: string;
  workoutMinutes: number;
}

@Component({
  selector: 'app-root',
  template: `
    <div class="max-w-4xl mx-auto p-4 font-sans ">
      <h1 class="text-2xl font-bold text-center mb-6 text-orange-300 ">Health Challenge Tracker App</h1>
      <form #workoutForm="ngForm" (ngSubmit)="onSubmit(workoutForm)" class="bg-white p-6 rounded-lg shadow-md">
        <div class="mb-4">
          <label for="userName" class="block pl-4 font-bold text-gray-700 ">User Name*</label>
          <input type="text" id="userName" name="userName" [(ngModel)]="userName" required class="w-full p-2 outline-none rounded-full bg-gray-200 shadow-innerNeu">
        </div>
        <div class="grid grid-cols-2 gap-2 md:gap-4">
          <div>
            <label for="workoutType" class="block text-sm md:text-md font-bold pl-4 text-gray-700">Workout Type*</label>
            <select id="workoutType" name="workoutType" [(ngModel)]="workoutType" required class="w-full p-2 outline-none rounded-full bg-gray-200 shadow-innerNeu">
              <option value="">Select Workout</option>
              <option *ngFor="let type of availableWorkoutTypes" [value]="type">{{type}}</option>
            </select>
          </div>
          <div>
            <label for="workoutMinutes" class="block text-sm md:text-md font-bold pl-4 text-gray-700">Workout Minutes*</label>
            <input type="number" id="workoutMinutes" name="workoutMinutes" [(ngModel)]="workoutMinutes" required class="w-full p-2 outline-none rounded-full bg-gray-200 shadow-innerNeu">
          </div>
        </div>
        <button type="submit" [disabled]="!workoutForm.form.valid" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">Add Workout</button>
      </form>
      
      <div class="mt-8">
        <h2 class="text-xl font-bold mb-4">Workout Entries</h2>
        <div class="flex gap-4 mb-4">
          <input type="text" placeholder="Search by name" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" class="w-full p-2 outline-none rounded bg-gray-200 shadow-innerNeu">
          <select [(ngModel)]="filterType" (ngModelChange)="applyFilters()" class="p-4 outline-none rounded bg-gray-200 shadow-innerNeu">
            <option value="">All Workout Types</option>
            <option *ngFor="let type of availableWorkoutTypes" [value]="type">{{type}}</option>
          </select>
        </div>
        <table class=" w-50% border-collapse border p-4   border-gray-700 ">
          <thead>
            <tr class="bg-gray-100 text-md md:text-xl">
              <th class="border border-gray-700 p-2">Name</th>
              <th class="border border-gray-700 p-2">Workouts</th>
              <th class="border border-gray-700 p-2">Number of Workouts</th>
              <th class="border border-gray-700 p-2">Total Workout Minutes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let entry of paginatedEntries" class="hover:bg-gray-50">
              <td class="border border-gray-700 p-2">{{entry.userName}}</td>
              <td class="border border-gray-700 p-2">{{entry.workoutType}}</td>
              <td class="border border-gray-700 p-2">{{getNumberOfWorkouts(entry.userName)}}</td>
              <td class="border border-gray-700 p-2">{{getTotalWorkoutMinutes(entry.userName)}}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="flex justify-between items-center mt-4">
          <button (click)="changePage(-1)" [disabled]="currentPage === 1" class="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">&lt;</button>
          <span>Page {{currentPage}} of {{totalPages}}</span>
          <button (click)="changePage(1)" [disabled]="currentPage === totalPages" class="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">&gt;</button>
          <select [(ngModel)]="itemsPerPage" (ngModelChange)="applyFilters()" class="p-2 outline-none rounded bg-gray-200 shadow-innerNeu">
            <option [value]="5">5 per page</option>
            <option [value]="10">10 per page</option>
            <option [value]="20">20 per page</option>
          </select>
        </div>
      </div>
      
      <div class="mt-8 flex md:flex-row flex-col md:justify-between gap-5">
        <div class="">
          <h2 class="text-xl font-bold mb-2">Users</h2>
          <ul>
            <li *ngFor="let user of getUniqueUsers()" (click)="selectUser(user)" [class.bg-gray-300]="user === selectedUser" class="p-2 cursor-pointer border-b border-gray-300 hover:bg-gray-200">{{user}}</li>
          </ul>
        </div>
        <div class=" pl-6" *ngIf="selectedUser">
          <h2 class="text-xl font-bold mb-4">{{selectedUser}}'s Workout Progress</h2>
          <canvas id="chartCanvas"></canvas>
        </div>
      </div>
    </div>
  `
})

export class AppComponent implements OnInit {
  userName: string = '';
  workoutType: string = '';
  workoutMinutes: number = 0;
  workoutEntries: WorkoutEntry[] = [];
  filteredEntries: WorkoutEntry[] = [];
  paginatedEntries: WorkoutEntry[] = [];
  selectedUser: string | null = null;
  chart: Chart | null = null;

  searchTerm: string = '';
  filterType: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  availableWorkoutTypes: string[] = [
    'Running', 'Walking', 'Cycling', 'Swimming', 'Weightlifting',
    'Yoga', 'Pilates', 'HIIT', 'Dance', 'Martial Arts'
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.loadFromLocalStorage();
    this.applyFilters();
  }

  loadFromLocalStorage() {
    const storedData = localStorage.getItem('workoutEntries');
    if (storedData) {
      this.workoutEntries = JSON.parse(storedData);
    } else {
      // Initialize with sample data if localStorage is empty
      this.workoutEntries = [
        { userName: 'Bhola das', workoutType: 'Running', workoutMinutes: 30 },
        { userName: 'Bhola das', workoutType: 'Cycling', workoutMinutes: 45 },
        { userName: 'Saurabh kumar', workoutType: 'Swimming', workoutMinutes: 60 },
        { userName: 'Saurabh kumar', workoutType: 'Running', workoutMinutes: 20 },
        { userName: 'Tarun Meena', workoutType: 'Yoga', workoutMinutes: 50 },
        { userName: 'Tarun Meena', workoutType: 'Cycling', workoutMinutes: 40 }
      ];
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('workoutEntries', JSON.stringify(this.workoutEntries));
  }

  onSubmit(form: NgForm | any) {
    if (form.valid) {
      this.workoutEntries.push({
        userName: this.userName,
        workoutType: this.workoutType,
        workoutMinutes: this.workoutMinutes
      });
      this.saveToLocalStorage();
      this.applyFilters();
      this.selectUser(this.userName);
      this.resetForm(form);
    }
  }

  resetForm(form: NgForm | any) {
    if (form.resetForm && typeof form.resetForm === 'function') {
      form.resetForm();
    }
    // Reset component properties
    this.userName = '';
    this.workoutType = '';
    this.workoutMinutes = 0;
  }

  getUniqueUsers(): string[] {
    return Array.from(new Set(this.workoutEntries.map(entry => entry.userName)));
  }

  selectUser(user: string) {
    this.selectedUser = user;
    this.updateChart();
  }

  updateChart() {
    if (this.selectedUser) {
      const canvas = this.elementRef.nativeElement.querySelector('#chartCanvas');
      if (!canvas) return;

      const userEntries = this.workoutEntries.filter(entry => entry.userName === this.selectedUser);
      const workoutData: { [key: string]: number } = {};

      userEntries.forEach(entry => {
        if (workoutData[entry.workoutType]) {
          workoutData[entry.workoutType] += entry.workoutMinutes;
        } else {
          workoutData[entry.workoutType] = entry.workoutMinutes;
        }
      });

      const labels = Object.keys(workoutData);
      const data = Object.values(workoutData);

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Workout Minutes',
            data: data,
            backgroundColor: 'rgba(34, 197, 94, 0.5)', 
            borderColor: 'rgba(34, 197, 94, 1)', 
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  applyFilters() {
    this.filteredEntries = this.workoutEntries.filter(entry => {
      const nameMatch = entry.userName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const typeMatch = this.filterType ? entry.workoutType === this.filterType : true;
      return nameMatch && typeMatch;
    });
    this.totalPages = Math.ceil(this.filteredEntries.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginatedEntries();
  }

  updatePaginatedEntries() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedEntries = this.filteredEntries.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(delta: number) {
    this.currentPage += delta;
    this.updatePaginatedEntries();
  }

  getNumberOfWorkouts(userName: string): number {
    return this.workoutEntries.filter(entry => entry.userName === userName).length;
  }

  getTotalWorkoutMinutes(userName: string): number {
    return this.workoutEntries
      .filter(entry => entry.userName === userName)
      .reduce((total, entry) => total + entry.workoutMinutes, 0);
  }
}