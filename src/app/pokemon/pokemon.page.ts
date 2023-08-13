import { Component, OnInit, ViewChild } from '@angular/core';
import { PokeApiServiceService } from '../services/poke-api-service.service';
import { Option, Result } from '../interfaces/LinkPokemons';
import { Pokemon } from '../interfaces/Pokemon';
import { Preferences } from '@capacitor/preferences';
import { forkJoin } from 'rxjs';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.page.html',
  styleUrls: ['./pokemon.page.scss'],
})
export class PokemonPage implements OnInit {
  constructor(private pokeService: PokeApiServiceService, private alertController: AlertController) {}

  public loadedSkeleton = true;

  //tostada para el limite de pokemones
  isToastOpen = false;
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  limit: number = 10; // Limite de pokemones a mostrar por ionic infinite scroll
  //capturamos el valor del input para el limite
   onInputChange(event: any, openToast: boolean) {
    const newValue = parseInt(event.detail.value, 10);
    if (!isNaN(newValue) && newValue >= 10 && newValue <= 100) {
      this.limit = newValue;
    } else {
      this.limit = 10;
      this.setOpen(openToast);
    }
  }
  //capturamos el valor del range para el limite
  onRangeChange(event: any) {
    this.limit = event.detail.value;
  }

  pokemonLink: Result[] = [];
  pokemon: Pokemon[] = [];

  offset = 0; // Cantidad de Pokémon a saltar
  loading = false;
  maxlimit = 11;

  //verifica si hay mas pokemones
  hasMorePokemon(): boolean {
    if (this.offset >= this.maxlimit) {
      return false;
    } else {
      return true;
    }
  }

  //carga de pokemones por demanda
  loadMorePokemon(event?: any) {
    if (this.loading || !this.hasMorePokemon()) {
      if (event) {
        event.target.complete();
      }
      return;
    }

    this.loading = true;
    this.pokeService.getPokemonList(this.limit, this.offset).subscribe(
      (data: any) => {
        this.pokemonLink = data.results;
        //cantidad de pokemones
        this.maxlimit = data.count;

        const requests = this.pokemonLink.map((pokemon: Result) => {
          return this.pokeService.getPokemon(pokemon.url);
        });

        //utilizo ForkJoin para que se ejecuten todas las peticiones al mismo tiempo en paralelo
        forkJoin(requests).subscribe(
          (pokemonData: any[]) => {
            pokemonData.forEach((data: Pokemon) => {
              let { name, sprites, types, id } = data;
              this.pokemon.push({ name, sprites, types, id });
            });

            this.loadedSkeleton = false;
            this.loading = false;
            this.offset += this.limit;

            if (this.offset > this.maxlimit) {
              const diferencia = this.offset - this.maxlimit;
              this.offset -= diferencia;
            }

            if (event) {
              //cuando llegue  a su maximo
              event.target.complete();
            }
          },
          async (error: any) => {
            console.log('Error al obtener detalles de los Pokémones: ', error);
            const alert = await this.alertController.create({
              header: 'Error',
              subHeader: 'Algo salió mal',
              message: 'Error al obtener detalles de los Pokémones',
              buttons: ['OK'],
            });
            await  alert.present();
            this.loading = false;
            this.loadedSkeleton = true;
          }
        );
      },
      async (error: any) => {
        console.log('Error al obtener lista de Pokémones: ', error);
        const alert = await this.alertController.create({
          header: 'Error',
          subHeader: 'Algo salió mal',
          message: 'Error al obtener lista de Pokémones',
          buttons: ['OK'],
        });
        await  alert.present();
        this.loading = false;
        this.loadedSkeleton = true;
      }
    );
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
      grass: "#5FBD58",
      fire: "#F08030",
      water: "#6890F0",
      bug: "#A8B820",
      normal: "#A8A878",
      poison: "#A040A0",
      electric: "#F8D030",
      ground: "#E0C068",
      fairy: "#EE99AC",
      fighting: "#C03028",
      psychic: "#F85888",
      rock: "#B8A038",
      ghost: "#705898",
      ice: "#98D8D8",
      dragon: "#7038F8",
      dark: "#705848",
      steel: "#B8B8D0",
      flying: "#A890F0",
      unknown: "#202020"
    };

    if (typeColors[type.toLowerCase()]) {
      return typeColors[type.toLowerCase()];
    } else {
      return "#202020";
    }

  }

//asignacion de clase dependiendo del tipo de pokemon
  pokeClass(type: any){

    const typePokemon: Record<string, string> = {
      grass: "icom grass",
      fire: "icon fire",
      water: "icon water",
      bug: "icon bug",
      normal: "icon normal",
      poison: "icon poison",
      electric: "icon electric",
      ground: "icon ground",
      fairy: "icon fairy",
      fighting: "icon fighting",
      psychic: "icon psychic",
      rock: "icon rock",
      ghost: "icon ghost",
      ice: "icon ice",
      dragon: "icon dragon",
      dark: "icon dark",
      steel: "icon steel",
      flying: "icon flying",
      unknown: "icom unknown"
    };

    if (typePokemon[type.toLowerCase()]) {
      return typePokemon[type.toLowerCase()];
    } else {
      return "icom unknown";
    }

  }

  //imagen de tipo svg dependiendo del tipo de pokemon
  pokeTypeSVG(type: any){

    const typePokemon: Record<string, string> = {
      grass: "../../assets/typesPokemons/grass.svg",
      fire: "../../assets/typesPokemons/fire.svg",
      water: "../../assets/typesPokemons/water.svg",
      bug: "../../assets/typesPokemons/bug.svg",
      normal: "../../assets/typesPokemons/normal.svg",
      poison: "../../assets/typesPokemons/poison.svg",
      electric: "../../assets/typesPokemons/electric.svg",
      ground: "../../assets/typesPokemons/ground.svg",
      fairy: "../../assets/typesPokemons/fairy.svg",
      fighting: "../../assets/typesPokemons/fighting.svg",
      psychic: "../../assets/typesPokemons/psychic.svg",
      rock: "../../assets/typesPokemons/rock.svg",
      ghost: "../../assets/typesPokemons/ghost.svg",
      ice: "../../assets/typesPokemons/ice.svg",
      dragon: "../../assets/typesPokemons/dragon.svg",
      dark: "../../assets/typesPokemons/dark.svg",
      steel: "../../assets/typesPokemons/steel.svg",
      flying: "../../assets/typesPokemons/flying.svg",
      unknown: "../../assets/img/spriteNull.png"
    };

    if (typePokemon[type.toLowerCase()]) {
      return typePokemon[type.toLowerCase()];
    } else {
      return "../../assets/img/spriteNull.png";
    }

  }

  //color de borde de tarjeta dependiendo del tipo de pokemon
  borderCardPokemon(types: any){
    const typeColors: Record<string, string> = {
      grass: "#5FBD58",
      fire: "#F08030",
      water: "#6890F0",
      bug: "#A8B820",
      normal: "#A8A878",
      poison: "#A040A0",
      electric: "#F8D030",
      ground: "#E0C068",
      fairy: "#EE99AC",
      fighting: "#C03028",
      psychic: "#F85888",
      rock: "#B8A038",
      ghost: "#705898",
      ice: "#98D8D8",
      dragon: "#7038F8",
      dark: "#705848",
      steel: "#B8B8D0",
      flying: "#A890F0",
      unknown: "#202020"
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
    this.loadMorePokemon();
  }
}
