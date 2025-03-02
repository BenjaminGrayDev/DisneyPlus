
import Image from "next/image";
import Access from "../components/sections/access";


const Page = async () => {
  return (
    <>
            <main className="relative grid h-screen w-screen items-center">
              <div className="absolute -z-10 h-full w-full">
                <Image
                  src="/assets/images/aa.png"
                  alt="Disney Background"
                  fill
                  sizes="100vh"
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark to-transparent" />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark to-transparent" />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark to-transparent" />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark to-transparent" />
              </div>
              <Access />
            </main>
    </>
  );
};

export default Page;
