import { useState } from "react";
import { Main } from "../components/Containers";
import { Input } from "../components/Inputs";
import { H1, H2 } from "../components/Texts";
import { TextArea } from "../components/Textarea";
import { Button } from "../components/Button";

export const ReviewFormPage = () => {
	const [titulo, setTitulo] = useState("")
	const [descricao, setDescricao] = useState("")

	return (
		<Main className="column padd-md gap-md">
			<H1 className="color-1">Nova Review</H1>

			<form action="" className="flex column gap-md w-100 max-w-640px">
				<Input value={titulo} onChange={e => setTitulo(e.target.value)} required={true} placeholder="Título" maxLength={128} className="margin-t-md" />
				<TextArea value={descricao} onChange={e => setDescricao(e.target.value)} required={true} placeholder="Descrição" maxLength={640} />
				<Button className="bg-color-1 radius-md">
					<H2 className="padd-xxs fs-lg color-white">Criar review</H2>
				</Button>
			</form>
		</Main>
	);
};
