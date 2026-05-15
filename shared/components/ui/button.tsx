import React from 'react';
import Link from 'next/link';

type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'outline-navy'
    | 'outline-blue'
    | 'ghost'
    | 'destructive'
    | 'link';

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type ButtonElement = 'button' | 'link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    as?: ButtonElement;
    href?: string;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    icon?: React.ReactNode;
    rounded?: boolean;
    iconOnly?: boolean;
    children?: React.ReactNode;
}

/**
 * Button component that can render as an HTML button or a Next.js Link.
 * Supports multiple variants, sizes, and states fitting the design system.
 */
export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
    ({
        className = '',
        variant = 'primary',
        size = 'md',
        as,
        href,
        isLoading = false,
        leftIcon,
        rightIcon,
        icon,
        rounded = false,
        iconOnly = false,
        children,
        disabled,
        type = 'button',
        ...props
    }, ref) => {
        const componentType = as || (variant === 'link' ? 'link' : 'button');
        const isDisabled = disabled || isLoading;

        const classes = [
            'btn',
            `btn-${variant}`,
            `btn-${size}`,
            (iconOnly || icon) ? (size === 'md' ? 'btn-icon-only' : `btn-icon-only-${size}`) : '',
            rounded ? 'btn-rounded' : '',
            className
        ].filter(Boolean).join(' ');

        const buttonIcon = icon || children;

        const content = (
            <>
                {isLoading && (
                    <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {!isLoading && (iconOnly || icon) ? (
                    <span className="flex items-center justify-center w-full h-full">{buttonIcon}</span>
                ) : (
                    <>
                        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                        {children}
                        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                    </>
                )}
            </>
        );

        if (componentType === 'link' && href) {
            // Filter out button-specific props for Link
            const linkProps = { ...props } as any;
            delete linkProps.onClick;
            delete linkProps.type;

            return (
                <Link
                    href={href}
                    className={classes}
                    {...linkProps}
                    ref={ref as any}
                >
                    {content}
                </Link>
            );
        }

        return (
            <button
                className={classes}
                disabled={isDisabled}
                type={type as any}
                ref={ref as any}
                {...(props as any)}
            >
                {content}
            </button>
        );
    }
);

Button.displayName = 'Button';
