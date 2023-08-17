import { AlertController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { PokeApiServiceService } from '../services/poke-api-service.service';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Pokemon } from '../interfaces/Pokemon';

@Component({
  selector: 'app-stats-comparison',
  templateUrl: './stats-comparison.page.html',
  styleUrls: ['./stats-comparison.page.scss'],
})
export class StatsComparisonPage implements OnInit {
  constructor(
    private pokeService: PokeApiServiceService,
    private alertController: AlertController,
    private idRoute: ActivatedRoute
  ) {}

  pokemon: Pokemon[] = [];

  loadPokemon() {
    const id = this.idRoute.snapshot.paramMap.get('id');

    const newIds = id?.split(',').map(Number);

    const requests = newIds?.map((id: any) => {
      return this.pokeService.getPokemonById(id);
    });

    forkJoin(requests!).subscribe((res: any[]) => {
      res.forEach((pokemonData: Pokemon) => {
        let { name, sprites, stats, types, id, abilities, moves } = pokemonData;
        this.pokemon.push({
          name,
          sprites,
          stats,
          types,
          id,
          abilities,
          moves,
        });
        console.log('Pokemon: ', this.pokemon);
      });
    });
  }

  //cambiamos el modo Dark
  darkMode: boolean = false;
  toogleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);
    if (this.darkMode) {
      Preferences.set({ key: 'darkModeActivated', value: 'true' });
      // localStorage.setItem('darkModeActivated', 'true');
    } else {
      // localStorage.setItem('darkModeActivated', 'false');
      Preferences.set({ key: 'darkModeActivated', value: 'false' });
    }
  }

  //Chekamos el modo Dark para guardarlo en LocalStorage ... Preferences por decir es mejor para Dispositivos moviles
  async checkAppMode() {
    // const checkIsDarkMode = localStorage.getItem('darkModeActivated');
    const checkIsDarkMode = await Preferences.get({ key: 'darkModeActivated' });
    checkIsDarkMode?.value === 'true'
      ? (this.darkMode = true)
      : (this.darkMode = false);
    document.body.classList.toggle('dark', this.darkMode);
  }

  //color dependiendo del tipo de pokemon
  colorType(type: any): string {
    const typeColors: Record<string, string> = {
      grass: '#5FBD58',
      fire: '#F08030',
      water: '#6890F0',
      bug: '#A8B820',
      normal: '#A8A878',
      poison: '#A040A0',
      electric: '#F8D030',
      ground: '#E0C068',
      fairy: '#EE99AC',
      fighting: '#C03028',
      psychic: '#F85888',
      rock: '#B8A038',
      ghost: '#705898',
      ice: '#98D8D8',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      flying: '#A890F0',
      unknown: '#202020',
    };

    if (typeColors[type.toLowerCase()]) {
      return typeColors[type.toLowerCase()];
    } else {
      return '#202020';
    }
  }

  //asignacion de clase dependiendo del tipo de pokemon
  pokeClass(type: any) {
    const typePokemon: Record<string, string> = {
      grass: 'icom grass',
      fire: 'icon fire',
      water: 'icon water',
      bug: 'icon bug',
      normal: 'icon normal',
      poison: 'icon poison',
      electric: 'icon electric',
      ground: 'icon ground',
      fairy: 'icon fairy',
      fighting: 'icon fighting',
      psychic: 'icon psychic',
      rock: 'icon rock',
      ghost: 'icon ghost',
      ice: 'icon ice',
      dragon: 'icon dragon',
      dark: 'icon dark',
      steel: 'icon steel',
      flying: 'icon flying',
      unknown: 'icom unknown',
    };

    if (typePokemon[type.toLowerCase()]) {
      return typePokemon[type.toLowerCase()];
    } else {
      return 'icom unknown';
    }
  }

  //imagen de tipo svg dependiendo del tipo de pokemon
  pokeTypeSVG(type: any) {
    const typePokemon: Record<string, string> = {
      grass: '../../assets/typesPokemons/grass.svg',
      fire: '../../assets/typesPokemons/fire.svg',
      water: '../../assets/typesPokemons/water.svg',
      bug: '../../assets/typesPokemons/bug.svg',
      normal: '../../assets/typesPokemons/normal.svg',
      poison: '../../assets/typesPokemons/poison.svg',
      electric: '../../assets/typesPokemons/electric.svg',
      ground: '../../assets/typesPokemons/ground.svg',
      fairy: '../../assets/typesPokemons/fairy.svg',
      fighting: '../../assets/typesPokemons/fighting.svg',
      psychic: '../../assets/typesPokemons/psychic.svg',
      rock: '../../assets/typesPokemons/rock.svg',
      ghost: '../../assets/typesPokemons/ghost.svg',
      ice: '../../assets/typesPokemons/ice.svg',
      dragon: '../../assets/typesPokemons/dragon.svg',
      dark: '../../assets/typesPokemons/dark.svg',
      steel: '../../assets/typesPokemons/steel.svg',
      flying: '../../assets/typesPokemons/flying.svg',
      unknown: '../../assets/img/spriteNull.png',
    };

    if (typePokemon[type.toLowerCase()]) {
      return typePokemon[type.toLowerCase()];
    } else {
      return '../../assets/img/spriteNull.png';
    }
  }

  //color de borde de tarjeta dependiendo del tipo de pokemon
  borderCardPokemon(types: any) {
    const typeColors: Record<string, string> = {
      grass: '#5FBD58',
      fire: '#F08030',
      water: '#6890F0',
      bug: '#A8B820',
      normal: '#A8A878',
      poison: '#A040A0',
      electric: '#F8D030',
      ground: '#E0C068',
      fairy: '#EE99AC',
      fighting: '#C03028',
      psychic: '#F85888',
      rock: '#B8A038',
      ghost: '#705898',
      ice: '#98D8D8',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      flying: '#A890F0',
      unknown: '#202020',
    };

    if (types.length >= 2) {
      let firstTypeName = types[0].type.name.toLowerCase();
      let secondTypeName = types[1].type.name.toLowerCase();

      let firstColor = typeColors[firstTypeName];
      let secondColor = typeColors[secondTypeName];

      let borderShadow = `box-shadow: 3.5px 3.5px 20px ${firstColor}, -3.5px -3.5px 20px ${secondColor};`;

      return borderShadow;
    } else if (types.length === 1) {
      let typeName = types[0].type.name.toLowerCase();
      let color = typeColors[typeName];

      let borderShadow = `box-shadow: 3.5px 3.5px 20px ${color}, -3.5px -3.5px 20px ${color};`;

      return borderShadow;
    } else {
      return '';
    }
  }

  ngOnInit() {
    this.checkAppMode();
    this.loadPokemon();
  }
}
