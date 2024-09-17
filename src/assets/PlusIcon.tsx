import { FC } from "react"

interface PlusIconProps {
	fill?: string
	className?: string
}

export const PlusIcon: FC<PlusIconProps> = ({ fill = "var(--color-1)", className }) => {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`h-100 ${className}`}>
			<path d="M6 12H18M12 6V18" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}
