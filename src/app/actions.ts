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

export async function calculate(
  formData: FormData,
  withAcre: boolean,
  fromInput: string
) {
  if (
    !salariesFields.includes(fromInput) &&
    !autoEntrepreneurFields.includes(fromInput)
  ) {
    return formData;
  }
  const engine = new Engine(rules);
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

  const value = parseInt((formData.get(fromInput) ?? '0').toString());
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
          parseInt((formData.get('cout_employeur') ?? '0').toString()) *
          12 *
          hourlyMultiplier,
      });
      break;
  }

  const newFormData = new FormData();
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
  const contratEngine = new Engine(rules);
  const autoentrepreneurSituation = {
    'entreprise . catégorie juridique': "'EI'",
    'entreprise . catégorie juridique . EI . auto-entrepreneur': 'oui',
    'entreprise . activités . service ou vente': "'service'",
    'entreprise . date de création': '01/07/2023',
    'dirigeant . exonérations . ACRE': withAcre ? 'oui' : 'non',
    'établissement . commune . département': "'Paris'",
    'entreprise . activité . nature': "'commerciale'",
    'dirigeant . auto-entrepreneur . impôt . versement libératoire': 'oui',
  };

  switch (fromInput) {
    case 'cout_prestation':
      contratEngine.setSituation({
        ...autoentrepreneurSituation,
        "dirigeant . auto-entrepreneur . chiffre d'affaires":
          value * hourlyMultiplier,
      });
      break;
    case 'revenu_net':
      contratEngine.setSituation({
        ...autoentrepreneurSituation,
        'dirigeant . auto-entrepreneur . revenu net': value * hourlyMultiplier,
      });
      break;
    case 'revenu_net_apres_impot':
      contratEngine.setSituation({
        ...autoentrepreneurSituation,
        'dirigeant . auto-entrepreneur . revenu net . après impôt':
          value * hourlyMultiplier,
      });
      break;
    default:
      if (parseInt((formData.get('cout_prestation') ?? '0').toString()) === 0) {
        contratEngine.setSituation({
          ...autoentrepreneurSituation,
          "dirigeant . auto-entrepreneur . chiffre d'affaires": engine.evaluate(
            'salarié . coût total employeur'
          ).nodeValue as number,
        });
      }
      break;
  }

  setFormDataValue(
    newFormData,
    'cout_prestation',
    (contratEngine.evaluate(
      "dirigeant . auto-entrepreneur . chiffre d'affaires"
    ).nodeValue as number) / hourlyMultiplier
  );
  setFormDataValue(
    newFormData,
    'revenu_net',
    (contratEngine.evaluate('dirigeant . auto-entrepreneur . revenu net')
      .nodeValue as number) / hourlyMultiplier
  );
  setFormDataValue(
    newFormData,
    'revenu_net_apres_impot',
    (contratEngine.evaluate(
      'dirigeant . auto-entrepreneur . revenu net . après impôt'
    ).nodeValue as number) / hourlyMultiplier
  );

  return newFormData;
}
