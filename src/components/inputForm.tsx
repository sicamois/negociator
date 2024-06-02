'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { calculate } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import { salariesFieldsInfos, autoEntrepreneurFieldsInfos } from '@/app/page';

const initialState = {
  message: '',
  formData: new FormData(),
};

export default function InputForm() {
  const [formState, calculateAction] = useActionState(calculate, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      formData.set('from-input', event.target.name);
      calculateAction(formData);
    }
  }

  useEffect(() => {
    if (formRef.current) {
      for (const element of formRef.current.getElementsByTagName('input')) {
        if (element instanceof HTMLInputElement) {
          const value = formState.formData.get(element.id);
          if (typeof value === 'string') {
            element.value = value;
          }
        }
      }
    }
  }, [formState]);

  return (
    <form ref={formRef}>
      <div className='grid grid-cols-2 gap-20'>
        <div className='flex flex-col gap-8'>
          <h2 className='text-xl text-primary font-bold'>Employé</h2>
          <div className='grid grid-cols-2 gap-4 items-center'>
            {Object.entries(salariesFieldsInfos).map(([key, label]) => (
              <>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  name={key}
                  type='number'
                  onChangeCapture={handleInputChange}
                  disabled={pending}
                  defaultValue={0}
                />
              </>
            ))}
          </div>
        </div>
        <div className='flex flex-col gap-8'>
          <h2 className='text-xl text-primary font-bold'>Auto-entrepreneur</h2>
          <div className='grid grid-cols-2 grid-rows-4 gap-4 items-center'>
            {Object.entries(autoEntrepreneurFieldsInfos).map(([key, label]) => (
              <>
                <Label htmlFor={key}>{label}</Label>
                {key === 'acre' ? (
                  <Switch
                    id={key}
                    name={key}
                    disabled={pending}
                    checked={true}
                  />
                ) : (
                  <Input
                    id={key}
                    name={key}
                    type='number'
                    onChange={handleInputChange}
                    disabled={pending}
                    defaultValue={0}
                  />
                )}
              </>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
