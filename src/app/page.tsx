import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center py-14 justify-between">
      <div className="flex flex-col gap-4">
        <div className="z-10 w-full max-w-5xl items-center justify-center font-bold text-4xl text-center flex select-none">
          <h1 className="bg-gradient-to-r from-[#E7F1FF] to-[#9538FF] bg-clip-text text-transparent">
            Magic lights for your cards
          </h1>
        </div>
      </div>
      <div>
      </div>
    </main>
  );
}
