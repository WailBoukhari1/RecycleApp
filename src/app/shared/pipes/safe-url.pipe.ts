import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: File | string): SafeUrl {
    if (value instanceof File) {
      return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(value));
    }
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }
} 