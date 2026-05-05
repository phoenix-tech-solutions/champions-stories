import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Story from "./pages/stories/Story.tsx";
import StoryHome from "./pages/stories/Home.tsx";
import Home from "./pages/Home.tsx";
import ElementSix from "./pages/ElementSix.tsx";

const AdminStories = lazy(() => import("./pages/admin/AdminStories.tsx"));

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
                    <Route path="/element-six" element={<ElementSix />} />
                    <Route
                        path="/admin"
                        element={
                            <Suspense
                                fallback={
                                    <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-500">
                                        ...
                                    </div>
                                }
                            >
                                <AdminStories />
                            </Suspense>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
