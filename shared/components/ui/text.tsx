import React from 'react';

type TextVariant =
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'base' | 'sm' | 'xs' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
    | 'caption';

type TextIntent =
    | 'default' | 'primary' | 'secondary' | 'muted' | 'brand'
    | 'error' | 'success' | 'warning' | 'info' | 'inverse';

type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
    as?: React.ElementType;
    variant?: TextVariant;
    intent?: TextIntent;
    weight?: FontWeight;
    className?: string;
    children: React.ReactNode;
}

/**
 * Text component for consistent typography across the application.
 * Styles are derived from shared/styles/typography.css
 */
export const Text = ({
    as,
    variant = 'base',
    intent = 'default',
    weight,
    className = '',
    children,
    ...props
}: TextProps) => {
    // Map variants to semantic HTML tags for SEO
    const getTag = (v: TextVariant): React.ElementType => {
        const headingMap: Record<string, React.ElementType> = {
            h1: 'h1',
            h2: 'h2',
            h3: 'h3',
            h4: 'h4',
            h5: 'h5',
            h6: 'h6',
            base: 'p',
            lg: 'p',
            xl: 'p',
            '2xl': 'p',
            '3xl': 'p',
            '4xl': 'p',
            '5xl': 'p',
            sm: 'span',
            xs: 'span',
            caption: 'span',
        };
        return headingMap[v] || 'span';
    };

    const Component = as || getTag(variant);

    // Map internal variant names to CSS classes
    const getVariantClass = (v: TextVariant) => {
        const map: Record<string, string> = {
            h1: 'text-5xl',
            h2: 'text-4xl',
            h3: 'text-3xl',
            h4: 'text-2xl',
            h5: 'text-xl',
            h6: 'text-lg',
            caption: 'text-xs',
        };
        return map[v] || `text-${v}`;
    };

    const classes = [
        getVariantClass(variant),
        `text-${intent}`,
        weight ? `font-${weight}` : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <Component className={classes} {...props}>
            {children}
        </Component>
    );
};
