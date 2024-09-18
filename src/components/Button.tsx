import { FC, MouseEvent, ReactNode } from "react"

interface ButtonProps {
	type?: "button" | "submit" | "reset"
	children: ReactNode
	className?: string
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void
	style?: Object
}

export const Button: FC<ButtonProps> = ({ type = "button", children, className, style, onClick }) => {
	return (
		<button type={type} className={`pointer flex ai-center jc-center padd-xs border-none ${className}`} style={style} onClick={onClick}>
			{children}
		</button>
	)
}
