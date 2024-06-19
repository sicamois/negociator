'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { calculate } from '@/app/actions';
import { salariesFieldsInfos, autoEntrepreneurFieldsInfos } from '@/app/fields';

export default function InputForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [acre, setAcre] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>(new FormData());

  useEffect(() => {
    if (formRef.current) {
      for (const element of formRef.current.getElementsByTagName('input')) {
        if (element instanceof HTMLInputElement) {
          const value = formData.get(element.id);
          if (typeof value === 'string') {
            element.value = parseInt(value).toString();
          }
        }
      }
    }
  }, [formData]);

  function calculateAction(fieldname: string, withAcre = acre) {
    startTransition(async () => {
      if (formRef.current) {
        const newFormData = await calculate(
          new FormData(formRef.current),
          withAcre,
          fieldname
        );
        setFormData(newFormData);
      }
    });
  }

  return (
    <form
      ref={formRef}
      className='grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-20 px-4'
    >
      <div className='flex flex-col gap-4 sm:gap-8'>
        <h2 className='text-xl text-primary font-bold'>Employé</h2>
        <div className='flex flex-col gap-4'>
          {Object.entries(salariesFieldsInfos).map(([key, label]) => (
            <div key={key} className='h-10 grid grid-cols-2 gap-4 items-center'>
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                name={key}
                type='number'
                onBlur={() => calculateAction(key)}
                disabled={isPending}
                defaultValue={0}
              />
            </div>
          ))}
        </div>
      </div>
      <div className='flex flex-col gap-4 sm:gap-8'>
        <h2 className='text-xl text-primary font-bold'>Auto-entrepreneur</h2>
        <div className='flex flex-col gap-4'>
          {Object.entries(autoEntrepreneurFieldsInfos).map(([key, label]) => (
            <div key={key} className='h-10 grid grid-cols-2 gap-4 items-center'>
              <Label htmlFor={key}>{label}</Label>
              {key === 'acre' ? (
                <Switch
                  name={key}
                  disabled={isPending}
                  checked={acre}
                  onCheckedChange={(newState) => {
                    setAcre(newState);
                    calculateAction(key, newState);
                  }}
                />
              ) : (
                <Input
                  id={key}
                  name={key}
                  type='number'
                  onBlur={() => calculateAction(key)}
                  disabled={isPending}
                  defaultValue={0}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
