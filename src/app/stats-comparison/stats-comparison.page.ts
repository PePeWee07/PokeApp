import { Color } from './../interfaces/pokemonSpecies';
import { AlertController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { PokeApiServiceService } from '../services/poke-api-service.service';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Pokemon } from '../interfaces/Pokemon';
import { ECharts, EChartsOption, RadarComponentOption } from 'echarts';
import * as echarts from 'echarts';

interface HighestStats {
  [key: string]: { name: string; value: number };
}
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



  //Options Ngx-ECharts --->
  option: EChartsOption = {};

  echartsInstance!: ECharts;
  onChartInit(chart: ECharts) {
    this.echartsInstance = chart;
  }
  //<-----

  pokemon: Pokemon[] = [];
  compareSatats: any[] = [];
  compareEmpate: any[] = [];

  idPokemon: any[] | undefined = [];
  getIdPokemon() {
    this.idPokemon = [];
    const id = this.idRoute.snapshot.paramMap.get('id');
    this.idPokemon = id?.split(',').map(Number);
    console.log('idPokemon',  this.idPokemon);
  }
  getFormattedIdPokemon() {
    return this.idPokemon?.join(', ');
  }

  isToastOpen = false;
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
  onInputChange(event?: any, openToast?: boolean) {
    this.idPokemon = [];
    const inputText = event.detail.value;

    if (inputText !== '') {
      const values = inputText.split(',').map((str: string) => str.trim());

    for (const value of values) {
      if (!isNaN(Number(value))) {
        this.idPokemon.push(Number(value));
      } else {
        this.idPokemon.push(value);
      }
    }

    console.log('idPokemonArray:', this.idPokemon);
    this.loadPokemon();
    } else {
      this.idPokemon = [3,6,9];
      this.setOpen(openToast!);
    }



  }


  loadPokemon() {
    this.pokemon = [];
    this.compareEmpate = [];
    this.compareSatats = [];
    this.option = {};
    // const id = this.idRoute.snapshot.paramMap.get('id');

    // const newIds = id?.split(',').map(Number);

    let newIds = this.idPokemon;

    console.log('newIds', newIds);

    const requests = newIds?.map((id: any) => {
      return this.pokeService.getPokemonByNameOrId(id);
    });


    // Genera un color aleatorio en formato rgba
    function getRandomColor() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      const alpha = 0.6; // Puedes ajustar la transparencia aquí
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }


    forkJoin(requests!).subscribe((res: any[]) => {
      const radarData = res.map((pokemonData: any) => {

        this.pokemon.push(pokemonData);

        const statsValues = pokemonData.stats.map((stat: any) => stat.base_stat);

    return {
      value: statsValues,
      name: pokemonData.name,
      areaStyle: {
        color: getRandomColor(),
      },
      // areaStyle: {
      //   color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
      //     {
      //       color: getRandomColor(),
      //       offset: 0
      //     },
      //     {
      //       color: getRandomColor(),
      //       offset: 1
      //     }
      //   ])
      // }
    };
      });

      const pokemonNames = res.map((pokemonData: any) => pokemonData.name);

      this.option = {
        legend: {
          data: pokemonNames,
          backgroundColor: '#222428',
          borderRadius: 10,
          itemStyle: {
            // color: color,
          },
          textStyle: {
            color: '#ffffff',
            fontStyle: 'oblique',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            fontSize: 14,
          },
        },
        radar: {
          indicator: [
            { name: 'Hp', max: 255, min: 0 },
            { name: 'Attack', max: 255, min: 0 },
            { name: 'Defense', max: 255, min: 0 },
            { name: 'Sp. Atk', max: 255, min: 0 },
            { name: 'Sp. Def', max: 255, min: 0 },
            { name: 'Speed', max: 255, min: 0 },
          ],
          center: ['50%', '50%'],
          axisName: {
            // formatter: '-{value}-',
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
            data: radarData,
            lineStyle: {
              type: 'solid',
            },
            symbol: 'none',
          },
        ],
      };

  // Comparación de estadísticas
  const highestStats: HighestStats = {
    Hp: { name: '', value: -1 },
    Attack: { name: '', value: -1 },
    Defense: { name: '', value: -1 },
    'Sp. Atk': { name: '', value: -1 },
    'Sp. Def': { name: '', value: -1 },
    Speed: { name: '', value: -1 },
  };

const tieStats: { [key: string]: string[] } = {};

radarData.forEach((pokemon: any) => {
  pokemon.value.forEach((value: number, index: number) => {
    const radarOptions = this.option.radar as { indicator: { name: string }[] };
    const statName = radarOptions.indicator[index].name;

    if (!highestStats[statName] || value > highestStats[statName].value) {
      highestStats[statName] = {
        name: pokemon.name,
        value: value,
      };
      // Borrar el registro de empate si se rompe
      delete tieStats[statName];
    } else if (value === highestStats[statName].value) {
      // Registrar empate
      if (!tieStats[statName]) {
        tieStats[statName] = [highestStats[statName].name];
      }
      tieStats[statName].push(pokemon.name);
    }
  });
});

// Luego, puedes recorrer el objeto tieStats para mostrar los empates
for (const stat in tieStats) {
  if (tieStats.hasOwnProperty(stat)) {
    this.compareEmpate.push(`Empate en ${stat}: ${tieStats[stat].join(', ')}`)
    console.log(`Empate en ${stat}: ${tieStats[stat].join(', ')}`);
    console.log('Pokémon con empate:', this.compareEmpate);
  }
}

  this.compareSatats.push(highestStats);
  // console.log('Pokémon con las estadísticas más altas:', this.compareSatats);

    }, (err) => {
      console.log('Error: ', err);
    });

  }


  getPokemonByName(pokemonName: string): Pokemon | undefined {
    return this.pokemon.find(poke => poke.name === pokemonName);
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
    this.getIdPokemon();
    this.loadPokemon();
  }
}
