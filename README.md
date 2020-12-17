# useConverter
React hook for convert value to string from number and vice versa.

## Example of usage
```javascript
import { useConverter } from 'number-converter-hook';

const options = {
    precision: 2,
    groupSeparator: ' ',
    decimalSeparator: ',',
};

export const ViewNumber = (props) => {
    const { value, ...rest } = props;
    const { toString } = useConverter(options);

    return (
        <span {...rest}>
            {toString(value)}
        </span>
    );
};
```

# API
## `useConverter(options: Options): Methods`
#### Arguments
1. `options` (`Options` _required_)
- `options.precision`: (`number` [optional])
- `options.groupSeparator`: (`string` [optional])
- `options.decimalSeparator`: (`string` [optional])

#### Returns
`Methods`: The object contains methods `toString` and `toNumber`.

## `toString(value: number): string`
```javascript
const { toString } = useConverter(options);

toString(123)       // '123,00'
toString(100000.12) // '100 000,12'
toString(-9873.1)   // '-9 873,10'
```

## `toNumber(value: string): number`
```javascript
const { toNumber } = useConverter(options);

toNumber('123')        // 123
toNumber('100 000,12') // 100000.12
toNumber('-9 873,10')  // -9873.10
```

## License
[MIT](LICENSE)