interface CoordenadaProps {
  lat: number;
  lon: number;
}
interface RuaProps {
  id: number;
  nome: string;
  cep: number[];
  coordenada: CoordenadaProps;
}
interface BairroProps {
  id: number;
  nome: string;
  coordenada: CoordenadaProps;
  ruasIDs: number[];
}
interface CidadesProps {
  id: number;
  nome: string;
  microrregiao: string;
  mesorregiao: string;
  regiao_imediata: string;
  regiao_intermediaria: string;
  coordenada: CoordenadaProps;
  bairrosIDs: number[];
}
interface EstadoProps {
  id: number;
  sigla: string;
  nome: string;
  coordenada: CoordenadaProps;
  cidadesIDs: number[];
}
interface RegiaoProps {
  id: number;
  sigla: string;
  nome: string;
  coordenada: CoordenadaProps;
  estadosIDs: number[];
}
interface PaisProps {
  id: number; //são os mesmos números do M49
  nome: string;
  coordenada: CoordenadaProps;
  iso_alpha_2: string;
  iso_alpha_3: string;
  regioesIDs: number[];
}
interface RegiaoContinentalProps {
  id: number; //são os mesmos números do M49
  nome: string;
  paises: number[];
  coordenada: CoordenadaProps;
}
interface ContinenteProps {
  id: number; //são os mesmos números do M49
  nome: string;
  coordenada: CoordenadaProps;
  regioes_continentais: number[];
}

export type { RuaProps, BairroProps, CidadesProps, EstadoProps, RegiaoProps, PaisProps, RegiaoContinentalProps, ContinenteProps }