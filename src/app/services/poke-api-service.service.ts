import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PokeApiServiceService {

  constructor(private http: HttpClient) { }

  // https://pokeapi.co/api/v2/pokemon?limit=2&offset=0
  getPokemonList(limit: number, offset: number, ) {
    return this.http.get( environment.URL + `pokemon?limit=${limit}&offset=${offset}`);
  }

  getPokemon(url: string) {
    return this.http.get(url);
  }
}
