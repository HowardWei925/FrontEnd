import { createBrowserRouter } from "react-router";
import { TaskCreationPage } from "./pages/TaskCreationPage";
import { WorkflowPage } from "./pages/WorkflowPage";
import { CodeComparisonPage } from "./pages/CodeComparisonPage";
import { SemanticMappingPage } from "./pages/SemanticMappingPage";

export const router = createBrowserRouter([
  {
    path: "/",
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
]);