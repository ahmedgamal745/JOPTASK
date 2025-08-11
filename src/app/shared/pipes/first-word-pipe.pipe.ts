import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstWord',
  standalone: true
})
export class FirstWordPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const firstPart = value.split(/-|,/)[0].trim();
    return firstPart;
  }
}