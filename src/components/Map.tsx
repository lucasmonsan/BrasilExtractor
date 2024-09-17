import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import { buscarCidadeEReviews } from "../api/appwrite";  // Importe a função
import { H2, P } from "./Texts";
import "leaflet/dist/leaflet.css";

const MapCenter = ({ lat, lon }: { lat: number, lon: number }) => {
	const map = useMap();

	useEffect(() => {
		if (lat && lon) {
			const newZoom = (lat === 0 && lon === 0) ? 3 : 13;
			map.setView([lat, lon], newZoom);
		}
	}, [lat, lon, map]);
	return null;
};

export const Map = () => {
	const { lat, lon, cityId } = useContext(GlobalContext);
	const [cidade, setCidade] = useState<any>();
	const [reviews, setReviews] = useState<any[]>([]);

	useEffect(() => {
		if (lat !== 0 && lon !== 0) {
			if (cityId) { // Buscar o ID da cidade no IndexedDB com base nas coordenadas
				buscarCidadeEReviews(cityId).then(({ cidade, reviews }) => {
					setCidade(cidade);
					setReviews(reviews);
				});
			}
		}
	}, [lat, lon]);

	return (
		<MapContainer center={[lat, lon]} zoom={3} className="z-app h-100dvh">
			<TileLayer
				attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				detectRetina={true}
				tileSize={256}
			/>

			{(lat !== 0 && lon !== 0) ? cidade ? (
				<Marker position={[cidade.latitude, cidade.longitude]}>
					<Popup>
						{cidade.nome} - {reviews.length} reviews
					</Popup>
				</Marker>
			) : (
				<Marker position={[lat, lon]}>
					<Popup>
						<H2 className="center color-1" style={{ fontSize: "calc(var(--base) * 1.35)" }}>Essa cidade não tem reviews!</H2>
						<P className="center black" style={{ marginTop: "var(--xxs)" }}>Clique no botão + no canto inferior para adicionar a sua review.</P>
					</Popup>
				</Marker>
			) : null}

			<MapCenter lat={lat} lon={lon} />
		</MapContainer>
	);
};