import { ChangeEvent, FC } from "react"

interface TextAreaProps {
	required?: boolean
	type?: string
	autoComplete?: string
	value: string | number | readonly string[]
	onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
	placeholder?: string
	maxLength?: number
	className?: string
}

export const TextArea: FC<TextAreaProps> = ({ required = false, autoComplete = "off", value = "", onChange, placeholder, maxLength = 128, className }) => {
	return (
		<div className={`relative w-100 ${className}`}>
			<textarea required={required} autoComplete={autoComplete} value={value} onChange={onChange} rows={4} maxLength={maxLength}
				className="w-100 padd-md fs-md black family1 border-1px bold bg-white radius-md input-focus outline-none resize-none fast"
			/>
			<label className={`pe-none absolute left-md padd-xs family-1 fs-md black medium ${placeholder && "bg-white"} translateY-label fast`}>{placeholder}</label>
			<span className="pe-none absolute right-md bottom-0 padd-lr-xs family-1 fs-sm black bg-white translateY-span medium fast">
				{value.toString().length} / {maxLength}
			</span>
		</div>
	)
}