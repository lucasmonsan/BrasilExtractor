import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Main } from "../components/Containers";
import { Logo } from "../assets/logo";
import { H1 } from "../components/Texts";

export const SplashPage = () => {
	const navigate = useNavigate();

	useEffect(() => {
		document.title = "Kangaroo - Splash";
		const now = new Date();
		sessionStorage.setItem("first", now.toISOString());
		setTimeout(() => navigate("/"), 3000)
	}, []);

	return (
		<Main className="z-splash w-100 h-100dvh bg-white">
			<Logo className="h-xxxl" />
			<H1 className="color-1 fs-xl">Brasil Extractor!</H1>
		</Main>
	);
};
