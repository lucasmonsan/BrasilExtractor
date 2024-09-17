import { ChangeEvent, FC } from "react"

interface InputProps {
	type?: string
	placeholder?: string
	required?: boolean
	autoComplete?: string
	value: string | number | readonly string[]
	onChange: (event: ChangeEvent<HTMLInputElement>) => void
	className?: string
	maxLength?: number
}

export const Input: FC<InputProps> = ({ type = "basic", placeholder, value, onChange, className, required, autoComplete, maxLength }) => {
	return type === "search" ? (
		<label className={`pointer flex column`} style={{ minWidth: "calc(var(--base) * 10)" }}>
			<input required={required} className={`flex ai-center jc-center w-100 border-none bg-none outline-none family-1 fs-md ${className}`} placeholder={placeholder} value={value} onChange={onChange} />
		</label>
	) : (
		<div className={`relative w-100 ${className}`}>
			<input required={required} type={type} autoComplete={autoComplete} value={value} onChange={onChange} maxLength={maxLength}
				className="w-100 padd-md fs-md family-1 black border-1px bold bg-white radius-md input-focus outline-none fast"
			/>
			<label className={`pe-none absolute left-md padd-xs family-1 fs-md black medium ${placeholder && "bg-white"} translateY-label fast`}>{placeholder}</label>
			<span className="pe-none absolute right-md bottom-0 padd-xs family-1 fs-sm black bg-white translateY-span medium fast">
				{value.toString().length} / {maxLength}
			</span>
		</div>
	)
}
