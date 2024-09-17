import { motion } from "framer-motion"
import { FC, ReactNode } from "react"

interface ContainerProps {
	children: ReactNode
	className?: string
}

export const Main: FC<ContainerProps> = ({ children, className }) => {
	return (
		<motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className={`relative flex ai-center jc-center h-100dvh ${className}`}>
			{children}
		</motion.main>
	)
}

export const Section: FC<ContainerProps> = ({ children, className }) => {
	return (
		<motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className={`flex ai-center jc-center w-100 ${className}`}>
			{children}
		</motion.section>
	)
}
