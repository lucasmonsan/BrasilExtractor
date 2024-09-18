import { AnimatePresence } from "framer-motion"
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"
import { HomePage } from "./pages/HomePage"
import { SplashPage } from "./pages/SplashPage"

function AppRouter() {
	const location = useLocation()

	return (
		<AnimatePresence mode="wait">
			<Routes location={location} key={location.pathname}>
				<Route path="*" element={<SplashRedirect />}>
					<Route index element={<HomePage />} />
				</Route>
				<Route path="splash" element={<SplashPage />} />
			</Routes>
		</AnimatePresence>
	)
}

export default AppRouter

/***/

const SplashRedirect = () => {
	const first = sessionStorage.getItem("first")

	if (!first) {
		return <Navigate to="/splash" />
	} else {
		return <Outlet />
	}
}