import { createBrowserRouter } from "react-router";
import { TaskCreationPage } from "./pages/TaskCreationPage";
import { WorkflowPage } from "./pages/WorkflowPage";
import { CodeComparisonPage } from "./pages/CodeComparisonPage";
import { SemanticMappingPage } from "./pages/SemanticMappingPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/task-creation",
        Component: TaskCreationPage,
      },
      {
        path: "/workflow",
        Component: WorkflowPage,
      },
      {
        path: "/comparison",
        Component: CodeComparisonPage,
      },
      {
        path: "/semantic-mapping",
        Component: SemanticMappingPage,
      },
      {
        path: "/history",
        Component: HistoryPage,
      },
    ],
  },
]);
