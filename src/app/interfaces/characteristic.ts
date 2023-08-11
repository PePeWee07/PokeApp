export interface PokemonCharacteristic {
  descriptions?:    Description[];
  gene_modulo?:     number;
  highest_stat?:    HighestStat;
  id?:              number;
  possible_values?: number[];
}

export interface Description {
  description?: string;
  language?:    HighestStat;
}

export interface HighestStat {
  name?: string;
  url?:  string;
}
