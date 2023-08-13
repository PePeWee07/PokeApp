export interface AbilitysPokemon {
  effect_changes?:      EffectChange[];
  effect_entries?:      AbilitysPokemonEffectEntry[];
  flavor_text_entries?: FlavorTextEntry[];
  generation?:          Generation;
  id?:                  number;
  is_main_series?:      boolean;
  name?:                string;
  names?:               Name[];
  pokemon?:             Pokemon[];
}

export interface EffectChange {
  effect_entries?: EffectChangeEffectEntry[];
  version_group?:  Generation;
}

export interface EffectChangeEffectEntry {
  effect?:   string;
  language?: Generation;
}

export interface Generation {
  name?: string;
  url?:  string;
}

export interface AbilitysPokemonEffectEntry {
  effect?:       string;
  language?:     Generation;
  short_effect?: string;
}

export interface FlavorTextEntry {
  flavor_text?:   string;
  language?:      Generation;
  version_group?: Generation;
}

export interface Name {
  language?: Generation;
  name?:     string;
}

export interface Pokemon {
  is_hidden?: boolean;
  pokemon?:   Generation;
  slot?:      number;
}
