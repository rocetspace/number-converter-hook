import { useMemo, useCallback } from 'react';

export interface Options {
    /**
     * Level of exactness in a number's digits.
     * E.g. 10,10 - precision equal 2 (two decimal digits after decimal separator).
     */
    precision?: number;
    /**
     * Groups separator. By default is space (' ').
     * E.g. 100 000 000
     *         ^   ^
     */
    groupSeparator?: string;
    /**
     * Decimal separator. By default is comma (',').
     * E.g. 100,99
     *         ^
     */
    decimalSeparator?: string;
}

export interface Methods {
    /**
     * Converts number value to string.
     */
    toString(value: number): string;
    /**
     * Converts string value to number.
     */
    toNumber(value: string): number;
}

const NEGATIVE_SIGN = '-';
const DOT_SIGN = '.';

const defaultOptions: Options = {
    precision: 2,
    groupSeparator: ' ',
    decimalSeparator: ',',
};

export const useConverter = (options: Options): Methods => {
    const {
        precision,
        groupSeparator,
        decimalSeparator,
    } = { ...defaultOptions, ...options };

    const groupSeparatorRegex = useMemo(() => {
        return new RegExp(`\\${groupSeparator}`, 'g');
    }, [groupSeparator]);

    /**
     * Anatomy of regular expression:
     * new RegExp(`([-]?)([0-9]*)([${decimalSeparator}]?)([0-9]*)`);
     *             ^^^^^ ^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^
     *               1      2               3               4
     *
     * 1. ([-]?)                   - search negative sign.
     * 2. ([0-9]*)                 - search queue of digits (integer part).
     * 3. ([${decimalSeparator}]?) - search decimal separator.
     * 4. ([0-9]*)                 - search queue of digits (fraction part).
     */
    const extractionRegex = useMemo(() => {
        return new RegExp(`([-]?)([0-9]*)([${decimalSeparator}]?)([0-9]*)`);
    }, [decimalSeparator]);

    /**
     * Callback for setting group separator.
     * 
     * @example
     * setGroupsSeparator('123') // 123
     * setGroupsSeparator('123456') // 123 456
     * setGroupsSeparator('1234567') // 1 234 567
     */
    const setGroupSeparators = useCallback((value: string) => {
        const enhanced = value
            .split('').reverse().join('')
            .replace(/([0-9]{3})/g, `$1${groupSeparator}`)
            .split('').reverse().join('');

        return enhanced.startsWith(groupSeparator) ? enhanced.slice(1) : enhanced;
    }, [groupSeparator]);

    /* ---------------------------------------------------------------------- */
    /* ------------------------------To string------------------------------- */
    /* ---------------------------------------------------------------------- */
    const toString = useCallback((value: number) => {
        let valueAsString = String(value).replace(DOT_SIGN, decimalSeparator);

        // Handle negative zero case.
        // Compare zero with Number.NEGATIVE_INFINITY.
        // Because even strict equal gets false positive result: (0 === -0) returns true.
        if (value === 0) {
            const isNegativeZero = 1 / value === Number.NEGATIVE_INFINITY;
            const negativeSign = isNegativeZero ? NEGATIVE_SIGN : '';

            valueAsString = `${negativeSign}${valueAsString}`
        }

        const [
            ,
            sign,      
            integer,   
            separator, 
            fraction,  
        ] = valueAsString.match(extractionRegex);

        let formatted = sign;

        if (integer !== '') {
            const cleared = integer.replace(groupSeparatorRegex, '');
            const withGroupSeparators = setGroupSeparators(cleared);

            formatted += withGroupSeparators;
        }

        if (precision && fraction.length < precision) {
            const length = precision - fraction.length;
            const zeroes = new Array(length).fill(0).join('');

            formatted += decimalSeparator;
            formatted += fraction;
            formatted += zeroes;
        } else {
            if (separator !== '') formatted += separator;
            if (fraction !== '') formatted += fraction;
        }

        return formatted;
    }, [groupSeparator, decimalSeparator, extractionRegex, precision]);

    /* ---------------------------------------------------------------------- */
    /* ------------------------------To number------------------------------- */
    /* ---------------------------------------------------------------------- */
    const toNumber = useCallback((value: string): number => {
        if (value === '') {
            return Number.NaN;
        }

        const [
            ,
            sign,     
            integer,  
            separator,
            fraction, 
        ] = value.replace(groupSeparatorRegex, '').match(extractionRegex);

        try {
            let formatted = sign;

            if (integer !== '') formatted += integer;
            if (separator !== '') formatted += DOT_SIGN;
            if (fraction !== '') formatted += fraction;

            return Number(formatted);
        } catch (e) {
            console.warn(e);
        }

        return Number.NaN;
    }, [extractionRegex, groupSeparator]);

    return { toNumber, toString };
};
