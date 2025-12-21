declare module 'cashfree-pg' {
    export const Cashfree: any;
    export const CFEnvironment: any;
}

declare module '@cashfreepayments/cashfree-js' {
    export function load(options: any): Promise<any>;
}
