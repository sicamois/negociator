'use server';

import { salariesFields, autoEntrepreneurFields } from '@/app/page';

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
      formData.set(
        key,
        value.toLocaleString(undefined, { maximumFractionDigits: 0 })
      );
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
  currentState: {
    message: string;
    formData: FormData;
  },
  formData: FormData
) {
  const fromInput = formData.get('from-input');

  if (
    typeof fromInput !== 'string' ||
    !fromInput ||
    (!salariesFields.includes(fromInput) &&
      !autoEntrepreneurFields.includes(fromInput))
  ) {
    return {
      message: 'Aucune valeur à calculer',
      formData: currentState.formData,
    };
  }

  const baseValue = parseInt((formData.get(fromInput) ?? '0').toString());
  const acre = formData.get('acre') === 'on';

  let salaireBrut = parseInt((formData.get('salaire_brut') ?? '0').toString());

  switch (fromInput) {
    case 'cout_employeur':
      salaireBrut = baseValue * 0.949;
      break;
    case 'salaire_brut':
      salaireBrut = baseValue;
      break;
    case 'salaire_net':
      salaireBrut = baseValue / 0.73;
      break;
    case 'salaire_net_apres_impot':
      salaireBrut = baseValue / 0.77;
      break;
    default:
      break;
  }

  const newFormData = new FormData();
  setFormDataValue(newFormData, 'cout_employeur', salaireBrut * 1.051);
  setFormDataValue(newFormData, 'salaire_brut', salaireBrut);
  setFormDataValue(newFormData, 'salaire_net', salaireBrut * 0.73);
  setFormDataValue(newFormData, 'salaire_net_apres_impot', salaireBrut * 0.77);

  let coutPrestation = parseInt(
    (formData.get('cout_prestation') ?? '0').toString()
  );

  if (coutPrestation === 0) {
    coutPrestation = salaireBrut;
  }

  const aideAcre = acre ? 0.106 : 0;
  setFormDataValue(newFormData, 'cout_prestation', coutPrestation);
  setFormDataValue(
    newFormData,
    'revenu_net',
    coutPrestation * (0.78656 + aideAcre)
  );
  setFormDataValue(
    newFormData,
    'revenu_net_apres_impot',
    coutPrestation * (0.76956 + aideAcre)
  );

  return {
    message: 'Calcul effectué',
    formData: newFormData,
  };
}
