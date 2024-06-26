import InputForm from '@/components/inputForm';

export default function Home() {
  return (
    <div className='font-sans grid grid-rows-[20px_1fr_20px] items-start justify-items-center min-h-screen pb-20 gap-6 sm:gap-16'>
      <main className='flex flex-col gap-6 sm:gap-16 row-start-2 items-center sm:items-start'>
        <h1 className='text-2xl sm:text-4xl text-primary font-black drop-shadow m-auto text-center px-4'>
          Négociez mieux avec votre client
        </h1>
        <InputForm />
        <p className='font-light text-center w-full p-4'>
          Les simulations sont faites avec un taux d&apos;imposition de 10% et
          en appliquant l&apos;ACRE
        </p>
      </main>
    </div>
  );
}
