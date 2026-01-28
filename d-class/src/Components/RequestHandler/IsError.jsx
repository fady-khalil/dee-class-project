import Container from "Components/Container/Container";
import { useTranslation } from "react-i18next";
import { ReactComponent as ErrorIcon } from "assests/undraw_fixing_bugs_w7gi.svg";

const IsError = ({ iswhite }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-x-4 h-[100vh] text-white">
      <Container>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-14 w-full h-full">
          <p
            className={`flex-1 font-roboto text-2xl font-medium text-center ${
              iswhite ? "text-white" : ""
            }`}
          >
            {t("general.error_message")}
            <br />
            {t("general.retry")}
          </p>

          <div className=" flex-1">
            <ErrorIcon className="flex-1 w-full h-full" />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default IsError;
