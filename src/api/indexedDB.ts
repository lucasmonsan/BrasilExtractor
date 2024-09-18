import Dexie from 'dexie';
import axios from 'axios';
import { BairroProps, CidadesProps, ContinenteProps, DadosComparativos, DistritoProps, EstadoProps, NominatimAddress, PaisProps, RegiaoContinentalProps, RegiaoProps, RuaProps } from './interfaces';

class MonsanMundiDB extends Dexie {
  ruas!: Dexie.Table<RuaProps, number>;
  bairros!: Dexie.Table<BairroProps, number>;
  cidades!: Dexie.Table<CidadesProps, number>;
  distritos!: Dexie.Table<DistritoProps, number>;
  estados!: Dexie.Table<EstadoProps, number>;
  regioes!: Dexie.Table<RegiaoProps, number>;
  paises!: Dexie.Table<PaisProps, number>;
  regioes_continentais!: Dexie.Table<RegiaoContinentalProps, number>;
  continentes!: Dexie.Table<ContinenteProps, number>;

  constructor() {
    super('MonsanMundiDB');
    this.version(1).stores({
      ruas: 'id, nome, coordenada, cep',
      bairros: 'id, nome, coordenada, ruasIDs',
      cidades: 'id, nome, microrregiao, mesorregiao, regiao_imediata, regiao_intermediaria, coordenada, bairrosIDs',
      distritos: 'id, nome, microrregiao, mesorregiao, regiao_imediata, regiao_intermediaria, coordenada, municipioId, bairrosIDs',
      estados: 'id, sigla, nome, coordenada, cidadesIDs',
      regioes: 'id, sigla, nome, coordenada, estadosIDs',
      paises: 'id, nome, iso_alpha_2, iso_alpha_3, coordenada, regioesIDs',
      regioes_continentais: 'id, nome, paises, coordenada',
      continentes: 'id, nome, regioes_continentais, coordenada',
    });
  }
}

const db = new MonsanMundiDB();
export default db;

/***/

export const salvarPaisesRegioesContinentesNoIndexedDB = async () => {
  try {
    const response = await axios.get<PaisProps[]>('https://servicodados.ibge.gov.br/api/v1/localidades/paises');
    const paisesData = response.data;

    const paisesMapeados: PaisProps[] = paisesData.map((pais: any) => ({
      id: pais.id.M49,
      nome: pais.nome,
      iso_alpha_2: pais.id['ISO-ALPHA-2'],
      iso_alpha_3: pais.id['ISO-ALPHA-3'],
      coordenada: { lat: 0, lon: 0 }, // Ajustar caso tenha coordenadas
      regioesIDs: [] // Vamos preencher depois se necessário
    }));

    const regioesContinentaisMapeadosSet = new Map<number, RegiaoContinentalProps>();
    const continentesMapeadosSet = new Map<number, ContinenteProps>();

    paisesData.forEach((pais: any) => {
      const subRegiao = pais['sub-regiao'];
      const regiao = subRegiao?.regiao;

      if (subRegiao) {
        const subRegiaoId = subRegiao.id.M49;

        if (!regioesContinentaisMapeadosSet.has(subRegiaoId)) {
          regioesContinentaisMapeadosSet.set(subRegiaoId, {
            id: subRegiaoId,
            nome: subRegiao.nome,
            coordenada: { lat: 0, lon: 0 },
            paises: [pais.id.M49]
          });
        } else {
          regioesContinentaisMapeadosSet.get(subRegiaoId)?.paises.push(pais.id.M49);
        }

        if (regiao) {
          const regiaoId = regiao.id.M49;

          if (!continentesMapeadosSet.has(regiaoId)) {
            continentesMapeadosSet.set(regiaoId, {
              id: regiaoId,
              nome: regiao.nome,
              coordenada: { lat: 0, lon: 0 },
              regioes_continentais: [subRegiaoId]
            });
          } else {
            const continente = continentesMapeadosSet.get(regiaoId);
            if (continente && !continente.regioes_continentais.includes(subRegiaoId)) {
              continente.regioes_continentais.push(subRegiaoId);
            }
          }
        }
      }
    });

    const regioesContinentaisMapeados = Array.from(regioesContinentaisMapeadosSet.values());
    const continentesMapeados = Array.from(continentesMapeadosSet.values());

    // Usando bulkPut para garantir que não haverá duplicatas
    await db.paises.bulkPut(paisesMapeados, { allKeys: true });
    await db.regioes_continentais.bulkPut(regioesContinentaisMapeados, { allKeys: true });
    await db.continentes.bulkPut(continentesMapeados, { allKeys: true });

    return {
      paises: await db.paises.count(),
      regioesContinentais: await db.regioes_continentais.count(),
      continentes: await db.continentes.count()
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro na requisição do Axios:', error.message);
    } else {
      console.error('Erro ao salvar dados no IndexedDB:', error);
    }
    return { paises: 0, regioesContinentais: 0, continentes: 0 };
  }
};

export const salvarCidadesEstadosRegioesNoIndexedDB = async () => {
  try {
    const response = await axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/municipios");
    const municipios = response.data;

    const cidades: CidadesProps[] = [];
    const estados: EstadoProps[] = [];
    const regioes: RegiaoProps[] = [];

    municipios.forEach((municipio: any) => {
      const microrregiao = municipio.microrregiao;
      const mesorregiao = microrregiao.mesorregiao;
      const uf = mesorregiao.UF;

      const regiao = uf.regiao;

      if (regiao && !regioes.some(r => r.id === regiao.id)) {
        regioes.push({
          id: regiao.id,
          sigla: regiao.sigla,
          nome: regiao.nome,
          coordenada: { lat: 0, lon: 0 },
          estadosIDs: [],
        });
      }

      if (uf && !estados.some(e => e.id === uf.id)) {
        estados.push({
          id: uf.id,
          sigla: uf.sigla,
          nome: uf.nome,
          coordenada: { lat: 0, lon: 0 },
          cidadesIDs: [],
          distritosIDs: []
        });
      }

      cidades.push({
        id: municipio.id,
        nome: municipio.nome,
        microrregiao: microrregiao.nome,
        mesorregiao: mesorregiao.nome,
        regiao_imediata: municipio[`regiao-imediata`]?.nome || '',
        regiao_intermediaria: municipio[`regiao-imediata`]?.[`regiao-intermediaria`]?.nome || '',
        coordenada: { lat: 0, lon: 0 },
        bairrosIDs: [],
      });

      const estadoIndex = estados.findIndex(e => e.id === uf.id);
      if (estadoIndex !== -1) {
        estados[estadoIndex].cidadesIDs.push(municipio.id);
      }

      const regiaoIndex = regioes.findIndex(r => r.id === regiao.id);
      if (regiaoIndex !== -1) {
        if (!regioes[regiaoIndex].estadosIDs.includes(uf.id)) {
          regioes[regiaoIndex].estadosIDs.push(uf.id);
        }
      }
    });

    // Busca os distritos para associá-los aos estados
    const distritos = await db.distritos.toArray();

    // Cria um mapa para armazenar os distritos por estado
    const distritosPorEstado = new Map<number, number[]>();
    distritos.forEach((distrito) => {
      const estadoId = distritosPorEstado.get(distrito.municipioId) || [];
      distritosPorEstado.set(distrito.municipioId, [...estadoId, distrito.id]);
    });

    // Popula os arrays cidadesIDs e distritosIDs nos estados
    estados.forEach((estado) => {
      estado.cidadesIDs = cidades
        .filter((cidade) =>
          regioes.some(
            (regiao) =>
              // Corrigido: acessando 'regiao' através do 'municipio' (elemento do array 'municipios')
              regiao.id === municipios.find((m: { id: number; }) => m.id === cidade.id).microrregiao.mesorregiao.UF.regiao.id &&
              regiao.estadosIDs.includes(estado.id)
          )
        )
        .map((cidade) => cidade.id);
      estado.distritosIDs = estado.cidadesIDs.reduce((acc, cidadeId) => {
        const distritosDoMunicipio = distritosPorEstado.get(cidadeId) || [];
        return [...acc, ...distritosDoMunicipio];
      }, [] as number[]);
    });

    // Usando bulkPut para garantir que não haverá duplicatas
    await db.regioes.bulkPut(regioes, { allKeys: true });
    await db.estados.bulkPut(estados, { allKeys: true });
    await db.cidades.bulkPut(cidades, { allKeys: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro na requisição do Axios:', error.message);
    } else {
      console.error('Erro ao salvar dados no IndexedDB:', error);
    }
  }
};

export const salvarDistritosNoIndexedDB = async () => {
  try {
    const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/distritos');
    const distritosData = response.data;

    const distritosMapeados: DistritoProps[] = distritosData.map((distrito: any) => ({
      id: distrito.id,
      nome: distrito.nome,
      microrregiao: distrito.municipio.microrregiao.nome,
      mesorregiao: distrito.municipio.microrregiao.mesorregiao.nome,
      regiao_imediata: distrito.municipio['regiao-imediata']?.nome || '',
      regiao_intermediaria: distrito.municipio['regiao-imediata']?.['regiao-intermediaria']?.nome || '',
      coordenada: { lat: 0, lon: 0 }, // Ajustar caso tenha coordenadas
      municipioId: distrito.municipio.id,
      bairrosIDs: [], // Vamos preencher depois se necessário
    }));

    await db.distritos.bulkPut(distritosMapeados, { allKeys: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro na requisição do Axios:', error.message);
    } else {
      console.error('Erro ao salvar dados no IndexedDB:', error);
    }
  }
};

export const verificarNomesRepetidos = async (): Promise<{ distritosRedundantes: DadosComparativos[]; distritosNaoRedundantes: DadosComparativos[]; }> => {
  try {
    const cidades = await db.cidades.toArray();
    const distritos = await db.distritos.toArray();

    const distritosRedundantes: DadosComparativos[] = [];
    const distritosNaoRedundantes: DadosComparativos[] = [];

    distritos.forEach((distrito) => {
      const cidadeCorrespondente = cidades.find(
        (cidade) => cidade.nome === distrito.nome
      );

      if (cidadeCorrespondente) {
        // Verifica se TODOS os campos comparativos são iguais
        const saoRedundantes =
          cidadeCorrespondente.mesorregiao === distrito.mesorregiao &&
          cidadeCorrespondente.microrregiao === distrito.microrregiao &&
          cidadeCorrespondente.regiao_imediata === distrito.regiao_imediata &&
          cidadeCorrespondente.regiao_intermediaria ===
          distrito.regiao_intermediaria;

        // Adiciona o distrito ao array correspondente
        if (saoRedundantes) {
          distritosRedundantes.push({
            id: {
              municipioId: cidadeCorrespondente.id,
              distritoId: distrito.id,
            },
            mesorregiao: {
              municipio: cidadeCorrespondente.mesorregiao,
              distrito: distrito.mesorregiao,
            },
            microrregiao: {
              municipio: cidadeCorrespondente.microrregiao,
              distrito: distrito.microrregiao,
            },
            nome: distrito.nome,
            regiaoImediata: {
              municipio: cidadeCorrespondente.regiao_imediata,
              distrito: distrito.regiao_imediata,
            },
            regiaoIntermediaria: {
              municipio: cidadeCorrespondente.regiao_intermediaria,
              distrito: distrito.regiao_intermediaria,
            },
          });
        } else {
          distritosNaoRedundantes.push({
            id: {
              municipioId: cidadeCorrespondente.id,
              distritoId: distrito.id,
            },
            mesorregiao: {
              municipio: cidadeCorrespondente.mesorregiao,
              distrito: distrito.mesorregiao,
            },
            microrregiao: {
              municipio: cidadeCorrespondente.microrregiao,
              distrito: distrito.microrregiao,
            },
            nome: distrito.nome,
            regiaoImediata: {
              municipio: cidadeCorrespondente.regiao_imediata,
              distrito: distrito.regiao_imediata,
            },
            regiaoIntermediaria: {
              municipio: cidadeCorrespondente.regiao_intermediaria,
              distrito: distrito.regiao_intermediaria,
            },
          });
        }
      }
    });

    return { distritosRedundantes, distritosNaoRedundantes };
  } catch (error) {
    console.error('Erro ao verificar nomes repetidos:', error);
    return { distritosRedundantes: [], distritosNaoRedundantes: [] };
  }
};

export const apagarDistritosRedundantes = async (): Promise<void> => {
  try {
    const { distritosRedundantes } = await verificarNomesRepetidos();
    const distritosRedundantesIds = distritosRedundantes.map((distrito) => distrito.id.distritoId);
    await db.distritos.bulkDelete(distritosRedundantesIds);
  } catch (error) {
    console.error('Erro ao apagar distritos redundantes:', error);
  }
};

const obterCoordenadasDoPais = async (
  codigoPais: string
): Promise<{ lat: number; lon: number } | null> => {
  try {
    const response = await axios.get<NominatimAddress[]>(`https://nominatim.openstreetmap.org/search?country=${codigoPais}&format=json&limit=1`);

    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    } else {
      return null; // País não encontrado
    }
  } catch (error) {
    console.error(
      `Erro ao obter coordenadas do país ${codigoPais}:`,
      error
    );
    return null;
  }
};

const PAUSA_ENTRE_REQUISICOES = 1500;

export const popularCoordenadasDosPaises = async (): Promise<void> => {
  try {
    const paises = await db.paises.toArray();
    const filaDeRequisicoes: string[] = [];

    // Adiciona os países à fila
    paises.forEach((pais) => filaDeRequisicoes.push(pais.iso_alpha_2));

    const processarFila = async () => {
      while (filaDeRequisicoes.length > 0) {
        const codigoPais = filaDeRequisicoes.shift();
        if (codigoPais) {
          const coordenadas = await obterCoordenadasDoPais(codigoPais);

          if (coordenadas) {
            const pais = paises.find((p) => p.iso_alpha_2 === codigoPais); // Busca o país pelo código
            if (pais) {
              await db.paises.update(pais.id, { coordenada: coordenadas });
              console.log(`Coordenadas do país ${pais.nome} atualizadas:`, coordenadas);
            }
          } else {
            console.warn(`País com código ${codigoPais} não encontrado no Nominatim.`);
          }

          // Aguarda 1 segundo antes da próxima requisição
          await new Promise((resolve) => setTimeout(resolve, PAUSA_ENTRE_REQUISICOES));
        }
      }

      console.log('Coordenadas dos países populadas no IndexedDB com sucesso.');
    };

    processarFila(); // Inicia o processamento da fila
  } catch (error) {
    console.error('Erro ao popular coordenadas dos países no IndexedDB:', error);
  }
};