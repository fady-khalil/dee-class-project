import { CategoriesContextProvider } from "./General/CategoriesContext";
import { AssessmentProvider } from "./AssessmentContext";
import { LoginAuthProvider } from "./Authentication/LoginAuth";

const ContextProvider = ({ children }) => {
  return (
    <LoginAuthProvider>
      <CategoriesContextProvider>
        <AssessmentProvider>{children}</AssessmentProvider>
      </CategoriesContextProvider>
    </LoginAuthProvider>
  );
};

export default ContextProvider;
