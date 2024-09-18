import { useEffect, useState } from 'react';
import db, { apagarDistritosRedundantes, popularCoordenadasDosPaises, salvarCidadesEstadosRegioesNoIndexedDB, salvarDistritosNoIndexedDB, salvarPaisesRegioesContinentesNoIndexedDB } from '../api/indexedDB';
import { Main } from '../components/Containers';
import { H1, H2, P } from '../components/Texts';
import { Button } from '../components/Button';

export const HomePage = () => {
	const [carregando, setCarregando] = useState<boolean>(false);
	const [erro, setErro] = useState<string | null>(null);
	const [contagens, setContagens] = useState({
		paises: 0,
		regioesContinentais: 0,
		continentes: 0,
		cidades: 0,
		distritos: 0,
		estados: 0,
		regioes: 0,
	});

	const contarItens = async () => {
		const paisesCount = await db.paises.count();
		const regioesContinentaisCount = await db.regioes_continentais.count();
		const continentesCount = await db.continentes.count();
		const cidadesCount = await db.cidades.count();
		const distritosCount = await db.distritos.count();
		const estadosCount = await db.estados.count();
		const regioesCount = await db.regioes.count();

		setContagens({
			paises: paisesCount,
			regioesContinentais: regioesContinentaisCount,
			continentes: continentesCount,
			cidades: cidadesCount,
			distritos: distritosCount,
			estados: estadosCount,
			regioes: regioesCount,
		});
		return contagens
	}

	const salvarDadosNoIndexedDB = async () => {
		setCarregando(true);
		try {
			const initialContagens = await contarItens();
			console.log("Contagem finalizada:", initialContagens)

			if (initialContagens.paises < 175 && initialContagens.regioesContinentais < 12 && initialContagens.continentes < 4) {
				const novasContagens = await salvarPaisesRegioesContinentesNoIndexedDB();
				setContagens({ ...initialContagens, ...novasContagens });
				console.log("Países, Regiões continentais e Comtinentes")
			}
			if (initialContagens.cidades < 5500 && initialContagens.estados < 24 && initialContagens.regioes < 4) await salvarCidadesEstadosRegioesNoIndexedDB();
			console.log("Cidades, Estados e Regiões do Brasil")
			if (initialContagens.distritos < 5400) await salvarDistritosNoIndexedDB();
			console.log("Distritos sem tratamento")
			if (initialContagens.distritos > 10000) await apagarDistritosRedundantes()
			console.log("Distritos sem os repetidos")
			await popularCoordenadasDosPaises();
			console.log("Coordenadas dos Países")
		} catch (err) {
			console.error('Erro ao salvar dados no IndexedDB', err);
			setErro('Ocorreu um erro ao carregar os dados.');
		} finally {
			setCarregando(false);
		}
	};

	const handleStart = () => salvarDadosNoIndexedDB()

	return (
		<Main className='column gap-md'>
			<H1 className='fs-xxxl'>Home Page</H1>
			{carregando === false ? (
				<Button onClick={() => handleStart()} className='padd-lr-xxxl bg-color-1 radius-md'>
					<H2 className='color-white'>Começar</H2>
				</Button>
			) : carregando ? (
				<P>Carregando dados...</P>
			) : erro ? (
				<P>{erro}</P>
			) : (
				<div className='flex column ai-center jc-center gap-md w-100'>
					<div className='flex column ai-center jc-center w-100'>
						<H2>Dados mundiais!</H2>
						<P>Continentes: {contagens.continentes}</P>
						<P>Regiões Continentais: {contagens.regioesContinentais}</P>
						<P>Paises: {contagens.paises}</P>
					</div>

					<div className='flex column ai-center jc-center w-100'>
						<H2>Dados do Brasil!</H2>
						<P>Cidades: {contagens.cidades}</P>
						<P>Distritos: {contagens.distritos}</P>
						<P>Estados: {contagens.estados}</P>
						<P>Regiões: {contagens.regioes}</P>
					</div>
				</div>
			)}
		</Main>
	);
};
