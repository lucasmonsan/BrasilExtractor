import { Button } from "./Button"
import { PlusIcon } from "../assets/PlusIcon"
import { useNavigate } from "react-router-dom";

export const Footer = () => {
	const navigate = useNavigate()

	return (
		<header className={`z-footer flex ai-center jc-center fixed bottom-lg right-lg`}>
			<Button className="flex ai-center padd-md radius-md shadow" onClick={() => navigate("/review")}>
				<PlusIcon className="h-xxxl" />
			</Button>
		</header>
	)
}
