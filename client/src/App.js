import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Error from "./components/Error";
import Home from "./components/Home";
import Wall from "./components/Wall";
import Visualizer from "./components/Visualizer";
import Signup from "./components/Signup";
import "./App.css";

export function App() {
	return (
		<>
			<Routes>
				<Route path="/" element={<Landing></Landing>}></Route>
				<Route path="/home" element={<Home></Home>}></Route>
				<Route path="/wall" element={<Wall></Wall>}></Route>
				<Route path="/signup" element={<Signup></Signup>}></Route>
				<Route path="/visualizer" element={<Visualizer></Visualizer>}></Route>
				<Route path="*" element={<Error></Error>}></Route>
			</Routes>
		</>
	);
}
