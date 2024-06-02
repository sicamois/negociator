import InputForm from '@/components/inputForm';

export const salariesFieldsInfos = {
  cout_employeur: 'Coût total employeur',
  salaire_brut: 'Salaire brut',
  salaire_net: 'Salaire net',
  salaire_net_apres_impot: 'Salaire net après impôt',
};

export const autoEntrepreneurFieldsInfos = {
  cout_prestation: 'Coût prestation',
  acre: 'Déduire ACRE ?',
  revenu_net: 'Revenu net',
  revenu_net_apres_impot: 'Revenu net après impôt',
};

export const salariesFields = Object.keys(salariesFieldsInfos);
export const autoEntrepreneurFields = Object.keys(autoEntrepreneurFieldsInfos);

export default function Home() {
  return (
    <div className='font-sans grid grid-rows-[20px_1fr_20px] items-start justify-items-center min-h-screen pb-20 gap-16'>
      <main className='flex flex-col gap-16 row-start-2 items-center sm:items-start'>
        <h1 className='text-4xl text-primary font-bold m-auto'>
          Négociez mieux avec votre client
        </h1>
        <InputForm />
      </main>
    </div>
  );
}
