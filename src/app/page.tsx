import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center gap-2 font-bold text-4xl text-center flex">
        <h1>Magic lights for your <span className="bg-gradient-to-r from-red-400 to-blue-500 bg-clip-text text-transparent">cards</span></h1>
      </div>
    </main>
  );
}
