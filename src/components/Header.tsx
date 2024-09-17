import { Button } from "./Button"
import { Logo } from "../assets/logo"
import { FormEvent, useContext, useEffect, useState } from "react";
import { atualizarMunicipioNoIndexedDB, buscarMunicipiosNoIndexedDB, db, MunicipioProps, SearchResult } from "../api/indexedDB";
import { GlobalContext } from "../contexts/GlobalContext";
import { Input } from "./Inputs";
import { SearchIcon } from "../assets/SearchIcon";
import { H2, P } from "./Texts";

export const Header = () => {
	const [currentCity, setCurrentCity] = useState("");
	const [typedCity, setTypedCity] = useState("");
	const [trigger, setTrigger] = useState(false);
	const [options, setOptions] = useState<SearchResult[]>([]);
	const { setLat, setLon, setCityId } = useContext(GlobalContext);

	const buscarCoordenadas = async (cityName: string): Promise<{ lat: string; lon: string } | null> => {
		try {
			const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`);
			const data = await response.json();
			if (data.length > 0) return { lat: data[0].lat, lon: data[0].lon };
			return null;
		} catch (error) {
			console.error("Erro ao buscar coordenadas:", error);
			return null;
		}
	};

	useEffect(() => {
		const modal = document.getElementById("ModalSearchResult");
		if (modal) {
			if (currentCity !== typedCity || currentCity === "") setTrigger(false);
			else setTrigger(true);
		}
	}, [trigger, currentCity]);

	useEffect(() => {
		const searchMunicipios = async () => {
			if (typedCity) {
				console.log("Pesquisando município:", typedCity);
				const municipios = await buscarMunicipiosNoIndexedDB(typedCity);
				setTrigger(true);
				console.log("Resultados encontrados:", municipios);
				setOptions(municipios);
			} else {
				setTrigger(true);
				setOptions([]);
			}
		};

		searchMunicipios();
	}, [typedCity]);

	const handleCityChoose = async (lat: string, lon: string, name: string, place_id: number) => { // Função modificada para buscar as coordenadas apenas quando o usuário selecionar a cidade
		setCityId(place_id)
		if (!lat || !lon) { // Verifica se já há coordenadas; se não, busca via API
			const coords = await buscarCoordenadas(name);
			if (coords) {
				setLat(parseFloat(coords.lat));
				setLon(parseFloat(coords.lon));

				const municipioCompleto = await db.municipios.get(place_id) as MunicipioProps; // Atualiza o IndexedDB com as coordenadas encontradas
				if (municipioCompleto) {
					const municipioAtualizado: MunicipioProps = {
						...municipioCompleto, coordenadas: {
							lat: coords.lat,
							lon: coords.lon
						}
					};
					await atualizarMunicipioNoIndexedDB(municipioAtualizado);
				}
			}
		} else { // Usa as coordenadas já armazenadas
			setLat(parseFloat(lat));
			setLon(parseFloat(lon));
		}

		setTrigger(false);
		setCurrentCity(name);
	};

	const handleSearch = async (e: FormEvent) => {
		e.preventDefault();
		setTypedCity(currentCity);
	};

	return (
		<header className={`z-header flex ai-center jc-center w-100 h-header padd-sm fixed top-0`}>
			<div className="flex ai-center jc-between gap-sm h-100 w-100" style={{ maxWidth: "1080px" }}>
				<Button className="flex ai-center h-xxxl padd-xs radius-md shadow">
					<Logo className="h-xxl" />
				</Button>

				<form onSubmit={handleSearch} className="relative flex ai-center jc-between gap-md w-100 bg-white shadow radius-md shadow">
					<Input type="search" placeholder="Digite o nome da cidade" className="w-100 padd-lr-md color-1" value={currentCity} onChange={(e) => setCurrentCity(e.target.value)} />

					<Button className="pointer w-xxxl h-xxxl bg-none" type="submit">
						<SearchIcon />
					</Button>

					<div id="ModalSearchResult" className={`hidden scroll-y absolute top-100 flex column gap-xs margin-t-xxs w-100 max-h-80dvh padd-lr-md bg-glass radius-md shadow fast ${trigger ? "padd-sm h-80dvh opacity-1" : "padd-0 h-0 opacity-0"}`} aria-hidden={!trigger}>
						{options.length > 0 ? (
							options.map((option, index) => (
								<div key={index} className="pointer flex column ai-start jc-center gap-xxxs padd-tb-xxxs color-1 item-option" onClick={() => handleCityChoose(option.lat, option.lon, option.display_name, option.place_id)}>
									<H2 className="color-1 fs-lg lh-md" style={{ fontSize: "calc(var(--lg) * 0.75)" }}>{option.display_name} - {option.place_id}</H2>
									<P className="fs-sm lh-md opacity-075">
										{option.regiao_imediata === option.regiao_intermediaria ? option.regiao_imediata : `${option.regiao_imediata} - ${option.regiao_intermediaria}`} - {option.UF}
									</P>
								</div>
							))
						) : (
							<h1 className="color-1">Nenhuma cidade encontrada</h1> //3122306
						)}
					</div>
				</form>
			</div>
		</header>
	)
}
