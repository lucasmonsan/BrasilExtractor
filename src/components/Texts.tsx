import { FC, ReactNode } from "react"

interface TextProps {
	children: ReactNode
	className?: string
	style?: Object
}

export const H1: FC<TextProps> = ({ children, className, style }) => {
	return <h1 className={`family-1 lh-lg ${className}`} style={style}>{children}</h1>
}

export const H2: FC<TextProps> = ({ children, className, style }) => {
	return <h2 className={`family-1 ${className}`} style={style}>{children}</h2>
}

export const P: FC<TextProps> = ({ children, className, style }) => {
	return <p className={`family-1 ${className}`} style={style}>{children}</p>
}
