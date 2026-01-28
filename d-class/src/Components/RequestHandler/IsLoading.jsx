import Container from "Components/Container/Container";
import logi from "assests/logos/small-logo.png";
import bigLogo from "assests/logos/dclass.png";
const IsLoading = () => {
  return (
    <div className="relative overflow-hidden h-[80vh]   bg-black w-full">
      <Container className={"h-full"}>
        <div className="h-[80vh] flex items-center justify-center flex-col">
          <div className="flex items-center justify-center mb-6">
            <img src={bigLogo} alt="logo" className="w-[40%]" />
          </div>
          <div className="flex-col gap-4 w-full flex items-center justify-center ">
            <div className="w-28 h-28 border-[6px] text-4xl border-white flex items-center justify-center border-t-primary rounded-full animate-[spin_1.4s_linear_infinite]">
              <img
                src={logi}
                alt="Loading"
                className="w-6 h-6 animate-[ping_1.4s_linear_infinite]"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default IsLoading;
