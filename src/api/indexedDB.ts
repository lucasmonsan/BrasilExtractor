import Dexie from 'dexie';
import axios from 'axios';
import { BairroProps, CidadesProps, EstadoProps, PaisProps, RegiaoProps, RuaProps, RegiaoContinentalProps, ContinenteProps } from './interfaces';

class MonsanMundiDB extends Dexie {
  ruas!: Dexie.Table<RuaProps, number>;
  bairros!: Dexie.Table<BairroProps, number>;
  cidades!: Dexie.Table<CidadesProps, number>;
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
    const response = await axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/paises");
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
    console.log('Paises salvos com sucesso no IndexedDB');

    await db.regioes_continentais.bulkPut(regioesContinentaisMapeados, { allKeys: true });
    console.log('Regiões continentais salvas com sucesso no IndexedDB');

    await db.continentes.bulkPut(continentesMapeados, { allKeys: true });
    console.log('Continentes salvos com sucesso no IndexedDB');
  } catch (error) {
    console.error('Erro ao salvar países, regiões continentais ou continentes no IndexedDB', error);
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
        });
      }

      cidades.push({
        id: municipio.id,
        nome: municipio.nome,
        microrregiao: microrregiao.nome,
        mesorregiao: mesorregiao.nome,
        regiao_imediata: municipio.regiao_imediata?.nome || '',
        regiao_intermediaria: municipio.regiao_imediata?.regiao_intermediaria?.nome || '',
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

    // Usando bulkPut para garantir que não haverá duplicatas
    await db.regioes.bulkPut(regioes, { allKeys: true });
    console.log('Regiões salvas com sucesso no IndexedDB');

    await db.estados.bulkPut(estados, { allKeys: true });
    console.log('Estados salvos com sucesso no IndexedDB');

    await db.cidades.bulkPut(cidades, { allKeys: true });
    console.log('Cidades salvas com sucesso no IndexedDB');

    console.log("Dados salvos com sucesso no IndexedDB");
  } catch (error) {
    console.error("Erro ao salvar dados no IndexedDB:", error);
  }
};
