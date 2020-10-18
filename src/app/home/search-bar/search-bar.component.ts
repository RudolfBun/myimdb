import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete,
} from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SearchResult } from 'src/app/models/search-result';
import { MovieService } from 'src/app/services/movie.service';
import { Category } from 'src/app/models/movie';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  private readonly PLACEHORDER_BEFORE = 'options | title';
  private readonly YEAR = 'year | title';
  private readonly CATEGORY = 'category | title';
  private readonly TITLE = 'title';
  private readonly YEAR_REGEX = '^[12][0-9][0-9][0-9]$';

  private year: boolean;
  private yearRegExp: RegExp;

  public selectable = true;
  public removable = true;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public movieFormControl = new FormControl();
  public filteredOptions: Observable<string[]>;
  public inputPlaceholder: string;
  public options: string[] = [];
  public allOptions: string[] = [];
  private allCategory: Category[];

  oprionsSubscription: Subscription;

  @Output() searchResult = new EventEmitter<SearchResult>();
  @ViewChild('movieInput') movieInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(private movieService: MovieService) {
    this.oprionsSubscription = this.movieService
      .getAllCategory()
      .subscribe((data) => {
        this.allCategory = data;
        data.forEach((cat) => {
          this.allOptions.push(cat.name);
        });
      });
    this.yearRegExp = new RegExp(this.YEAR_REGEX);
    this.year = false;
    this.inputPlaceholder = this.PLACEHORDER_BEFORE;

    this.filteredOptions = this.movieFormControl.valueChanges.pipe(
      // tslint:disable-next-line: deprecation
      startWith(null),
      map((fruit: string | null) =>
        fruit ? this.filterOut(fruit) : this.allOptions.slice()
      )
    );
  }
  ngOnDestroy(): void {
    this.oprionsSubscription.unsubscribe();
  }

  ngOnInit() {}

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (this.allOptions.includes(value)) {
      this.options.push(value.trim());
    } else if (this.checkInputIsAYear(value) && !this.year) {
      this.year = true;
      this.options.push(value.trim());
    }
    input.value = '';
    this.setPlaceholder();
    this.movieFormControl.setValue(null);
  }
  setPlaceholder() {
    if (this.year && this.options.length === 2) {
      this.inputPlaceholder = this.TITLE;
    } else if (
      this.year &&
      this.options.length < 2 &&
      this.options.length > 0
    ) {
      this.inputPlaceholder = this.CATEGORY;
    } else if (
      !this.year &&
      this.options.length < 2 &&
      this.options.length > 0
    ) {
      this.inputPlaceholder = this.YEAR;
    } else {
      this.inputPlaceholder = this.PLACEHORDER_BEFORE;
    }
  }

  remove(options: string): void {
    const index = this.options.indexOf(options);

    if (index >= 0) {
      this.options.splice(index, 1);
      if (this.checkInputIsAYear(options)) {
        this.year = false;
      }
    }
    this.setPlaceholder();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.options.push(event.option.viewValue);
    this.movieInput.nativeElement.value = '';
    this.movieFormControl.setValue(null);
    this.setPlaceholder();
  }

  private filterOut(category: string): string[] {
    const filterValue = category.toLowerCase();

    return this.allOptions.filter(
      (fruit) => fruit.toLowerCase().indexOf(filterValue) === 0
    );
  }

  public stopAutocomplete(): boolean {
    if (this.year) {
      return this.options.length > 1 ? true : false;
    } else {
      return this.options.length > 0 ? true : false;
    }
  }

  private checkInputIsAYear(input: string) {
    return this.yearRegExp.test(input);
  }

  public sendSearchResult(): void {
    const year = this.options.find((opt) => this.yearRegExp.test(opt));
    const category = this.options.find((opt) => !this.yearRegExp.test(opt));
    const result = {
      title:
        this.movieFormControl.value !== null
          ? this.movieFormControl.value
          : undefined,
      category: category
        ? ({ id: this.getCategoryByName(category), name: category } as Category)
        : undefined,
      year,
    } as SearchResult;
    this.searchResult.emit(result);
  }

  public getCategoryByName(name: string): number {
    return this.allCategory.find((category) => category.name === name).id;
  }
}
