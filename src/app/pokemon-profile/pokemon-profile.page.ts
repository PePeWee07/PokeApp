import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ability, Pokemon, Stat } from '../interfaces/Pokemon';
import { PokeApiServiceService } from '../services/poke-api-service.service';
import { Preferences } from '@capacitor/preferences';
import { AbilitysPokemon } from '../interfaces/AbilitysPokemon';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertController, IonicSlides } from '@ionic/angular';
import { MyObjectSimilarAbilities } from '../interfaces/myModels/similarAbilities';

import { ECharts, EChartsOption } from 'echarts';
import { PokemonSpecies } from '../interfaces/pokemonSpecies';
import { EvolutionChain } from '../interfaces/EvolutionChain';
import { PokemonHabitat } from '../interfaces/PokemonHabitat';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pokemon-profile',
  templateUrl: './pokemon-profile.page.html',
  styleUrls: ['./pokemon-profile.page.scss'],
})
export class PokemonProfilePage implements OnInit {
  constructor(
    private idRoute: ActivatedRoute,
    private pokeService: PokeApiServiceService,
    private alertController: AlertController,
    private router: Router,
    private httpClient: HttpClient
  ) {}

  imageExists = false;
  async checkImageExists() {
    const imageUrl = `../../assets/Pokemon3d/ani-front/${this.name}.gif`;

    try {
      await this.httpClient.get(imageUrl, { responseType: 'blob' }).toPromise();
      this.imageExists = true;
    } catch (error) {
      this.imageExists = false;
    }

  }
  imageExistShiny = false;
  async checkImageExistShiny() {
    const imageUrl = `../../assets/Pokemon3d/ani-front-shiny/${this.name}.gif`;

    try {
      await this.httpClient.get(imageUrl, { responseType: 'blob' }).toPromise();
      this.imageExistShiny = true;
    } catch (error) {
      this.imageExistShiny = false;
    }

  }

  //Options Ngx-ECharts --->
  option: EChartsOption = {};

  echartsInstance!: ECharts;
  onChartInit(chart: ECharts) {
    this.echartsInstance = chart;
  }
  //<-----

  pokemon: Pokemon[] = [];
  abilities: Ability[] = []; //Habilidades del pokemon
  ability: AbilitysPokemon[] = []; //Descripcio de habilidad del pokemon
  abilitySimilar: MyObjectSimilarAbilities[] = [];
  statsData: any[] = []; //no compatible con la ionterfaz Stast por undefined cambiarla si desear usarla
  pokeSpecies: PokemonSpecies[] = [];
  evolutioChain: Pokemon[] = [];
  pokeHabitat: PokemonHabitat[] = [];
  name: any = 'Pokemon name';

  getPokemon() {
    const idPokemon = Number(this.idRoute.snapshot.paramMap.get('id'));
    this.pokeService.getPokemonById(idPokemon).subscribe(
      (resp: Pokemon) => {
        this.pokemon.push(resp);
        this.name = resp.name;
        this.checkImageExists();
        this.checkImageExistShiny();
        //Link o nombre de la habilidad a  CONSUMIR
        this.abilities.push(...resp.abilities!);
        this.statsData.push(...resp.stats!);

        //Configuración de los datos para el gráfico de radar Ngx-ECharts
        const indicatorData = this.statsData.map((stat) => {
          return {
            name: this.transformtext(stat.stat?.name), // Nombre del stat
            max: 255, // Valor máximo para el indicador
            min: 0, // Valor mínimo para el indicador
          };
        });

        const seriesData = [
          {
            value: this.statsData.map((stat) => stat.base_stat), // Valores de los base_stats
            name: this.name,
            areaStyle: {
              color: 'rgba(64, 224, 208, 0.7)',
            },
            symbol: 'none',
            symbolSize: 5,
            label: {
              show: false,
              formatter: function (params: any) {
                return params.value;
              },
            },
          },
        ];

        this.option = {
          // title: {
          //   text: 'Estadísticas base'
          // },
          // legend: {
          //   data: [this.name]
          // },
          radar: {
            indicator: indicatorData,
            center: ['50%', '50%'],
            radius: 120,
            axisName: {
              // formatter: '【{value}】',
              backgroundColor: '#222428',
              borderRadius: 3,
              padding: [3, 5],
              color: '#ffffff',
            },
            splitArea: {
              areaStyle: {
                color: [
                  '#ccf3412c',
                  '#ccf3412c',
                  '#f3bb412c',
                  '#ccf3412c, #f35c412c',
                  '#f35c412c',
                  '#f3bb412c',
                  '#ccf3412c',
                ],
                shadowColor: 'rgba(255, 255, 255, 0.8)',
                shadowBlur: 10,
              },
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.3)',
              },
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(211, 253, 250, 0.5)',
              },
            },
          },
          series: [
            {
              type: 'radar',
              emphasis: {
                lineStyle: {
                  width: 2.5,
                },
              },
              //alguna propiedades se ecuentran dentro al traer seriesData
              data: seriesData,
              lineStyle: {
                type: 'solid',
              },
            },
          ],
        };

        //Consumo de la habilidadades similiares de pokemones
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
                this.pokeService.getPokemonByName(name).subscribe(
                  (resp: Pokemon) => {
                    let { id, name, sprites, types } = resp;
                    similarPokemons.push({ id, name, sprites, types });
                  },
                  async (error) => {
                    console.log('Error-getPokemonByName-forAbilities: ', error);
                    const alert = await this.alertController.create({
                      header: 'Alerta',
                      subHeader: 'No se encontro el Pokémon',
                      message:
                        'No se pudo traer el Pokémon para ver la habilidad similar',
                      buttons: ['OK'],
                    });
                    await alert.present();
                  }
                );
              });

              //guardamos en un array por habilidad separando los pokemones con la misma habilidad
              this.abilitySimilar.push({
                abilityName: ability.name, // Agrege el nombre de la habilidad
                pokemons: similarPokemons, // Agrege la lista de pokemones con esta habilidad similar
              });
            });
          },
          async (error) => {
            console.log('Error-getPokemonAbility: ', error);
            const alert = await this.alertController.create({
              header: 'Alerta',
              subHeader: 'No se encontro la habilidad',
              message: 'No se pudo traer la habilidad del Pokémon',
              buttons: ['OK'],
            });
            await alert.present();
          }
        );

        //COnsumo de Especies de pokemon, habitat y cadena de evolucion
        this.pokeService.getPokemonSpecies(resp.species?.name!).subscribe(
          (resp: PokemonSpecies) => {
            let {
              is_baby,
              is_legendary,
              is_mythical,
              habitat,
              flavor_text_entries,
              evolution_chain,
            } = resp;

            this.pokeSpecies.push({
              is_baby,
              is_legendary,
              is_mythical,
              habitat,
              flavor_text_entries,
              evolution_chain,
            });
            console.log('Especies: ', this.pokeSpecies);

            //Consumo de cadena de evolucion
            this.pokeService
              .getPokemonEvolutionChain(evolution_chain?.url!)
              .subscribe(
                (res: EvolutionChain) => {
                  let { chain } = res;
                  // Primera evolución

                  let firstEvolution = chain?.species?.name;

                  // Segunda evolución
                  let secondEvolution = chain?.evolves_to?.[0]?.species?.name;

                  // Tercera evolución
                  let thirdEvolution =
                    chain?.evolves_to?.[0]?.evolves_to?.[0]?.species?.name;

                  const nameEvolutions = [];

                  if (this.name.includes('-')) {
                    if (firstEvolution === this.name) {
                      nameEvolutions.push(firstEvolution);
                    } else {
                      nameEvolutions.push(this.name);
                    }

                    if (secondEvolution) {
                      nameEvolutions.push(secondEvolution);
                    }

                    if (thirdEvolution) {
                      nameEvolutions.push(thirdEvolution);
                    }
                  } else {
                    nameEvolutions.push(firstEvolution);

                    if (secondEvolution) {
                      nameEvolutions.push(secondEvolution);
                    }

                    if (thirdEvolution) {
                      nameEvolutions.push(thirdEvolution);
                    }
                  }

                  const requestEvolutions = nameEvolutions.map(
                    (name: string | undefined) => {
                      return this.pokeService.getPokemonByName(name!);
                    }
                  );

                  forkJoin(requestEvolutions).subscribe(
                    (poke: any[]) => {
                      poke.forEach((pokemon: Pokemon) => {
                        let { id, name, sprites, types } = pokemon;
                        this.evolutioChain.push({ id, name, sprites, types });
                      });
                    },
                    async (error) => {
                      console.log(
                        'Error-getPokemonByName-forEvolution: ',
                        error
                      );
                      const alert = await this.alertController.create({
                        header: 'Alerta',
                        subHeader: 'No se encontro el Pokémon',
                        message:
                          'No se pudo traer el Pokémon para ver la evolución',
                        buttons: ['OK'],
                      });
                      await alert.present();
                    }
                  );
                },
                async (error) => {
                  console.log('Error-getPokemonEvolutionChain: ', error);
                  const alert = await this.alertController.create({
                    header: 'Alerta',
                    subHeader: 'No se encontro la cadena de evolución',
                    message:
                      'No se pudo traer la cadena de evolución del Pokémon',
                    buttons: ['OK'],
                  });
                  await alert.present();
                }
              );

            //Consumo de habitat
            if (habitat == null) {
              this.pokeHabitat.push({
                id: 0,
                name: 'No tiene habitad',
                names: [
                  {
                    language: { name: 'es', url: 'Null' },
                    name: 'No tiene habitad',
                  },
                ],
              });
            } else {
              this.pokeService.getpokemonHabitat(resp.habitat?.url!).subscribe(
                (habitat: PokemonHabitat) => {
                  let { id, name, names } = habitat;
                  this.pokeHabitat.push({ id, name, names });
                },
                async (error) => {
                  console.log('Error-getpokemonHabitat: ', error);
                  const alert = await this.alertController.create({
                    header: 'Alerta',
                    subHeader: 'No se encontro el habitat',
                    message: 'No se pudo traer el habitat del Pokémon',
                    buttons: ['OK'],
                  });
                  await alert.present();
                }
              );
            }
          },
          async (error) => {
            console.log('Error-getPokemonSpecies: ', error);
            const alert = await this.alertController.create({
              header: 'Alerta',
              subHeader: 'No se encontro la especie',
              message: 'No se pudo traer la especie del Pokémon',
              buttons: ['OK'],
            });
            await alert.present();
          }
        );
      },
      async (error) => {
        console.error('No se econtro el Pokémon ', error);
        const alert = await this.alertController.create({
          header: 'Alerta',
          subHeader: 'No se encontro el Pokémon',
          message: 'No se pudo traer el Pokémon',
          buttons: ['OK'],
        });
        await alert.present();
      }
    );
  }

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

  viewIdiomaAbility: boolean = false;
  viewIodmaAbilityPokemon() {
    this.viewIdiomaAbility = !this.viewIdiomaAbility;
  }

  //selectedLanguages[abi.name] estamos accediendo al idioma seleccionado específico para la habilidad actual
  selectedLanguages: { [abilityName: string]: string | undefined } = {};
  setSelectedLanguage(abilityName: string, language: string | undefined) {
    this.selectedLanguages[abilityName] = language;
  }

  // Idioma seleccionado para la habilidad actual
  selectedLanguageName: { [idiomaName: string]: string | undefined } = {};
  setSelectedLanguage2(name: string, language: string | undefined) {
    this.selectedLanguageName[name] = language;
  }

  slectedLanguageHability: { [idiomaName: string]: string | undefined } = {};
  lenguajeHabilidad(abi: AbilitysPokemon) {}

  isAbilityOcult(algo: boolean) {
    if (algo) {
      return 'Si';
    } else {
      return 'No';
    }
  }

  //Separo numero de peso
  convertWeight(p: number) {
    if (String(p).length == 1) {
      // si solo tiene un numero
      return '0,' + String(p) + ' Cm';
    } else {
      // varios numeros
      // agg una coma + capturo el ultmio digito
      let x = ',' + String(p).substr(-1); //,5
      // elimino el ultimo caracter
      let z = String(p).substring(0, String(p).length - 1);
      return z + x + ' M';
    }
  }

  //Separo numero de alto
  convertHeight(h: number) {
    if (String(h).length == 1) {
      return '0,' + String(h) + ' g';
    } else {
      // varios numeros
      // agg una coma + capturo el ultmio digito
      let x = ',' + String(h).substr(-1); //,5
      // elimino el ultimo caracter
      let z = String(h).substring(0, String(h).length - 1);
      return z + x + ' Kg';
    }
  }

  transformtext(str: string): string {
    if (str === undefined) {
      return 'Null';
    } else if (str === null) {
      return 'Null';
    } else if (str.length === 0) {
      return 'Null';
    } else if (str === 'special-defense') {
      return 'Sp. Def';
    } else if (str === 'special-attack') {
      return 'Sp. Atk';
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  isPokeBbay(isBaby: boolean) {
    if (isBaby) {
      return 'Bebé';
    } else {
      return false;
    }
  }

  isPokeLegendary(isLegendary: boolean) {
    if (isLegendary) {
      return 'Legendario';
    } else {
      return false;
    }
  }

  isPokeMythical(isMythical: boolean) {
    if (isMythical) {
      return 'Mítico';
    } else {
      return false;
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
