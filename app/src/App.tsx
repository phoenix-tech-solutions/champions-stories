import { BrowserRouter, Route, Routes } from "react-router-dom";
import Story from "./pages/stories/Story.tsx";
import StoryHome from "./pages/stories/Home.tsx";
import Home from "./pages/Home.tsx";

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/story/:selectedStorySlug"
                        element={<Story />}
                    />
                    <Route path="/story" element={<StoryHome />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
