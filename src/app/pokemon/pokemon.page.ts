import { Component , OnInit } from '@angular/core';
import { PokeApiServiceService } from '../services/poke-api-service.service';
import { Result } from '../interfaces/LinkPokemons';
import { Pokemon } from '../interfaces/Pokemon';
import { Preferences } from '@capacitor/preferences';
import { forkJoin } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.page.html',
  styleUrls: ['./pokemon.page.scss'],
})
export class PokemonPage implements OnInit {
  constructor(private pokeService: PokeApiServiceService, private alertController: AlertController, private router:Router) {}

  public loadedSkeleton = true;

  filterType: string = ''; // Tipo de filtro seleccionado
  filterValue: string = ''; // Valor de filtro ingresado
  filteredPokemon: any[]= []; // Pokémon filtrados según los criterios
  // Declara variables booleanas para cada filtro
  foundByType = false;
  foundByName = false;
  foundById = false;

  getTypeNames(types:any) {
    return types.map((type:any) => type.type.name).join(', ');
  }
  cleanFIlter(){
    // this.filterType = '';
    this.filterValue = '';
    this.filteredPokemon = [];
  }
  async applyFilter(openToast: boolean) {
    if(this.filterType && this.filterValue){

      // Lógica para aplicar los filtros
      if (this.filterType === 'type') {
        this.filteredPokemon = this.pokemon.filter(poke =>
          poke.types?.some(type => type.type?.name === this.filterValue)
        );
        this.foundByType = this.filteredPokemon.length > 0;
      }

      if (this.filterType === 'name') {
        this.filteredPokemon = this.pokemon.filter(poke =>
          poke.name?.toLowerCase().includes(this.filterValue.toLowerCase())
        );
        this.foundByName = this.filteredPokemon.length > 0;
      }

      if (this.filterType === 'id') {
        this.filteredPokemon = this.pokemon.filter(poke =>
          poke.id?.toString() === this.filterValue
        );
        this.foundById = this.filteredPokemon.length > 0;
      }

    }  else if(this.filterType && !this.filterValue){

        const alert = await this.alertController.create({
          header: 'Alerta',
          subHeader: 'Digite un valor para filtrar',
          message: 'Es necesario que escriba un valor para poder filtrar',
          buttons: ['OK'],
        });

        await alert.present();

    } else if(!this.filterType && this.filterValue){

      const alert = await this.alertController.create({
        header: 'Alerta',
        subHeader: 'Seleccione un tipo de filtro',
        message: 'Es necesario que elija un filtro para poder filtrar',
        buttons: ['OK'],
      });

      await alert.present();
    }
    else {
      console.log("Seleccione un tipo de filtro y digite un valor para filtrar");

      const alert = await this.alertController.create({
        header: 'Alerta',
        subHeader: 'Complete los campos',
        message: 'Seleccione un tipo de filtro y digite un valor para filtrar',
        buttons: ['OK'],
      });

      await alert.present();
    }
  }

  //tostada para el limite de pokemones
  isToastOpen = false;
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  limit: number = 25; // Limite de pokemones a mostrar por ionic infinite scroll
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

  isToastOpen2 = false;
  setOpen2(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }


  onInputMaxSelect(event: any, openToast: boolean) {
    const newValue = parseInt(event.detail.value, 10);
    if (!isNaN(newValue) && newValue >= 2 && newValue <= 7) {
      this.maxPokemonSelect = newValue;
    } else {
      this.maxPokemonSelect = 2;
      this.setOpen2(openToast)
    }
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


  pokemonBorderStates: { [key: number]: boolean } = {};

  selectedPokemonId: number | undefined;
  pressDuration: number = 0; // Variable para guardar el tiempo de presión
  selectedPokemonIds: number[] = [];
  pressTimerInterval: any; // Variable para guardar el interval del timer
  maxPokemonSelect: number = 2; // ceunta de pokemones maximo a seleccionar

  startPressTimer(pokeId: number) {
    if (this.selectedPokemonIds.length < this.maxPokemonSelect) {
    this.pressDuration = 0;
    this.selectedPokemonId = pokeId;

    //this.pokemonBorderStates[pokeId] = false;// Inicia con el borde sin aplicar

    // Iniciar el interval del timer
    this.pressTimerInterval = setInterval(() => {

      this.pressDuration += 100; // Incrementa el tiempo cada 100 ms
      console.log("Tiempo: ", this.pressDuration);
      if (this.pressDuration >= 500) { // presionó más de 1 segundo
        // El usuario mantuvo presionado el Pokémon durante el tiempo deseado

       // this.pokemonBorderStates[pokeId] = true; // Aplica el borde para este Pokémon

        clearInterval(this.pressTimerInterval); // Detener el interval del timer
      }

    }, 100);
  }
  }

  endPressTimer(pokeId: number) {
    clearInterval(this.pressTimerInterval); // Detener el interval del timer

    if (this.pressDuration >= 500) { // Mantuvo presionado el tiempo deseado
      console.log("El usuario mantuvo presionado el tiempo deseado");
      if (this.selectedPokemonIds.includes(pokeId)) {
        // Pokemon ya estaba seleccionado, quitar selección

        //this.pokemonBorderStates[pokeId] = false; // Deja el borde aplicado

        this.selectedPokemonIds.splice(this.selectedPokemonIds.indexOf(pokeId), 1);
        this.consultSelectPokemons(this.selectedPokemonIds)


      } else {
        // Agregar la selección del Pokemon

        //this.pokemonBorderStates[pokeId] = true;

        this.selectedPokemonIds.push(pokeId);
        this.consultSelectPokemons(this.selectedPokemonIds)

        //si ya hay 2 pokemones seleccionados nos vamos a la pagina de comparacion
        if(this.selectedPokemonIds.length == this.maxPokemonSelect){
          this.router.navigate(['stats-comparison/'+this.selectedPokemonIds]);
          this.resetSelectPokemons()

        }
      }
    }  else {
      // El usuario no mantuvo presionado el tiempo deseado

      //this.pokemonBorderStates[pokeId] = false; // Quita el borde

      console.log("El usuario no mantuvo presionado el tiempo deseado");
      this.router.navigate(['/pokemon-profile/' + pokeId]);
    }
    // Reinicia la variable del tiempo de presión
    this.pressDuration = 0;
    this.selectedPokemonId = undefined;
  }

  resetSelectPokemons() {
    this.pokemonSelectConsult = [];
    this.selectedPokemonIds = [];
  }


pokemonSelectConsult: Pokemon[] = [];
  consultSelectPokemons( ids: Array<number>){
    this.pokemonSelectConsult = [];

    if(ids.length){

      const requests = ids.map(((pokeIdNumber: number) => {
        return this.pokeService.getPokemonById(pokeIdNumber);
      }));

      forkJoin(requests).subscribe(
        (pokemonData: any[]) => {
          pokemonData.forEach((data: Pokemon) => {
            let { sprites, id } = data;
            this.pokemonSelectConsult.push({ sprites, id });
          });
        }
      )

    } else {
      console.log("nada que consultar");
    }
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
