import { useEffect, useState } from 'react';
import db, { salvarCidadesEstadosRegioesNoIndexedDB, salvarPaisesRegioesContinentesNoIndexedDB } from '../api/indexedDB';
import { Main } from '../components/Containers';
import { H1, P } from '../components/Texts';
import axios from 'axios';

export const HomePage = () => {
	const [carregando, setCarregando] = useState<boolean>(false);
	const [erro, setErro] = useState<string | null>(null);
	const [contagens, setContagens] = useState({
		paises: 0,
		regioesContinentais: 0,
		continentes: 0,
		cidades: 0,
		estados: 0,
		regioes: 0,
	});

	const contarItens = async () => {
		const paisesCount = await db.paises.count();
		const regioesContinentaisCount = await db.regioes_continentais.count();
		const continentesCount = await db.continentes.count();
		const cidadesCount = await db.cidades.count();
		const estadosCount = await db.estados.count();
		const regioesCount = await db.regioes.count();

		setContagens({
			paises: paisesCount,
			regioesContinentais: regioesContinentaisCount,
			continentes: continentesCount,
			cidades: cidadesCount,
			estados: estadosCount,
			regioes: regioesCount,
		});
	};

	useEffect(() => {
		const salvarDadosNoIndexedDB = async () => {
			setCarregando(true);
			try {
				await salvarPaisesRegioesContinentesNoIndexedDB();
				await salvarCidadesEstadosRegioesNoIndexedDB();
				await contarItens();
			} catch (err) {
				console.error('Erro ao salvar dados no IndexedDB', err);
				setErro('Ocorreu um erro ao carregar os dados.');
			} finally {
				setCarregando(false);
			}
		};

		// Chama a função quando o componente é montado
		salvarDadosNoIndexedDB();
	}, []);

	return (
		<Main className='column gap-md'>
			<H1>Home Page</H1>
			{carregando ? (
				<P>Carregando dados...</P>
			) : erro ? (
				<P>{erro}</P>
			) : (
				<div>
					<P>Dados carregados com sucesso!</P>
					<P>Paises: {contagens.paises}</P>
					<P>Regiões Continentais: {contagens.regioesContinentais}</P>
					<P>Continentes: {contagens.continentes}</P>
					<P>Cidades: {contagens.cidades}</P>
					<P>Estados: {contagens.estados}</P>
					<P>Regiões: {contagens.regioes}</P>
				</div>
			)}
		</Main>
	);
};
