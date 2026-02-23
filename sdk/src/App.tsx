import { ChatProvider } from "./sdk/ChatProvider";
import ChatUI from "./sdk/ChatUI";

// TEST CASE 1: Project Joe (FREE PLAN)
const CONFIG_JOE = {
  apiUrl: "http://localhost:8080",
  apiKey: "pk_test_joe_123",
  projectId: "project_joe",
  userId: "joe_dev",
};

// TEST CASE 2: Project Sam (PRO PLAN)
const CONFIG_SAM = {
  apiUrl: "http://localhost:8080",
  apiKey: "pk_test_sam_456",
  projectId: "project_sam",
  userId: "sam_dev",
};

export default function App() {
  return (
    // Switch to CONFIG_SAM to see total data isolation
    <ChatProvider config={CONFIG_JOE}>
      <ChatUI />
    </ChatProvider>
  );
}
