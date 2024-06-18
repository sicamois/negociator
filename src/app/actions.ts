'use server';

import { salariesFields, autoEntrepreneurFields } from '@/app/fields';

function setFormDataValue(
  formData: FormData,
  key: string,
  value: string | number | undefined
) {
  switch (typeof value) {
    case 'string':
      formData.set(key, value);
      break;
    case 'number':
      formData.set(key, value.toString());
      break;
    case 'undefined':
      break;
    default:
      throw new Error('Invalid value type');
  }
  if (value !== undefined) {
    formData.set(key, value.toString());
  }
}

export async function calculate(
  formData: FormData,
  withAcre: boolean,
  fromInput: string
) {
  console.log('withAcre', withAcre);
  if (
    !salariesFields.includes(fromInput) &&
    !autoEntrepreneurFields.includes(fromInput)
  ) {
    return formData;
  }

  const baseValue = parseInt((formData.get(fromInput) ?? '0').toString());

  let salaireBrut = parseInt((formData.get('salaire_brut') ?? '0').toString());

  switch (fromInput) {
    case 'cout_employeur':
      salaireBrut = baseValue / 1.18765;
      break;
    case 'salaire_brut':
      salaireBrut = baseValue;
      break;
    case 'salaire_net':
      salaireBrut = baseValue / 0.77577;
      break;
    case 'salaire_net_apres_impot':
      salaireBrut = baseValue / 0.76342;
      break;
    default:
      break;
  }

  const newFormData = new FormData();
  setFormDataValue(newFormData, 'cout_employeur', salaireBrut * 1.18765);
  setFormDataValue(newFormData, 'salaire_brut', salaireBrut);
  setFormDataValue(newFormData, 'salaire_net', salaireBrut * 0.77577);
  setFormDataValue(
    newFormData,
    'salaire_net_apres_impot',
    salaireBrut * 0.76342
  );

  let coutPrestation = parseInt(
    (formData.get('cout_prestation') ?? '0').toString()
  );

  if (coutPrestation === 0) {
    coutPrestation = salaireBrut;
  }

  const tauxAcre = withAcre ? 0.106 : 0;
  switch (fromInput) {
    case 'cout_prestation':
      coutPrestation = baseValue;
      break;
    case 'revenu_net':
      coutPrestation = baseValue / (0.78656 + tauxAcre);
      break;
    case 'revenu_net_apres_impot':
      coutPrestation = baseValue / (0.76956 + tauxAcre);
      break;
    default:
      break;
  }
  setFormDataValue(newFormData, 'cout_prestation', coutPrestation);
  setFormDataValue(
    newFormData,
    'revenu_net',
    coutPrestation * (0.78656 + tauxAcre)
  );
  setFormDataValue(
    newFormData,
    'revenu_net_apres_impot',
    coutPrestation * (0.76956 + tauxAcre)
  );

  return newFormData;
}
