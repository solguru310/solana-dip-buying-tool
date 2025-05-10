import { JSX, useState, useEffect } from "react";

interface CustomInputFieldProps {
    type?: string;
    placeholder?: string;
    suffix?: string;
    prefix?: string;
    value?: string | number;
    disabled?: boolean;
    onChange?: (value: string) => void;
}

export default function CustomInputField({ onChange, placeholder = '', suffix = '', prefix = '', type = 'text', value = '', disabled = false }: CustomInputFieldProps): JSX.Element {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        onChange?.(e.target.value);
        setInputValue(e.target.value);
    };

    return (
        <div className="w-full p-1 text-gray-300">
            <div className="flex h-[34px] text-[14px]">
                {prefix && (
                    <div className="bg-[#fffff] text-[#a1a8b4] select-none cursor-default px-3 py-1 rounded-l-lg border border-white/10">
                        {prefix}
                    </div>
                )}

                <input
                    placeholder={placeholder}
                    type={type}
                    name="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    disabled={disabled}
                    className={`remove-arrow input w-full px-3 py-1  focus:outline-none transition-all duration-150 ease-in-out ${prefix ? '' : 'rounded-l-lg border border-white/10'} ${suffix ? '' : 'rounded-r-lg border-y border-r border-r-white/10 border-y-white/10'} ${disabled ? 'bg-gray-500' : 'bg-[#fffff]' }`}
                />

                {suffix && (
                    <div className="bg-[#fffff] text-[#a1a8b4] select-none cursor-default px-3 py-1 rounded-r-lg border-y border-r border-r-white/10 border-y-white/10">
                        {suffix}
                    </div>
                )}
            </div>
        </div>
    );
}