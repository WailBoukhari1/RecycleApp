import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="mt-12 bg-gray-900">
      <div class="container mx-auto px-4 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="bg-blue-600 p-2 rounded-lg">
                <mat-icon class="h-5 w-5 text-white">recycling</mat-icon>
              </div>
              <span class="text-xl font-semibold text-white">RecycleHub</span>
            </div>
            <p class="text-gray-400 text-sm">
              Making recycling accessible and efficient for everyone.
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <h3 class="text-white font-medium mb-4">Company</h3>
              <div class="space-y-3">
                <a href="#" class="block text-sm text-gray-400 hover:text-white transition-colors">About</a>
                <a href="#" class="block text-sm text-gray-400 hover:text-white transition-colors">Careers</a>
                <a href="#" class="block text-sm text-gray-400 hover:text-white transition-colors">Press</a>
              </div>
            </div>
            <div>
              <h3 class="text-white font-medium mb-4">Legal</h3>
              <div class="space-y-3">
                <a href="#" class="block text-sm text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" class="block text-sm text-gray-400 hover:text-white transition-colors">Terms</a>
                <a href="#" class="block text-sm text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-12 pt-8 border-t border-gray-800">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <span class="text-sm text-gray-400">© 2025 RecycleHub. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {} 