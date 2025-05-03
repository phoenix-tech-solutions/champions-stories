import { BrowserRouter, Routes, Route } from "react-router-dom";
import Story from "./pages/stories/Story.tsx";
import Home from "./pages/Home.tsx";

function App() {
  return (<>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/story/:selectedStorySlug" element={<Story />} />
			</Routes>
		</BrowserRouter>
	</>)
}

export default App
