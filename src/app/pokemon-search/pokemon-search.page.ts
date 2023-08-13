import { Component, OnInit } from '@angular/core';
import { Pokemon } from '../interfaces/Pokemon';
import { PokeApiServiceService } from '../services/poke-api-service.service';
import { PokemonCharacteristic } from '../interfaces/characteristic';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';
import { PokemonSpecies } from '../interfaces/pokemonSpecies';
@Component({
  selector: 'app-pokemon-search',
  templateUrl: './pokemon-search.page.html',
  styleUrls: ['./pokemon-search.page.scss'],
})
export class PokemonSearchPage implements OnInit {

  constructor(private pokeService: PokeApiServiceService,private alertController: AlertController) { }

  showCardDeafult: boolean = true;


  isToastOpen = false;
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }


  private searchTimeout: any; // Variable para almacenar el temporizador

handleInput(event: any, openToast: boolean) {
  clearTimeout(this.searchTimeout); // Limpiar el temporizador anterior
  const query = event.target.value.toLowerCase();
  this.searchTimeout = setTimeout(() => {
    console.log(query);
    if (query) {
      this.getPokemonByName(query);
      this.showCardDeafult = false;
    } else {
      this.setOpen(openToast);
      this.showCardDeafult = true;
    }
  }, 500); // Establecer un retraso
}


  pokemon: Pokemon[] = [];
  species: PokemonSpecies[] = [];
  getPokemonByName(pokeName: string){
    this.pokemon = [];
    this.species = [];
    this.pokeService.getPokemonByName(pokeName).subscribe((resp:Pokemon) => {
      this.pokemon.push(resp);

      this.pokeService.getPokemonSpecies(resp.id).subscribe((resp: PokemonSpecies) => {
        let {genera} = resp;
        this.species.push({genera});
      },
      async (error) => {
        console.error("No se econtro especies" ,error);
        const alert = await this.alertController.create({
          header: 'Alerta',
          subHeader: 'No se encontro la descripcion del Pokémon',
          message: 'No se encontró la descripción de la especie del Pokémon',
          buttons: ['OK'],
        })
        await alert.present();
      });

    },async (error: any) => {
      console.log('Error al obtener el Pokémon: ', error);
      this.showCardDeafult = true;
      const alert = await this.alertController.create({
        header: 'Alerta',
        subHeader: 'No se econtro al Pokémon',
        message: 'verifique si está escrito correctamente el nombre del Pokémon',
        buttons: ['OK'],
      });
      await  alert.present();
    });
  }

  selectedLanguage: string|undefined = 'es'; // Idioma predeterminado
  setSelectedLanguage(language: string |undefined) {
    this.selectedLanguage = language;
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

  darkMode: boolean = false;
  //Chekamos el modo Dark para guardarlo en LocalStorage ... Preferences por decir es mejor para Dispositivos moviles
  async checkAppMode() {
    // const checkIsDarkMode = localStorage.getItem('darkModeActivated');
    const checkIsDarkMode = await Preferences.get({ key: 'darkModeActivated' });
    checkIsDarkMode?.value === 'true'
      ? (this.darkMode = true)
      : (this.darkMode = false);
    document.body.classList.toggle('dark', this.darkMode);
  }

  ngOnInit() {
    this.checkAppMode();
  }

}
