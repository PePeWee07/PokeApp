import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Ability, Pokemon } from '../interfaces/Pokemon';
import { PokeApiServiceService } from '../services/poke-api-service.service';
import { Preferences } from '@capacitor/preferences';
import { AbilitysPokemon } from '../interfaces/AbilitysPokemon';
import { forkJoin } from 'rxjs';
import { IonicSlides } from '@ionic/angular';
import { MyObjectSimilarAbilities } from '../interfaces/myModels/similarAbilities';

@Component({
  selector: 'app-pokemon-profile',
  templateUrl: './pokemon-profile.page.html',
  styleUrls: ['./pokemon-profile.page.scss'],
})
export class PokemonProfilePage implements OnInit  {

  constructor(private idRoute: ActivatedRoute, private pokeService:  PokeApiServiceService) { }

  pokemon: Pokemon[] = [];
  abilities: Ability[] = []; //Habilidades del pokemon
  ability: AbilitysPokemon[] = []; //Descripcio de habilidad del pokemon
  abilitySimilar: MyObjectSimilarAbilities[] = [];
  name: string | undefined = "Pokemon name";

  getPokemon(){
    const idPokemon = Number(this.idRoute.snapshot.paramMap.get('id'));
    this.pokeService.getPokemonById(idPokemon).subscribe((resp:Pokemon) => {
      this.pokemon.push(resp);
      this.name =  resp.name;

      //Link o nombre de la habilidad a  CONSUMIR
      this.abilities.push(...resp.abilities!);

      const requestAbilitys = this.abilities.map((ability: Ability) => {
        return this.pokeService.getPokemonAbility(ability.ability?.name);
      });


      forkJoin(requestAbilitys).subscribe(
        (resp: AbilitysPokemon[]) => {
          this.abilitySimilar = [];
          this.ability.push(...resp);

          // Mapeo de las habilidades del pokemon
        resp.forEach((ability: AbilitysPokemon) => {

          // Mapeo de los pokemones con la habilidad similar
          const similarPokemons: Pokemon[] = [];

          ability.pokemon!.forEach((poke: any) => {
            const name = poke.pokemon.name;
            this.pokeService.getPokemonByName(name).subscribe((resp: Pokemon) => {
              let { id, name, sprites, types } = resp;
              similarPokemons.push({ id, name, sprites, types });
            }, error => {
              console.log("Error-getPokemonByName-forAbilities: ", error);
            });
          });

          //guardamos en un array por habilidad separando los pokemones con la misma habilidad
          this.abilitySimilar.push({
            abilityName: ability.name, // Agrege el nombre de la habilidad
            pokemons: similarPokemons // Agrege la lista de pokemones con esta habilidad similar
          });
        });

          console.log("abilitySimilar: ", this.abilitySimilar);

      }, error => {
        console.log("Error-getPokemonAbility: ", error);
      });

    }, error => {
      console.log("Error-getPokemonById: ", error);
    }
    );
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

  viewIdiomaAbility: boolean = false;
  viewIodmaAbilityPokemon(){
    this.viewIdiomaAbility = !this.viewIdiomaAbility;
  }

//selectedLanguages[abi.name] estamos accediendo al idioma seleccionado específico para la habilidad actual
 selectedLanguages: { [abilityName: string]: string | undefined } = {};
setSelectedLanguage(abilityName: string, language: string | undefined) {
  this.selectedLanguages[abilityName] = language;
}

// Idioma seleccionado para la habilidad actual
  selectedLanguageName: { [idiomaName: string ]: string | undefined } = {};
  setSelectedLanguage2(name: string ,language: string |undefined) {
    this.selectedLanguageName[name] = language;
  }

  isAbilityOcult(algo: boolean){
    if(algo){
      return "Si";
    }else{
      return "No";
    }
  }

  //slider de SWIPER... por si quiero ejecutar algo cuando cambie de slide
  @Input() slides: any[] = [];
  swiperModules = [IonicSlides];
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;


  swiperSlideChanged(e: any) {
    // console.log(this.swiperRef?.nativeElement.swiper.activeIndex);//idice actual
    // console.log('changed: ', e);
  }

  ngOnInit() {
    this.getPokemon();
    this.checkAppMode();
  }

}
