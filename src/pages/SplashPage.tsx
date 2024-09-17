import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Main } from "../components/Containers";
import { Logo } from "../assets/logo";
import { H1 } from "../components/Texts";
import { MunicipioProps, salvarMunicipiosNoIndexedDB, db } from "../api/indexedDB";

export const SplashPage = () => {
	const navigate = useNavigate();

	const mapearMunicipio = (municipio: any): MunicipioProps => {
		return {
			id: municipio.id,
			nome: municipio.nome,
			microrregiao: {
				id: municipio.microrregiao.id,
				nome: municipio.microrregiao.nome,
			},
			mesorregiao: {
				id: municipio.microrregiao.mesorregiao.id,
				nome: municipio.microrregiao.mesorregiao.nome,
			},
			UF: {
				id: municipio.microrregiao.mesorregiao.UF.id,
				sigla: municipio.microrregiao.mesorregiao.UF.sigla,
				nome: municipio.microrregiao.mesorregiao.UF.nome,
			},
			regiao: {
				id: municipio.microrregiao.mesorregiao.UF.regiao.id,
				sigla: municipio.microrregiao.mesorregiao.UF.regiao.sigla,
				nome: municipio.microrregiao.mesorregiao.UF.regiao.nome,
			},
			regiao_imediata: {
				id: municipio["regiao-imediata"].id,
				nome: municipio["regiao-imediata"].nome,
			},
			regiao_intermediaria: {
				id: municipio["regiao-imediata"]["regiao-intermediaria"].id,
				nome: municipio["regiao-imediata"]["regiao-intermediaria"].nome,
			},
			coordenadas: {
				lat: "",
				lon: ""
			}
		};
	};

	const verificarMunicipiosSalvos = async (): Promise<boolean> => {
		const count = await db.municipios.count();
		return count > 0;  // Retorna true se houver dados
	};

	const getCitiesIBGE = async () => {
		const IBGE_BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";
		try {
			const response = await axios.get(IBGE_BASE_URL);

			if (response.status === 200 && response.data) {
				const municipiosMapeados = response.data.map(mapearMunicipio);

				await salvarMunicipiosNoIndexedDB(municipiosMapeados);
				setTimeout(() => navigate("/"), 1000); //Redireciona após 1 segundos (opcional)
			} else {
				console.error('Erro ao buscar municípios da API do IBGE.');
			}
		} catch (error) {
			console.error("Erro na busca:", error);
		}
	};

	useEffect(() => {
		document.title = "Kangaroo - Splash";
		const now = new Date();
		sessionStorage.setItem("first", now.toISOString());

		verificarMunicipiosSalvos().then((temDadosSalvos) => {// Verifica se já existem municípios salvos no IndexedDB
			if (!temDadosSalvos) getCitiesIBGE(); // Se não houver dados, faz a requisição à API
			else setTimeout(() => navigate("/"), 3000); //Redireciona após 3 segundos
		});
	}, []);

	return (
		<Main className="z-splash w-100 h-100dvh bg-white">
			<Logo className="h-xxxl" />
			<H1 className="color-1 fs-xl">Kangaroo!</H1>
		</Main>
	);
};
