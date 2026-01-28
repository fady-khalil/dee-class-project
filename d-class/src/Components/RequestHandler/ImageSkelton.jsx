import "./Style.css";

const ImageSkelton = () => {
  return (
    <div className="relative overflow-hidden min-h-[200px] w-full h-full">
      <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
        <p className=" font-medium font-cairo">Image Is Loading...</p>
      </div>
      <div className="skelton-animation absolute  h-full  inset-0 "></div>
    </div>
  );
};

export default ImageSkelton;
