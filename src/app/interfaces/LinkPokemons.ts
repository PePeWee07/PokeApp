//Primera consulta traermos los 20 primeros pokemones
//'https://pokeapi.co/api/v2/pokemon?offset=0&limit=20'
export interface Option {
  count:    number;
  next:     string;
  previous: null;
  results:  Result[];
}

export interface Result {
  name: string;
  url:  string;
}


