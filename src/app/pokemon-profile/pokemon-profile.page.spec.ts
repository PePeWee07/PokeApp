import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokemonProfilePage } from './pokemon-profile.page';

describe('PokemonProfilePage', () => {
  let component: PokemonProfilePage;
  let fixture: ComponentFixture<PokemonProfilePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PokemonProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
