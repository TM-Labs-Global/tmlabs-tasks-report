import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    hasError?: boolean;
    hasSuccess?: boolean;
    containerClassName?: string;
}

/**
 * Input component for consistent form fields across the application.
 * Styles are derived from shared/styles/input.css
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, icon, rightIcon, hasError, hasSuccess, className = '', containerClassName = '', id, ...props }, ref) => {
        const inputClasses = [
            'input',
            hasError ? 'input-error' : '',
            hasSuccess ? 'input-success' : '',
            icon ? 'input-has-icon' : '',
            rightIcon ? 'input-has-icon-right' : '',
            className
        ].filter(Boolean).join(' ');

        const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

        const inputElement = (
            <input
                ref={ref}
                id={inputId}
                className={inputClasses}
                {...props}
            />
        );

        return (
            <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
                {label && (
                    <label htmlFor={inputId} className="label">
                        {label}
                    </label>
                )}

                {(icon || rightIcon) ? (
                    <div className="input-wrapper">
                        {icon && (
                            <div className="input-icon">
                                {icon}
                            </div>
                        )}
                        {inputElement}
                        {rightIcon && (
                            <div className="input-icon-right">
                                {rightIcon}
                            </div>
                        )}
                    </div>
                ) : (
                    inputElement
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
