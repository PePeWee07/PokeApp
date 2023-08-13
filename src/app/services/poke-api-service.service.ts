import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PokemonCharacteristic } from '../interfaces/characteristic';
import { Observable, catchError, throwError } from 'rxjs';

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

  getPokemonById(id: number) {
    return this.http.get(environment.URL + `pokemon/${id}`);
  }

  getPokemonByName(name: string) {
    return this.http.get(environment.URL + `pokemon/${name}`);
  }

  getPokemonSpecies(id: number | undefined) {
    return this.http.get(environment.URL + `pokemon-species/${id}`);
  }

  getPokemonAbility(id: number | string |undefined) {
    return this.http.get(environment.URL + `ability/${id}`);
  }




//LEER PARA QUE SRIVE ESTA LLAMADA DE LA API
  getPokemonCharacteristics(id: number | undefined): Observable<PokemonCharacteristic> {
      return this.http.get<PokemonCharacteristic>(environment.URL + `characteristic/${id}`)
        .pipe(
          catchError(this.handleError)
        );
  }
  private handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      console.log("Caracteristicas de Pokémon no encontrado.");
      // Aquí podrías lanzar un error personalizado o manejarlo de acuerdo a tus necesidades.
    } else {
      console.error("Error en la llamada HTTP:", error);
      // Aquí podrías lanzar un error personalizado o manejarlo de acuerdo a tus necesidades.
    }
    return throwError("Algo salió mal. Por favor, inténtalo de nuevo más tarde.");
  }

}
