import { Shuffle } from "lucide-react";

const Card = () => {
  return (
    <div>
      <div className="bg-[#1C1C1C] p-4 relative z-20 border border-[#3A3A3A] rounded-md">
        <h1 className="font-semibold z-20 text-lg text-white">Card example</h1>
        <div className="py-48 gap-4 flex flex-col px-8">
          <p className="font-medium text-sm text-[#9D9D9D]">
            You can create new colors examples
          </p>
          {/*TO DO LATER: CHANGE ALL FONTS TO INTER. USE RALEWAY FOR THE TITLES*/}
          <div className="flex justify-center">
            <button className="px-4 pt-2 group transition-colors hover:bg-[#3A3A3A] duration-300 ease-in-out pb-2 border-b-8 hover:border-[#2C2C2C] border-[#3A3A3A] flex flex-row gap-4 bg-[#2C2C2C] rounded-[4px]">
              <Shuffle
                strokeWidth={1}
                className="font-semibold 
            group-hover:bg-gradient-to-r group-hover:bg-clip-content group-hover:stroke-transparent transition-colors ease-in-out duration-300 
            group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-indigo-500
            group-hover:animate-text"
              />
              <span
                className="font-semibold 
            group-hover:bg-gradient-to-r group-hover:bg-clip-text  text-white group-hover:text-transparent transition-colors ease-in-out duration-300 
            group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-indigo-500
            group-hover:animate-text
            "
              >
                Random colors
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="w-full animate-text relative z-0 h-1 bg-gradient-to-r blur from-indigo-500 via-purple-500 to-red-500"></div>
    </div>
  );
};

export default Card;
