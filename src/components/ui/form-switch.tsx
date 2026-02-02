'use client';

import { UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { Switch } from './switch';

type BaseProps = {
  checked: boolean;
  disabled?: boolean;
};

type FormSwitchWithRegister<T extends FieldValues> = BaseProps & {
  name: Path<T>;
  register: UseFormRegister<T>;
  onCheckedChange?: never;
};

type FormSwitchWithOnChange = BaseProps & {
  name?: string;
  register?: never;
  onCheckedChange: (checked: boolean) => void;
};

type FormSwitchProps<T extends FieldValues = FieldValues> =
  | FormSwitchWithRegister<T>
  | FormSwitchWithOnChange;

export function FormSwitch<T extends FieldValues = FieldValues>(
  props: FormSwitchProps<T>
) {
  const { checked, disabled } = props;

  if ('register' in props && props.register) {
    const { onChange, onBlur, name, ref } = props.register(props.name);

    return (
      <Switch
        checked={checked}
        disabled={disabled}
        name={name}
        ref={ref}
        onBlur={onBlur}
        onCheckedChange={(checkedValue) => {
          onChange({
            target: {
              name,
              checked: checkedValue,
              type: 'checkbox',
            },
          } as any);
        }}
      />
    );
  }

  return (
    <Switch
      checked={checked}
      disabled={disabled}
      onCheckedChange={props.onCheckedChange}
    />
  );
}
