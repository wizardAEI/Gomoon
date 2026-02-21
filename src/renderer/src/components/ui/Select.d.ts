import { type Component, type JSXElement } from 'solid-js';
type OptionType = {
    value: string;
    label: JSXElement | string;
};
type SelectProps = {
    defaultValue: string;
    options: OptionType[];
    onSelect: (value: string) => void;
};
/**
 * @returns
 * @description defaultValue 默认值, options: {
    value: string
    label: JSXElement | string
  }
  onSelect: (value: string) => void
 */
declare const Select: Component<SelectProps>;
export default Select;
