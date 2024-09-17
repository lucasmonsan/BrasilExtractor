import Dexie, { Table } from 'dexie';

interface RegiaoProps {
  id: number;
  sigla: string;
  nome: string;
}
interface MesorregiaoProps {
  id: number;
  nome: string;
}
interface UFProps extends RegiaoProps { }
interface MicrorregiaoProps extends MesorregiaoProps { }
interface RegiaoIntermediariaProps extends MesorregiaoProps { }
interface RegiaoImediataProps extends MesorregiaoProps { }
interface MunicipioProps {
  id: number;
  nome: string;
  microrregiao: MicrorregiaoProps;
  mesorregiao: MesorregiaoProps;
  UF: UFProps;
  regiao_imediata: RegiaoImediataProps;
  regiao_intermediaria: RegiaoIntermediariaProps;
  regiao: RegiaoProps;
  coordenadas: {
    lat: string;
    lon: string;
  }
}
export interface SearchResult {
  place_id: number;
  display_name: string;
  regiao_imediata: string;
  regiao_intermediaria: string;
  UF: string;
  lat: string;
  lon: string;
}

class MunicipiosDB extends Dexie {
  municipios!: Table<MunicipioProps>;

  constructor() {
    super('municipios-db');
    this.version(1).stores({
      municipios: 'id', // Índice para busca por ID do município
    });
  }
}

const db = new MunicipiosDB();
export { db };
export type { MunicipioProps };

const normalizarTexto = (texto: string): string => {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export async function salvarMunicipiosNoIndexedDB(municipios: MunicipioProps[]) {
  try {
    // Utiliza bulkAdd para adicionar múltiplos municípios
    await db.municipios.bulkAdd(municipios);
    console.log('Municípios salvos no IndexedDB com sucesso!', municipios);
  } catch (error) {
    console.error('Erro ao salvar municípios no IndexedDB:', error);
  }
}

export const buscarMunicipiosNoIndexedDB = async (query: string): Promise<SearchResult[]> => {
  try {
    const queryNormalizada = normalizarTexto(query);
    const municipios = await db.municipios.toArray();

    const converterParaSearchResult = (municipio: MunicipioProps): SearchResult => ({ // Função para converter MunicipioProps para SearchResult
      place_id: municipio.id,
      display_name: municipio.nome,
      lat: municipio.coordenadas.lat,
      lon: municipio.coordenadas.lon,
      regiao_imediata: municipio.regiao_imediata.nome,
      regiao_intermediaria: municipio.regiao_intermediaria.nome,
      UF: municipio.UF.sigla
    });

    const resultadosExatos = municipios.filter(municipio => normalizarTexto(municipio.nome).includes(queryNormalizada)).map(converterParaSearchResult); // Filtragem de resultados exatos

    const resultadosUnicos = new Map<number, SearchResult>(); // Combine os resultados exatos, mantendo apenas os exatos e ordenando por nome
    resultadosExatos.forEach(result => resultadosUnicos.set(result.place_id, result));

    const resultadosOrdenados = Array.from(resultadosUnicos.values()).sort((a, b) => a.display_name.localeCompare(b.display_name)); // Converta Map para Array e ordene por nome

    return resultadosOrdenados;
  } catch (error) {
    console.error("Erro ao buscar municípios no IndexedDB:", error);
    return [];
  }
};

export async function atualizarMunicipioNoIndexedDB(municipioAtualizado: MunicipioProps) {
  try {
    // Atualiza o município específico no IndexedDB
    await db.municipios.put(municipioAtualizado);
    console.log('Município atualizado com sucesso no IndexedDB!', municipioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar o município no IndexedDB:', error);
  }
}
