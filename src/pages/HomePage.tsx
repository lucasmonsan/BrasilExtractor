import { Main } from "../components/Containers";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Map } from "../components/Map";

export const HomePage = () => {
	return (
		<Main>
			<Header />
			<Map />
			<Footer />
		</Main>
	);
};
