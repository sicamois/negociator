'use server';

import { salariesFields, autoEntrepreneurFields } from '@/app/fields';
import Engine from 'publicodes';
import rules from 'modele-social';

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

function getFormDataValue(formData: FormData, key: string) {
  return parseInt((formData.get(key) ?? '0').toString());
}

export async function calculate(formData: FormData, fromInput: string) {
  if (
    !salariesFields.includes(fromInput) &&
    !autoEntrepreneurFields.includes(fromInput)
  ) {
    return formData;
  }

  const newFormData = new FormData();

  const engine = new Engine(rules, {
    logger: { log: (_) => {}, warn: (_) => {}, error: console.error },
  });
  const baseSituation: Record<string, any> = {
    'salarié . contrat': "'CDD'",
    'salarié . contrat . CDD . durée': 1,
    'salarié . contrat . CDD . congés pris': '0 jours ouvrés',
    'salarié . contrat . CDD . motif': "'classique . usage'",
    'salarié . convention collective': "'HCR'",
    'salarié . rémunération . avantages en nature': 'oui',
    'salarié . rémunération . avantages en nature . ntic': 'non',
    'salarié . rémunération . avantages en nature . nourriture': 'oui',
    'salarié . rémunération . avantages en nature . nourriture . repas par mois':
      '21 repas/mois',
    'établissement . commune . code postal': "'75008'",
    'établissement . taux ATMP . taux collectif': '2.21%',
    'impôt . méthode de calcul': "'taux personnalisé'",
    'impôt . taux personnalisé': 10,
    dirigeant: 'non',
  };

  const value = getFormDataValue(formData, fromInput);
  const hourlyMultiplier =
    value < 100
      ? (engine.evaluate('salarié . contrat . temps de travail')
          .nodeValue as number)
      : 1;

  switch (fromInput) {
    case 'cout_employeur':
      engine.setSituation({
        ...baseSituation,
        'salarié . coût total employeur': value * 12 * hourlyMultiplier,
      });
      break;
    case 'salaire_brut':
      engine.setSituation({
        ...baseSituation,
        'salarié . contrat . salaire brut': value * hourlyMultiplier,
      });
      break;
    case 'salaire_net':
      engine.setSituation({
        ...baseSituation,
        'salarié . rémunération . net . à payer avant impôt':
          value * hourlyMultiplier,
      });
      break;
    case 'salaire_net_apres_impot':
      engine.setSituation({
        ...baseSituation,
        'salarié . rémunération . net . payé après impôt':
          value * hourlyMultiplier,
      });
      break;
    default:
      engine.setSituation({
        ...baseSituation,
        'salarié . coût total employeur':
          getFormDataValue(formData, 'cout_employeur') * 12 * hourlyMultiplier,
      });
      break;
  }
  setFormDataValue(
    newFormData,
    'cout_employeur',
    (engine.evaluate('salarié . coût total employeur').nodeValue as number) /
      hourlyMultiplier
  );
  setFormDataValue(
    newFormData,
    'salaire_brut',
    (engine.evaluate('salarié . contrat . salaire brut').nodeValue as number) /
      hourlyMultiplier
  );
  setFormDataValue(
    newFormData,
    'salaire_net',
    (engine.evaluate('salarié . rémunération . net . à payer avant impôt')
      .nodeValue as number) / hourlyMultiplier
  );
  setFormDataValue(
    newFormData,
    'salaire_net_apres_impot',
    (engine.evaluate('salarié . rémunération . net . payé après impôt')
      .nodeValue as number) / hourlyMultiplier
  );

  // Auto-entrepreneur
  const autoentrepreneurSituation = {
    'entreprise . catégorie juridique': "'EI'",
    'entreprise . catégorie juridique . EI . auto-entrepreneur': 'oui',
    'entreprise . activités . service ou vente': "'service'",
    'entreprise . date de création': '01/07/2023',
    'dirigeant . exonérations . ACRE': "'oui'",
    'établissement . commune . département': "'Paris'",
    'entreprise . activité . nature': "'commerciale'",
    'dirigeant . auto-entrepreneur . impôt . versement libératoire': 'oui',
  };

  switch (fromInput) {
    case 'cout_prestation':
      engine.setSituation({
        ...autoentrepreneurSituation,
        "dirigeant . auto-entrepreneur . chiffre d'affaires":
          value * hourlyMultiplier,
      });
      break;
    case 'revenu_net':
      engine.setSituation({
        ...autoentrepreneurSituation,
        'dirigeant . auto-entrepreneur . revenu net': value * hourlyMultiplier,
      });
      break;
    case 'revenu_net_apres_impot':
      engine.setSituation({
        ...autoentrepreneurSituation,
        'dirigeant . auto-entrepreneur . revenu net . après impôt':
          value * hourlyMultiplier,
      });
      break;
    default:
      engine.setSituation({
        ...autoentrepreneurSituation,
        "dirigeant . auto-entrepreneur . chiffre d'affaires":
          getFormDataValue(formData, 'cout_prestation') > 0
            ? getFormDataValue(formData, 'cout_prestation') * hourlyMultiplier
            : (engine.evaluate('salarié . coût total employeur')
                .nodeValue as number),
      });
      break;
  }

  setFormDataValue(
    newFormData,
    'cout_prestation',
    (engine.evaluate("dirigeant . auto-entrepreneur . chiffre d'affaires")
      .nodeValue as number) / hourlyMultiplier
  );
  setFormDataValue(
    newFormData,
    'revenu_net',
    (engine.evaluate('dirigeant . auto-entrepreneur . revenu net')
      .nodeValue as number) / hourlyMultiplier
  );
  setFormDataValue(
    newFormData,
    'revenu_net_apres_impot',
    (engine.evaluate('dirigeant . auto-entrepreneur . revenu net . après impôt')
      .nodeValue as number) / hourlyMultiplier
  );

  return newFormData;
}
