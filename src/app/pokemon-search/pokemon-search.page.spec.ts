import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokemonSearchPage } from './pokemon-search.page';

describe('PokemonSearchPage', () => {
  let component: PokemonSearchPage;
  let fixture: ComponentFixture<PokemonSearchPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PokemonSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
