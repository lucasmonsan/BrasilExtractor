import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState } from "react"

interface GlobalProps {
	children: ReactNode
}
interface GlobalContextType {
	lat: number
	setLat: Dispatch<SetStateAction<number>>
	lon: number
	setLon: Dispatch<SetStateAction<number>>
	cityId: number
	setCityId: Dispatch<SetStateAction<number>>
}
const defaultGlobalContext: GlobalContextType = {
	lat: 0,
	setLat: () => { },
	lon: 0,
	setLon: () => { },
	cityId: 0,
	setCityId: () => { },
}
export const GlobalContext = createContext<GlobalContextType>(defaultGlobalContext)

export const GlobalProvider: FC<GlobalProps> = ({ children }) => {
	const [lat, setLat] = useState(0)
	const [lon, setLon] = useState(0)
	const [cityId, setCityId] = useState(0)

	return <GlobalContext.Provider value={{ lat, setLat, lon, setLon, cityId, setCityId }}>{children}</GlobalContext.Provider>
}
export const useGlobal = () => {
	const context = useContext(GlobalContext)
	if (context === undefined) {
		throw new Error("useGlobal must be used within an GlobalProvider")
	}
	return context
}
