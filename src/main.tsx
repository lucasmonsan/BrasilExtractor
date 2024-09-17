import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { GlobalProvider } from "./contexts/GlobalContext.tsx"
import AppRouter from "./AppRouter.tsx"
import "./main.css"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<GlobalProvider>
			<BrowserRouter>
				<AppRouter />
			</BrowserRouter>
		</GlobalProvider>
	</StrictMode>,
)
