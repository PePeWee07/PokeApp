import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pokemon } from '../interfaces/Pokemon';
import { PokeApiServiceService } from '../services/poke-api-service.service';

@Component({
  selector: 'app-pokemon-profile',
  templateUrl: './pokemon-profile.page.html',
  styleUrls: ['./pokemon-profile.page.scss'],
})
export class PokemonProfilePage implements OnInit {

  constructor(private idRoute: ActivatedRoute, private pokeService:  PokeApiServiceService) { }

  pokemon: Pokemon[] = [];
  name: string | undefined = "Pokemon name";

  getPokemon(){
    const idPokemon = Number(this.idRoute.snapshot.paramMap.get('id'));
    this.pokeService.getPokemonById(idPokemon).subscribe((resp:Pokemon) => {
      this.pokemon.push(resp);
      console.log(this.pokemon);

      this.name =  resp.name;

    }, error => {
      console.log("Error: ", error);
    }
    );
  }

  ngOnInit() {
    this.getPokemon();
  }

}
