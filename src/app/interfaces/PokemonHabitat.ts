export interface PokemonHabitat {
  id?:              number;
  name?:            string;
  names?:           Name[];
  pokemon_species?: PokemonSpecy[];
}

export interface Name {
  language?: PokemonSpecy;
  name?:     string;
}

export interface PokemonSpecy {
  name?: string;
  url?:  string;
}
